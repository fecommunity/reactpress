// @ts-nocheck
const { spawn, spawnSync } = require('child_process');
const { spawnDevChild } = require('./dev-child-io');
const fs = require('fs');
const path = require('path');
const ora = require('ora');
const { runBuild } = require('./build');
const { ensureProjectEnvironment } = require('./bootstrap');
const {
  loadWebAdminUrl,
  loadClientSiteUrl,
  loadServerSiteUrl,
  getHealthUrl,
  checkHealth,
  waitForHttp,
} = require('./http');
const { printDevReadyBanner } = require('./dev-banner');
const { startDevNginx, stopDevNginx, nginxEntryUrl } = require('./nginx');
const { ensureOriginalCwd, isMonorepoCheckout } = require('./root');
const { detectProjectType, hasWeb, hasToolkit } = require('./project-type');
const {
  hasResolvableActiveTheme,
  hasThemePackages,
  readActiveThemeManifest,
  resolveThemeDirectory,
} = require('./theme-runtime');
const { shouldBuildToolkit } = require('./toolkit-build');
const { buildLocalPlugins } = require('./plugin-build');
const { startThemeSiteWithWatch, stopThemeSite } = require('./theme-dev');
const { scheduleBackgroundThemeBuilds } = require('./theme-prod');
const {
  shouldBlockOnThemeWarmup,
  warmupThemeDevRoutes,
  warmupThemeDevRoutesInBackground,
} = require('./theme-warmup');
const { DEV_PORTS, ensureApiPortFree, ensurePortFree, readEnvPort, isPortListening } =
  require('./ports');
const { ensureDevDatabase, probeMysqlHost } = require('./docker');
const { acquireDevSession, releaseDevSession } = require('./dev-session');
const { checkNodeVersion, checkDocker } = require('./doctor');
const {
  startDevTimer,
  markDevPhase,
  isDevVerbose,
  logDevLine,
  logDevDetail,
  logDevStatus,
  logDevTimingSummary,
} = require('./dev-log');
const { t } = require('./i18n');
const { isDesktopLocalMode, isLocalSqliteMode } = require('./database-mode');
const {
  resolveRemoteThemeApiBase,
  readDevClientApiOrigin,
  normalizeRemoteOrigin,
} = require('./remote-dev');

const CLIENT_READY_TIMEOUT_MS = 120_000;
const API_READY_TIMEOUT_MS = 180_000;
const DEV_POLL_MS = 250;
const DEV_POLL_FAST_MS = 150;

function shouldWaitForThemeInForeground() {
  if (process.env.REACTPRESS_DESKTOP_LOCAL === '1') return true;
  return process.env.REACTPRESS_DEV_WAIT_THEME === '1';
}

function logDevPhase(step, total, messageKey, vars = {}) {
  console.log('');
  console.log(`[reactpress] [${step}/${total}] ${t(messageKey, vars)}`);
}

async function applyAutoLocalDevFallback(projectRoot, { needsLocalApi = true } = {}) {
  if (!needsLocalApi) return false;
  if (isLocalSqliteMode(projectRoot)) {
    process.env.REACTPRESS_SKIP_NGINX = '1';
    return false;
  }
  if (process.env.REACTPRESS_FORCE_MYSQL === '1') return false;

  const docker = checkDocker();
  const mysqlOk = docker.ok ? await probeMysqlHost(projectRoot) : false;
  if (docker.ok && mysqlOk) return false;

  process.env.REACTPRESS_LOCAL_MODE = '1';
  process.env.REACTPRESS_SKIP_NGINX = '1';
  console.log('');
  console.log(`[reactpress] ${t(docker.ok ? 'dev.autoLocalNoMysql' : 'dev.autoLocalNoDocker')}`);
  return true;
}

function desktopPhaseKey(defaultKey) {
  if (isLocalSqliteMode()) {
    const localMap = {
      'dev.phasePrerequisites': 'dev.phasePrerequisitesDesktop',
      'dev.phaseInfra': 'dev.phaseInfraDesktop',
      'dev.phaseServices': 'dev.phaseServicesLocalWeb',
    };
    if (localMap[defaultKey]) return localMap[defaultKey];
  }
  if (!isDesktopLocalMode()) return defaultKey;
  const map = {
    'dev.phasePrerequisites': 'dev.phasePrerequisitesDesktop',
    'dev.phaseInfra': 'dev.phaseInfraDesktop',
    'dev.phaseServices': 'dev.phaseServicesDesktop',
  };
  return map[defaultKey] || defaultKey;
}

function formatDevFailureHint() {
  return [
    t('dev.nextSteps'),
    t('dev.nextDoctor'),
    t('dev.nextDocker'),
    t('dev.nextEnv'),
  ].join('\n');
}

let apiChild;
let webChild;
let desktopChild;
let shuttingDown = false;
let nginxEnabled = false;
/** When false, admin/API child exit during startup must not tear down the stack. */
let devServicesReady = false;

