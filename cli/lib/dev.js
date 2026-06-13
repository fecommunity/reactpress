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
const { ensureOriginalCwd } = require('./root');
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
  return process.env.REACTPRESS_DEV_WAIT_THEME === '1';
}

function logDevPhase(step, total, messageKey, vars = {}) {
  console.log('');
  console.log(`[reactpress] [${step}/${total}] ${t(messageKey, vars)}`);
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

function shutdown(signal = 'SIGINT') {
  if (shuttingDown) return;
  shuttingDown = true;
  stopThemeSite();
  if (nginxEnabled) stopDevNginx(ensureOriginalCwd());
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
    } else {
      adminEnv.VITE_DEV_API_PROXY_TARGET = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
    }
  }

  webChild = spawnDevChild('pnpm', ['run', '--dir', './web', 'dev'], {
    shell: true,
    cwd: projectRoot,
    env: adminEnv,
  });

  webChild.on('close', (code) => {
    if (!shuttingDown) shutdown('SIGINT');
    process.exit(code ?? 0);
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
  const docker = checkDocker();
  if (!docker.ok) {
    console.error(`[reactpress] ${docker.message}`);
    if (docker.fix) console.error(`  → ${docker.fix}`);
    console.error(formatDevFailureHint());
    process.exit(1);
  }
  logDevStatus('dev.prerequisitesOk', { version: process.version });
}

async function prepareDevInfrastructure(projectRoot, { needsLocalApi = true } = {}) {
  await acquireDevSession(projectRoot);
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
    infraDone = false,
    apiOrigins = { admin: null, client: null, needsLocalApi: true },
  } = {},
) {
  const { admin: adminApiOrigin, client: clientApiOrigin, needsLocalApi } = apiOrigins;
  if (!infraDone) {
    logDevPhase(1, 3, 'dev.phasePrerequisites');
    assertDevPrerequisites();
    logDevPhase(2, 3, 'dev.phaseInfra');
    try {
      await prepareDevInfrastructure(projectRoot, { needsLocalApi });
    } catch (err) {
      console.error(t('dev.dbEnsureFailed', { message: err.message || err }));
      console.error(formatDevFailureHint());
      process.exit(1);
    }
  } else if (needsLocalApi && !(await probeMysqlHost(projectRoot))) {
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
  const includeThemeSite = themeOnly || (!webOnly && hasThemePackages(projectRoot));
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
    logDevPhase(3, 3, 'dev.phaseServices');
  }

  markDevPhase('services');
  const readinessWaits = [];
  let apiSpawn = null;

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
      behindNginx: desktopMode ? false : planNginx,
      integratedStack: desktopMode ? true : false,
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
      if (!started) return true;
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
        if (shouldBlockOnThemeWarmup()) {
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
      });
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

  const dbOk = needsLocalApi ? await probeMysqlHost(projectRoot) : true;
  if (needsLocalApi && !dbOk) {
    console.warn(t('dev.mysqlUnreachable'));
  }

  if (includeThemeSite && process.env.REACTPRESS_SKIP_PREVIEW_BUILD !== '1') {
    const { activeTheme } = readActiveThemeManifest(projectRoot);
    scheduleBackgroundThemeBuilds(projectRoot, { excludeThemeId: activeTheme });
  }

  printDevReadyBanner(projectRoot, {
    webOnly: includeAdmin && !includeThemeSite,
    desktop: desktopMode,
    nginx: nginxEnabled,
    hasThemeSite: includeThemeSite,
    dbOk,
    adminApiOrigin,
    clientApiOrigin,
  });

  logDevTimingSummary({
    apiReused: Boolean(apiSpawn?.reused),
  });
}

async function runDevStartup(
  projectRoot,
  {
    webOnly = false,
    themeOnly = false,
    desktopMode = false,
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

  logDevPhase(1, 3, 'dev.phasePrerequisites');
  assertDevPrerequisites();

  logDevPhase(2, 3, 'dev.phaseInfra');
  try {
    await Promise.all([
      prepareDevInfrastructure(projectRoot, { needsLocalApi: apiOrigins.needsLocalApi }),
      buildToolkit(projectRoot),
    ]);
    markDevPhase('infra');
  } catch (err) {
    console.error(t('dev.dbEnsureFailed', { message: err.message || err }));
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  await startDevStack(projectRoot, { webOnly, themeOnly, desktopMode, infraDone: true, apiOrigins });
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

  const buildResult = spawnSync('pnpm', ['run', '--dir', './desktop', 'build'], {
    cwd: projectRoot,
    shell: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: projectRoot,
    },
  });
  if (buildResult.status !== 0) {
    shutdown('SIGINT');
    process.exit(buildResult.status ?? 1);
  }

  desktopChild = spawnDevChild(
    'pnpm',
    ['exec', 'cross-env', `VITE_DEV_SERVER_URL=${adminUrl}`, 'ELECTRON_IS_DEV=1', 'electron', '.'],
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
    if (!shuttingDown) shutdown('SIGINT');
    process.exit(code ?? 0);
  });
}

async function runDesktopDev(projectRoot = ensureOriginalCwd()) {
  if (!hasWeb(projectRoot)) {
    console.error(t('dev.noWeb'));
    process.exit(1);
  }

  process.env.REACTPRESS_SKIP_NGINX = '1';

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('exit', () => {
    try {
      releaseDevSession(projectRoot);
    } catch {
      // ignore
    }
  });

  await runDevStartup(projectRoot, {
    webOnly: true,
    desktopMode: true,
    apiOrigins: { admin: null, client: null, needsLocalApi: true },
  });
  await spawnDesktopApp(projectRoot);
}

async function runThemeDev(
  projectRoot = ensureOriginalCwd(),
  { apiOrigins = { admin: null, client: null, needsLocalApi: true } } = {},
) {
  if (!hasResolvableActiveTheme(projectRoot)) {
    console.error(t('dev.themeSiteSkipped'));
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
  runThemeDev,
  runDesktopDev,
  runDevStartup,
  buildToolkit,
  assertDevPrerequisites,
  prepareDevInfrastructure,
  startDevStack,
  detectProjectType,
  nginxEntryUrl,
};