function shutdown(signal = 'SIGINT') {
  if (shuttingDown) return;
  shuttingDown = true;
  stopThemeSite();
  if (nginxEnabled) stopDevNginx(ensureOriginalCwd());
  const stopEmbeddedApi =
    signal === 'SIGINT' || devServicesReady || !isDesktopLocalMode();
  if (stopEmbeddedApi) {
    try {
      const { stopLocalServer } = require(path.join(ensureOriginalCwd(), 'desktop/out/main/local-server.js'));
      stopLocalServer();
    } catch {
      // desktop local API not running
    }
  }
  if (desktopChild && !desktopChild.killed) desktopChild.kill(signal);
  if (webChild && !webChild.killed) webChild.kill(signal);
  if (apiChild && !apiChild.killed) apiChild.kill(signal);
  try {
    releaseDevSession(ensureOriginalCwd());
  } catch {
    // ignore
  }
}

async function buildToolkit(projectRoot) {
  if (!hasToolkit(projectRoot)) return;
  if (!shouldBuildToolkit(projectRoot)) {
    logDevDetail('dev.toolkitUpToDate');
  } else {
    await runBuild('toolkit', projectRoot);
  }
  try {
    buildLocalPlugins(projectRoot);
  } catch (err) {
    console.error(`[reactpress] ${err.message || err}`);
    throw err;
  }
}

async function spawnApi(projectRoot) {
  const { reused, port: apiPort } = await ensureApiPortFree(projectRoot, { allowReuse: true });
  if (reused) {
    logDevStatus('dev.apiReusing', { port: apiPort });
    return { reused: true, port: apiPort };
  }

  const apiDevRunner = path.join(__dirname, 'api-dev-runner.js');
  logDevStatus('dev.startingApi');
  apiChild = spawn(process.execPath, [apiDevRunner], {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: projectRoot,
      REACTPRESS_DEV_SESSION_PID: String(process.pid),
      REACTPRESS_DEV_DB_READY: '1',
      REACTPRESS_DEV_PORTS_READY: '1',
    },
  });

  apiChild.on('close', (code) => {
    if (shuttingDown) {
      process.exit(code ?? 0);
      return;
    }
    if (webChild && !webChild.killed) webChild.kill('SIGINT');
    process.exit(code ?? 1);
  });
  return { reused: false, port: apiPort };
}

async function waitForApiReady(
  projectRoot,
  { readyMessageKey = 'dev.apiReady', alreadyHealthy = false } = {},
) {
  const healthUrl = getHealthUrl(projectRoot);
  const apiPort = readEnvPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API);

  if (alreadyHealthy) {
    const health = await checkHealth(healthUrl, 2000);
    if (health.ok) {
      logDevStatus(readyMessageKey);
      return;
    }
  }

  const useSpinner = isDevVerbose() && process.stdout.isTTY;
  const spinner = useSpinner
    ? ora({
        text: t('dev.waitingApi', { url: healthUrl }),
        color: 'magenta',
        spinner: 'dots',
      }).start()
    : null;
  if (!useSpinner) logDevStatus('dev.waitingApiQuiet');

  const deadline = Date.now() + API_READY_TIMEOUT_MS;
  let lastHint = '';

  while (Date.now() < deadline) {
    if (!isPortListening(apiPort)) {
      lastHint = t('dev.waitingApiCompile', { port: apiPort });
      if (spinner) {
        spinner.text = `${t('dev.waitingApi', { url: healthUrl })} — ${lastHint}`;
      }
      await new Promise((r) => setTimeout(r, DEV_POLL_MS));
      continue;
    }

    const health = await checkHealth(healthUrl, 2500);
    if (health.ok) {
      if (spinner) spinner.succeed(t(readyMessageKey));
      else logDevStatus(readyMessageKey);
      return;
    }

    if (health.data?.database === 'down') {
      lastHint = t('dev.healthDbDown');
    } else if (health.statusCode === 200 && health.data?.status === 'degraded') {
      lastHint = t('dev.healthDegraded');
    } else if (health.statusCode === 0) {
      lastHint = t('dev.waitingApiStarting');
    } else if (health.statusCode > 0) {
      lastHint = `HTTP ${health.statusCode}`;
    }

    if (spinner && lastHint) {
      spinner.text = `${t('dev.waitingApi', { url: healthUrl })} — ${lastHint}`;
    }
    await new Promise((r) => setTimeout(r, DEV_POLL_FAST_MS));
  }

  if (spinner) spinner.fail(t('dev.apiTimeout', { seconds: API_READY_TIMEOUT_MS / 1000 }));
  else console.error(t('dev.apiTimeout', { seconds: API_READY_TIMEOUT_MS / 1000 }));
  shutdown('SIGINT');
  process.exit(1);
}

function handlePrimaryDevChildClose(code, label = 'dev', projectRoot = ensureOriginalCwd()) {
  if (!devServicesReady) {
    console.warn(
      `[reactpress] ${label} process exited during startup (code ${code ?? 'unknown'}) — waiting for services…`,
    );
    return;
  }
  const adminPort = readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB);
  if (isDesktopLocalMode() && label === 'Admin dev') {
    return;
  }
  if (label === 'Admin dev' && isPortListening(adminPort)) {
    return;
  }
  if (!shuttingDown) shutdown('SIGINT');
  process.exit(code ?? 0);
}

async function spawnAdminWeb(
  projectRoot,
  {
    behindNginx = false,
    integratedStack = false,
    adminApiOrigin = null,
    waitForReady = true,
  } = {},
) {
  const adminPort = readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB);
  await ensurePortFree(adminPort, { label: 'admin' });

  logDevDetail('dev.startingAdmin', { url: loadWebAdminUrl(projectRoot) });
  const adminEnv = {
    ...process.env,
    REACTPRESS_ORIGINAL_CWD: projectRoot,
    WEB_ADMIN_PORT: String(adminPort),
  };
  if (nginxEnabled && process.env.REACTPRESS_NGINX_ENTRY_URL) {
    adminEnv.REACTPRESS_NGINX_ENTRY_URL = process.env.REACTPRESS_NGINX_ENTRY_URL;
  } else {
    adminEnv.REACTPRESS_SKIP_DEV_PORT_REDIRECT = '1';
  }
  if (behindNginx) {
    adminEnv.VITE_ADMIN_BASE = '/admin/';
    process.env.REACTPRESS_BEHIND_NGINX = '1';
  }
  // Full stack (API + theme site): theme install/activate must hit Nest, not MSW.
  if (integratedStack || adminApiOrigin) {
    adminEnv.VITE_ENABLE_MOCK = 'false';
    adminEnv.VITE_AUTH_MODE = 'server';
    if (adminApiOrigin) {
      // Vite proxies `/api` → `${target}/api/...`; target is host-only origin.
      adminEnv.VITE_DEV_API_PROXY_TARGET = normalizeRemoteOrigin(adminApiOrigin) || adminApiOrigin;
    } else if (isDesktopLocalMode() && process.env.REACTPRESS_DESKTOP_LOCAL_API) {
      // Desktop dev embeds SQLite API on a dedicated port (default :13102), not :3002.
      adminEnv.VITE_DEV_API_PROXY_TARGET = process.env.REACTPRESS_DESKTOP_LOCAL_API.replace(
        /\/api\/?$/,
        '',
      );
    } else {
      adminEnv.VITE_DEV_API_PROXY_TARGET = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
    }
  }

  webChild = isDesktopLocalMode()
    ? spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['exec', 'vp', 'dev'], {
        cwd: path.join(projectRoot, 'web'),
        env: adminEnv,
        stdio: 'inherit',
        shell: process.platform === 'win32',
      })
    : spawnDevChild('pnpm', ['run', '--dir', './web', 'dev'], {
        shell: true,
        cwd: projectRoot,
        env: adminEnv,
      });

  webChild.on('close', (code) => {
    handlePrimaryDevChildClose(code, 'Admin dev', projectRoot);
  });

  if (!waitForReady) return Promise.resolve(true);

  const readyUrl = loadWebAdminUrl(projectRoot);
  return waitForHttp(readyUrl, CLIENT_READY_TIMEOUT_MS, DEV_POLL_MS).then((ready) => {
    if (!ready) {
      console.warn(
        t('dev.adminSlow', {
          seconds: CLIENT_READY_TIMEOUT_MS / 1000,
          url: readyUrl,
        }),
      );
    }
    return ready;
  });
}

function assertDevPrerequisites() {
  const node = checkNodeVersion();
  if (!node.ok) {
    console.error(`[reactpress] ${node.message}`);
    if (node.fix) console.error(`  → ${node.fix}`);
    console.error(formatDevFailureHint());
    process.exit(1);
  }
  if (!isLocalSqliteMode()) {
    const docker = checkDocker();
    if (!docker.ok) {
      console.error(`[reactpress] ${docker.message}`);
      if (docker.fix) console.error(`  → ${docker.fix}`);
      console.error(formatDevFailureHint());
      process.exit(1);
    }
  }
  logDevStatus(
    isDesktopLocalMode() || process.env.REACTPRESS_LOCAL_MODE === '1'
      ? 'dev.prerequisitesOkDesktop'
      : 'dev.prerequisitesOk',
    { version: process.version },
  );
}

async function prepareDevInfrastructure(projectRoot, { needsLocalApi = true } = {}) {
  await acquireDevSession(projectRoot);
  if (isLocalSqliteMode(projectRoot)) {
    const { ensureLocalSite } = require('../core/services/local-site');
    const { ensureSqliteDatabase } = require('../core/services/database/sqlite');
    const { syncEnvFromConfig, loadConfig } = require('../core/services/config');
    const { getMonorepoRoot } = require('./root');
    const port = readEnvPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API);
    if (process.env.REACTPRESS_LOCAL_MODE === '1') {
      ensureLocalSite(projectRoot, port, { monorepoRoot: getMonorepoRoot() });
    } else {
      const config = await loadConfig(projectRoot);
      await syncEnvFromConfig(projectRoot, config);
    }
    const sqliteResult = await ensureSqliteDatabase(projectRoot);
    if (!sqliteResult.ok) {
      throw new Error(sqliteResult.message || 'SQLite 数据库未就绪');
    }
    nginxEnabled = false;
    delete process.env.REACTPRESS_NGINX_ENTRY_URL;
    process.env.REACTPRESS_SKIP_DEV_PORT_REDIRECT = '1';
    return;
  }
  const planNginx = process.env.REACTPRESS_SKIP_NGINX !== '1';
  const clientApiOrigin = readDevClientApiOrigin(projectRoot);

  const [, nginxResult] = await Promise.all([
    needsLocalApi ? ensureDevDatabase(projectRoot, { quiet: true }) : Promise.resolve(true),
    planNginx ? startDevNginx(projectRoot) : Promise.resolve(false),
  ]);

  nginxEnabled = nginxResult;
  if (nginxEnabled) {
    process.env.REACTPRESS_NGINX_ENTRY_URL = nginxEntryUrl(projectRoot);
    delete process.env.REACTPRESS_SKIP_DEV_PORT_REDIRECT;
    if (clientApiOrigin) {
      logDevStatus('dev.nginxReadyRemote', {
        url: nginxEntryUrl(projectRoot),
        api: clientApiOrigin,
      });
    } else {
      logDevStatus('dev.nginxReady', { url: nginxEntryUrl(projectRoot) });
    }
  } else {
    delete process.env.REACTPRESS_NGINX_ENTRY_URL;
    process.env.REACTPRESS_SKIP_DEV_PORT_REDIRECT = '1';
  }
}

async function startDevStack(
  projectRoot,
  {
    webOnly = false,
    themeOnly = false,
    desktopMode = false,
    localWebMode = false,
    infraDone = false,
    apiOrigins = { admin: null, client: null, needsLocalApi: true },
  } = {},
) {
  const { admin: adminApiOrigin, client: clientApiOrigin, needsLocalApi } = apiOrigins;
  if (!infraDone) {
    logDevPhase(1, 3, desktopPhaseKey('dev.phasePrerequisites'));
    assertDevPrerequisites();
    logDevPhase(2, 3, desktopPhaseKey('dev.phaseInfra'));
    try {
      await prepareDevInfrastructure(projectRoot, { needsLocalApi });
    } catch (err) {
      console.error(t('dev.dbEnsureFailed', { message: err.message || err }));
      console.error(formatDevFailureHint());
      process.exit(1);
    }
  } else if (
    needsLocalApi &&
    !isLocalSqliteMode(projectRoot) &&
    !(await probeMysqlHost(projectRoot))
  ) {
    console.error(
      t('dev.dbEnsureFailed', {
        message: t('docker.devStartBlocked', {
          port: readEnvPort(projectRoot, 'DB_PORT', DEV_PORTS.MYSQL),
        }),
      }),
    );
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  const includeAdmin = webOnly && hasWeb(projectRoot);
  // Always run theme watchers when packages exist — admin activate/preview writes manifests
  // and relies on fs.watch even if the current active theme is not yet resolvable.
  const includeThemeSite =
    themeOnly ||
    (desktopMode && hasThemePackages(projectRoot)) ||
    (!webOnly && hasThemePackages(projectRoot));
  if (!webOnly && !themeOnly && includeThemeSite && !hasResolvableActiveTheme(projectRoot)) {
    const { activeTheme } = readActiveThemeManifest(projectRoot);
    console.warn(
      `[reactpress] ${t('themeDev.notFound', { id: activeTheme })} — ${t('dev.themeSiteSkipped')}`,
    );
  }
  if (includeThemeSite) {
    const { validateBundledThemes, validateCatalogThemes } = require('./theme-registry');
    const bundled = validateBundledThemes(projectRoot);
    if (bundled.missing.length) {
      console.warn(
        `[reactpress] themes/package.json lists bundled theme(s) without theme.json: ${bundled.missing.join(', ')}`,
      );
    }
    const catalog = validateCatalogThemes(projectRoot);
    if (catalog.missing.length) {
      console.warn(
        `[reactpress] themes/package.json lists catalog dir(s) without reactpress.theme in package.json: ${catalog.missing.join(', ')}`,
      );
    }
  }
  const planNginx = process.env.REACTPRESS_SKIP_NGINX !== '1';
  const includeWebInStack = hasWeb(projectRoot) && !webOnly && !themeOnly;

  if (infraDone) {
    logDevPhase(
      3,
      3,
      localWebMode ? 'dev.phaseServicesLocalWeb' : desktopPhaseKey('dev.phaseServices'),
    );
  }

  markDevPhase('services');
  const readinessWaits = [];
  let apiSpawn = null;

  const prewarmPreviewBuilds =
    includeThemeSite &&
    isDesktopLocalMode() &&
    process.env.REACTPRESS_SKIP_PREVIEW_BUILD !== '1';
  if (prewarmPreviewBuilds) {
    const { warmupAllPreviewThemeBuilds } = require('./theme-prod');
    logDevStatus('dev.previewPrewarmStarting');
    readinessWaits.push(warmupAllPreviewThemeBuilds(projectRoot));
  }

  if (adminApiOrigin || clientApiOrigin) {
    if (adminApiOrigin) {
      logDevStatus('dev.adminApiRemote', { url: adminApiOrigin });
    }
    if (clientApiOrigin) {
      logDevStatus('dev.clientApiRemote', { url: clientApiOrigin });
    }
  }
  if (needsLocalApi) {
    logDevStatus('dev.phaseApi');
    apiSpawn = await spawnApi(projectRoot);
    const readyMessageKey = webOnly || hasWeb(projectRoot) ? 'dev.apiReadyAdmin' : 'dev.apiReady';
    readinessWaits.push(
      waitForApiReady(projectRoot, {
        readyMessageKey,
        alreadyHealthy: Boolean(apiSpawn?.reused),
      }),
    );
  }

  if (!includeAdmin && !includeThemeSite && !includeWebInStack) {
    await Promise.all(readinessWaits);
    printDevReadyBanner(projectRoot, { apiOnly: true, nginx: nginxEnabled });
    console.log(t('dev.standaloneHint'));
    return;
  }

  const waitThemeInForeground = includeThemeSite && shouldWaitForThemeInForeground();
  let themeSiteStarted = false;

  if (includeWebInStack) {
    logDevDetail('dev.phaseAdmin');
    if (planNginx) process.env.REACTPRESS_BEHIND_NGINX = '1';
    logDevDetail('dev.startingAdmin', { url: loadWebAdminUrl(projectRoot) });
    spawnAdminWeb(projectRoot, {
      behindNginx: planNginx,
      integratedStack: true,
      adminApiOrigin,
      waitForReady: false,
    });
    const adminBase = loadWebAdminUrl(projectRoot).replace(/\/$/, '');
    const adminProbe = planNginx ? `${adminBase}/admin/` : `${adminBase}/`;
    readinessWaits.push(waitForHttp(adminProbe, 120_000, DEV_POLL_MS));
  } else if (includeAdmin) {
    logDevDetail('dev.phaseAdmin');
    spawnAdminWeb(projectRoot, {
      behindNginx: desktopMode || localWebMode ? false : planNginx,
      integratedStack: desktopMode || localWebMode || isLocalSqliteMode(),
      adminApiOrigin,
      waitForReady: false,
    });
    const adminBase = loadWebAdminUrl(projectRoot).replace(/\/$/, '');
    const adminProbe = planNginx ? `${adminBase}/admin/` : `${adminBase}/`;
    readinessWaits.push(waitForHttp(adminProbe, 120_000, DEV_POLL_MS));
  }

  if (includeThemeSite) {
    const { activeTheme } = readActiveThemeManifest(projectRoot);
    logDevStatus('dev.themeStarting', {
      id: activeTheme,
      port: readEnvPort(projectRoot, 'CLIENT_PORT', DEV_PORTS.VISITOR),
    });
    if (planNginx) process.env.REACTPRESS_BEHIND_NGINX = '1';
    if (clientApiOrigin) {
      delete process.env.REACTPRESS_DEV_FORCE_LOCAL_THEME_API;
      const themeApiBase = resolveRemoteThemeApiBase(clientApiOrigin);
      process.env.REACTPRESS_THEME_API_URL = themeApiBase;
      process.env.REACTPRESS_THEME_PUBLIC_API_URL = planNginx
        ? `${nginxEntryUrl(projectRoot).replace(/\/$/, '')}/api`
        : themeApiBase;
      const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
      if (themeDir) {
        const nextCache = path.join(themeDir, '.next');
        if (fs.existsSync(nextCache)) {
          fs.rmSync(nextCache, { recursive: true, force: true });
          logDevDetail('dev.themeCacheClearedForRemote');
        }
      }
    } else {
      process.env.REACTPRESS_DEV_FORCE_LOCAL_THEME_API = '1';
    }
    const themeBoot = startThemeSiteWithWatch(projectRoot);
    const themeWait = themeBoot.then(async (started) => {
      themeSiteStarted = started;
      if (!started) return false;
      const clientUrl = loadClientSiteUrl(projectRoot);
      const port = readEnvPort(projectRoot, 'CLIENT_PORT', DEV_PORTS.VISITOR);
      const portOpen = await (async () => {
        const deadline = Date.now() + 120_000;
        while (Date.now() < deadline) {
          if (isPortListening(port)) return true;
          await new Promise((r) => setTimeout(r, DEV_POLL_MS));
        }
        return false;
      })();
      if (portOpen) {
        if (isDesktopLocalMode()) {
          const { warmupThemeHomepage } = require('./theme-warmup');
          await warmupThemeHomepage(projectRoot, clientUrl);
        } else if (shouldBlockOnThemeWarmup()) {
          await warmupThemeDevRoutes(projectRoot);
        } else {
          warmupThemeDevRoutesInBackground(projectRoot);
        }
      }
      return portOpen;
    });
    if (waitThemeInForeground) {
      readinessWaits.push(themeWait);
    } else {
      themeWait.then((ready) => {
        if (ready) logDevDetail('dev.themeReadyQuiet', { url: loadClientSiteUrl(projectRoot) });
      }).catch(() => {});
    }
  }

  if (readinessWaits.length > 1) {
    logDevStatus('dev.waitingProxies');
  }
  await Promise.all(readinessWaits);
  if (readinessWaits.length > 1) {
    logDevStatus('dev.proxiesReady');
  }

  if (includeWebInStack && planNginx && nginxEnabled) {
    const adminViaNginx = `${nginxEntryUrl(projectRoot).replace(/\/$/, '')}/admin/`;
    waitForHttp(adminViaNginx, 15_000, DEV_POLL_MS).then((adminOk) => {
      if (!adminOk) {
        console.warn(t('dev.adminNginxSlow', { url: adminViaNginx }));
      }
    });
  } else if (planNginx && !nginxEnabled) {
    startDevNginx(projectRoot).then((enabled) => {
      nginxEnabled = enabled;
      if (enabled) {
        console.log(t('dev.nginxReady', { url: nginxEntryUrl(projectRoot) }));
      }
    });
  }

  let dbOk = true;
  if (needsLocalApi) {
    if (isDesktopLocalMode() || isLocalSqliteMode(projectRoot)) {
      const { probeSqliteDatabase } = require('../core/services/database/sqlite');
      dbOk = (await probeSqliteDatabase(projectRoot)).ok;
    } else {
      dbOk = await probeMysqlHost(projectRoot);
    }
  }
  if (needsLocalApi && !dbOk && !isDesktopLocalMode() && !isLocalSqliteMode(projectRoot)) {
    console.warn(t('dev.mysqlUnreachable'));
  }

  if (includeThemeSite && process.env.REACTPRESS_SKIP_PREVIEW_BUILD !== '1' && !prewarmPreviewBuilds) {
    const { activeTheme } = readActiveThemeManifest(projectRoot);
    scheduleBackgroundThemeBuilds(projectRoot, { excludeThemeId: activeTheme });
  }

  printDevReadyBanner(projectRoot, {
    webOnly: (includeAdmin && !includeThemeSite) || localWebMode,
    desktop: desktopMode && !localWebMode,
    localWeb: localWebMode,
    nginx: nginxEnabled,
    hasThemeSite: includeThemeSite,
    dbOk,
    adminApiOrigin,
    clientApiOrigin,
    localApiUrl: isDesktopLocalMode() ? process.env.REACTPRESS_DESKTOP_LOCAL_API || null : null,
    dbType:
      isDesktopLocalMode() || isLocalSqliteMode(projectRoot)
        ? 'sqlite'
        : needsLocalApi
          ? 'mysql'
          : null,
  });

  logDevTimingSummary({
    apiReused: Boolean(apiSpawn?.reused),
  });

  devServicesReady = true;
}

async function runDevStartup(
  projectRoot,
  {
    webOnly = false,
    themeOnly = false,
    desktopMode = false,
    localWebMode = false,
    skipPrepareInfra = false,
    apiOrigins = { admin: null, client: null, needsLocalApi: true },
  } = {},
) {
  startDevTimer();
  try {
    const result = await ensureProjectEnvironment(projectRoot, { skipDatabase: true });
    if (result.message && isDevVerbose()) console.log(`[reactpress] ${result.message}`);
  } catch (err) {
    console.error(t('dev.envFailed'), err.message || err);
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  await applyAutoLocalDevFallback(projectRoot, { needsLocalApi: apiOrigins.needsLocalApi });

  logDevPhase(1, 3, desktopPhaseKey('dev.phasePrerequisites'));
  assertDevPrerequisites();

  logDevPhase(2, 3, desktopPhaseKey('dev.phaseInfra'));
  try {
    const infraTasks = [buildToolkit(projectRoot)];
    if (!skipPrepareInfra) {
      infraTasks.unshift(
        prepareDevInfrastructure(projectRoot, { needsLocalApi: apiOrigins.needsLocalApi }),
      );
    }
    await Promise.all(infraTasks);
    markDevPhase('infra');
  } catch (err) {
    console.error(t('dev.dbEnsureFailed', { message: err.message || err }));
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  await startDevStack(projectRoot, {
    webOnly,
    themeOnly,
    desktopMode,
    localWebMode,
    infraDone: true,
    apiOrigins,
  });
}

function loadDesktopBootstrap(projectRoot) {
  return require(path.join(projectRoot, 'desktop/scripts/bootstrap-local-api.cjs'));
}

async function startDesktopLocalApi(projectRoot, { forceRestart = false } = {}) {
  const desktopDir = path.join(projectRoot, 'desktop');
  if (!fs.existsSync(path.join(desktopDir, 'package.json'))) {
    console.error(`[reactpress] ${t('dev.desktopMissing')}`);
    process.exit(1);
  }

  const boot = await loadDesktopBootstrap(projectRoot);
  console.log('');
  logDevStatus('dev.desktopLocalApiStarting');
  const { siteRoot, localApiBase } = await boot.startDesktopLocalApi(projectRoot, { forceRestart });
  process.env.REACTPRESS_DESKTOP_LOCAL_API = localApiBase;
  process.env.REACTPRESS_DESKTOP_SITE_ROOT = siteRoot;
  process.env.REACTPRESS_THEME_API_URL = localApiBase;
  process.env.REACTPRESS_THEME_PUBLIC_API_URL = localApiBase;
  const localApiOrigin = localApiBase.replace(/\/api\/?$/, '');
  process.env.VITE_DEV_API_PROXY_TARGET = localApiOrigin;
  logDevStatus('dev.desktopLocalApiReady', { url: localApiBase, db: t('dev.dbTypeSqlite') });
  return { siteRoot, localApiBase };
}

async function ensureDesktopLocalApiHealthy(projectRoot, { forceRestart = false } = {}) {
  if (!isDesktopLocalMode()) return true;
  const base = process.env.REACTPRESS_DESKTOP_LOCAL_API?.trim();
  if (!base) return false;
  const healthUrl = `${base.replace(/\/api\/?$/, '')}/api/health`;
  const health = await checkHealth(healthUrl, 2500);
  if (health.ok && !forceRestart) return true;
  console.warn('[reactpress] Local API unreachable — restarting embedded SQLite API…');
  await startDesktopLocalApi(projectRoot, { forceRestart: true });
  const retry = await checkHealth(healthUrl, 5000);
  if (!retry.ok) {
    console.warn(`[reactpress] Local API still unhealthy after restart (${healthUrl})`);
  }
  return retry.ok;
}

function registerDevShutdownHandlers(projectRoot) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => {
    // Stray SIGTERM during local web boot must not tear down the embedded API (Vite still starting).
    if (!devServicesReady && isDesktopLocalMode()) return;
    shutdown('SIGTERM');
  });
  process.on('exit', () => {
    try {
      releaseDevSession(projectRoot);
    } catch {
      // ignore
    }
  });
}

/** Block until the primary dev child exits (admin Vite, Electron shell, or Nest API). */
function waitUntilDevChildExit(projectRoot = ensureOriginalCwd()) {
  return new Promise((resolve) => {
    const adminPort = readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB);

    const waitForShutdownSignal = () => {
      const onSignal = () => resolve(0);
      process.once('SIGINT', onSignal);
      process.once('SIGTERM', onSignal);
    };

    const child = webChild || desktopChild || apiChild;
    if (!child) {
      waitForShutdownSignal();
      return;
    }

    const finish = (code) => {
      if (child === webChild && isPortListening(adminPort)) {
        waitForShutdownSignal();
        return;
      }
      resolve(code ?? 0);
    };

    if (child.exitCode != null) {
      finish(child.exitCode);
      return;
    }
    if (child.killed) {
      finish(1);
      return;
    }
    child.once('close', (code) => finish(code));
  });
}

function canUseDesktopLocalStack(projectRoot) {
  return (
    isMonorepoCheckout(projectRoot) &&
    fs.existsSync(path.join(projectRoot, 'desktop', 'package.json'))
  );
}

async function spawnDesktopApp(projectRoot) {
  const desktopDir = path.join(projectRoot, 'desktop');
  if (!fs.existsSync(path.join(desktopDir, 'package.json'))) {
    console.error(`[reactpress] ${t('dev.desktopMissing')}`);
    shutdown('SIGINT');
    process.exit(1);
  }

  const adminUrl = loadWebAdminUrl(projectRoot).replace(/\/$/, '');
  logDevStatus('dev.desktopStarting', { url: adminUrl });

  const boot = await loadDesktopBootstrap(projectRoot);
  boot.ensureDesktopBuilt(projectRoot);

  desktopChild = spawnDevChild(
    'pnpm',
    ['exec', 'cross-env', `VITE_DEV_SERVER_URL=${adminUrl}`, 'ELECTRON_IS_DEV=1', 'pnpm', 'run', 'dev:shell'],
    {
      shell: true,
      cwd: desktopDir,
      env: {
        ...process.env,
        REACTPRESS_ORIGINAL_CWD: projectRoot,
        VITE_DEV_SERVER_URL: adminUrl,
        ELECTRON_IS_DEV: '1',
      },
    },
  );

  desktopChild.on('close', (code) => {
    handlePrimaryDevChildClose(code, 'Desktop shell');
  });
}

async function runLocalMonorepoDev(projectRoot = ensureOriginalCwd()) {
  if (!hasWeb(projectRoot)) {
    console.error(t('dev.noWeb'));
    process.exit(1);
  }

  process.env.REACTPRESS_SKIP_NGINX = '1';
  process.env.REACTPRESS_DESKTOP_LOCAL = '1';
  registerDevShutdownHandlers(projectRoot);

  console.log('');
  logDevLine('dev.localFullIntro');

  await prepareDevInfrastructure(projectRoot, { needsLocalApi: false });
  await startDesktopLocalApi(projectRoot, { forceRestart: true });

  await runDevStartup(projectRoot, {
    skipPrepareInfra: true,
    apiOrigins: { admin: null, client: null, needsLocalApi: false },
  });
  await ensureDesktopLocalApiHealthy(projectRoot);
  await new Promise((resolve) => {
    const interval = setInterval(() => {
      void ensureDesktopLocalApiHealthy(projectRoot).catch(() => {});
    }, 20_000);
    const onStop = (signal) => {
      clearInterval(interval);
      shutdown(signal);
      resolve(0);
    };
    process.once('SIGINT', () => onStop('SIGINT'));
    process.once('SIGTERM', () => onStop('SIGTERM'));
  });
  process.exit(0);
}

async function runDesktopDev(projectRoot = ensureOriginalCwd()) {
  if (!hasWeb(projectRoot)) {
    console.error(t('dev.noWeb'));
    process.exit(1);
  }

  process.env.REACTPRESS_SKIP_NGINX = '1';
  process.env.REACTPRESS_DESKTOP_LOCAL = '1';
  registerDevShutdownHandlers(projectRoot);

  console.log('');
  logDevLine('dev.desktopIntro');

  await prepareDevInfrastructure(projectRoot, { needsLocalApi: false });
  await startDesktopLocalApi(projectRoot, { forceRestart: true });

  await runDevStartup(projectRoot, {
    webOnly: true,
    desktopMode: true,
    skipPrepareInfra: true,
    apiOrigins: { admin: null, client: null, needsLocalApi: false },
  });
  await spawnDesktopApp(projectRoot);
  const exitCode = await waitUntilDevChildExit(projectRoot);
  process.exit(exitCode);
}

async function runLocalWebDev(
  projectRoot = ensureOriginalCwd(),
  { apiOrigins = { admin: null, client: null, needsLocalApi: true } } = {},
) {
  if (!hasWeb(projectRoot)) {
    console.error(t('dev.noWeb'));
    process.exit(1);
  }

  registerDevShutdownHandlers(projectRoot);

  if (canUseDesktopLocalStack(projectRoot)) {
    delete process.env.REACTPRESS_LOCAL_MODE;
    process.env.REACTPRESS_SKIP_NGINX = '1';
    process.env.REACTPRESS_DESKTOP_LOCAL = '1';

    console.log('');
    logDevLine('dev.localWebIntro');

    await prepareDevInfrastructure(projectRoot, { needsLocalApi: false });
    await startDesktopLocalApi(projectRoot, { forceRestart: true });

    await runDevStartup(projectRoot, {
      webOnly: true,
      desktopMode: true,
      localWebMode: true,
      skipPrepareInfra: true,
      apiOrigins: { admin: null, client: null, needsLocalApi: false },
    });
    await ensureDesktopLocalApiHealthy(projectRoot);
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        void ensureDesktopLocalApiHealthy(projectRoot).catch(() => {});
      }, 20_000);
      const onStop = (signal) => {
        clearInterval(interval);
        shutdown(signal);
        resolve(0);
      };
      process.once('SIGINT', () => onStop('SIGINT'));
      process.once('SIGTERM', () => onStop('SIGTERM'));
    });
    process.exit(0);
    return;
  }

  process.env.REACTPRESS_LOCAL_MODE = '1';
  process.env.REACTPRESS_SKIP_NGINX = '1';

  console.log('');
  logDevLine('dev.localWebIntro');

  await runDevStartup(projectRoot, { webOnly: true, apiOrigins });
}

async function runThemeDev(
  projectRoot = ensureOriginalCwd(),
  { apiOrigins = { admin: null, client: null, needsLocalApi: true } } = {},
) {
  if (!hasResolvableActiveTheme(projectRoot)) {
    console.error(t('dev.themeSiteSkipped'));
    process.exit(1);
  }

  process.env.REACTPRESS_THEME_DEV_ONLY = '1';

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('exit', () => {
    try {
      releaseDevSession(projectRoot);
    } catch {
      // ignore
    }
  });

  await runDevStartup(projectRoot, { themeOnly: true, apiOrigins });
}

async function runWebDev(
  projectRoot = ensureOriginalCwd(),
  { apiOrigins = { admin: null, client: null, needsLocalApi: true } } = {},
) {
  if (!hasWeb(projectRoot)) {
    console.error(t('dev.noWeb'));
    process.exit(1);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('exit', () => {
    try {
      releaseDevSession(projectRoot);
    } catch {
      // ignore
    }
  });

  await runDevStartup(projectRoot, { webOnly: true, apiOrigins });
}

async function runDev(
  projectRoot = ensureOriginalCwd(),
  { apiOrigins = { admin: null, client: null, needsLocalApi: true } } = {},
) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('exit', () => {
    try {
      releaseDevSession(projectRoot);
    } catch {
      // ignore
    }
  });

  await runDevStartup(projectRoot, { apiOrigins });
}

module.exports = {
  runDev,
  runWebDev,
  runLocalWebDev,
  runLocalMonorepoDev,
  runThemeDev,
  runDesktopDev,
  runDevStartup,
  buildToolkit,
  assertDevPrerequisites,
  applyAutoLocalDevFallback,
  prepareDevInfrastructure,
  startDevStack,
  detectProjectType,
  nginxEntryUrl,
};
