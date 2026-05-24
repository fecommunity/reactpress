const { spawn } = require('child_process');
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
const { detectProjectType, hasClient, hasWeb, hasToolkit } = require('./project-type');
const { hasThemePackages } = require('./theme-runtime');
const { startThemeSiteWithWatch, stopThemeSite } = require('./theme-dev');
const { DEV_PORTS, ensureDevStackPorts, ensureApiPortFree, ensurePortFree, readEnvPort, isPortListening } =
  require('./ports');
const { ensureDevDatabase, probeMysqlHost } = require('./docker');
const { acquireDevSession, releaseDevSession } = require('./dev-session');
const { checkNodeVersion, checkDocker } = require('./doctor');
const { t } = require('./i18n');

const CLIENT_READY_TIMEOUT_MS = 120_000;
const API_READY_TIMEOUT_MS = 180_000;

function logDevPhase(step, total, messageKey, vars = {}) {
  console.log(`\n[reactpress] (${step}/${total}) ${t(messageKey, vars)}\n`);
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
let shuttingDown = false;
let nginxEnabled = false;

function shutdown(signal = 'SIGINT') {
  if (shuttingDown) return;
  shuttingDown = true;
  stopThemeSite();
  if (nginxEnabled) stopDevNginx(ensureOriginalCwd());
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
  await runBuild('toolkit', projectRoot);
}

async function spawnApi(projectRoot) {
  const { reused, port: apiPort } = await ensureApiPortFree(projectRoot, { allowReuse: false });
  if (reused) {
    console.log(t('dev.apiReusing', { port: apiPort }));
    return;
  }

  const apiDevRunner = path.join(__dirname, 'api-dev-runner.js');
  console.log(t('dev.startingApi'));
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
}

async function waitForApiReady(projectRoot, { readyMessageKey = 'dev.apiReady' } = {}) {
  const healthUrl = getHealthUrl(projectRoot);
  const apiPort = readEnvPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API);
  const spinner = ora({
    text: t('dev.waitingApi', { url: healthUrl }),
    color: 'magenta',
    spinner: 'dots',
  }).start();

  const deadline = Date.now() + API_READY_TIMEOUT_MS;
  let lastHint = '';

  while (Date.now() < deadline) {
    if (!isPortListening(apiPort)) {
      lastHint = t('dev.waitingApiCompile', { port: apiPort });
      spinner.text = `${t('dev.waitingApi', { url: healthUrl })} — ${lastHint}`;
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }

    const health = await checkHealth(healthUrl, 4000);
    if (health.ok) {
      spinner.succeed(t(readyMessageKey));
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

    if (lastHint) {
      spinner.text = `${t('dev.waitingApi', { url: healthUrl })} — ${lastHint}`;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  spinner.fail(t('dev.apiTimeout', { seconds: API_READY_TIMEOUT_MS / 1000 }));
  shutdown('SIGINT');
  process.exit(1);
}

async function spawnAdminWeb(projectRoot, { behindNginx = false, integratedStack = false } = {}) {
  const adminPort = readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB);
  await ensurePortFree(adminPort, { label: 'admin' });

  console.log(t('dev.startingAdmin', { url: loadWebAdminUrl(projectRoot) }));
  const adminEnv = {
    ...process.env,
    REACTPRESS_ORIGINAL_CWD: projectRoot,
    WEB_ADMIN_PORT: String(adminPort),
  };
  if (behindNginx) {
    adminEnv.VITE_ADMIN_BASE = '/admin/';
    process.env.REACTPRESS_BEHIND_NGINX = '1';
  }
  // Full stack (API + theme site): theme install/activate must hit Nest, not MSW.
  if (integratedStack) {
    adminEnv.VITE_ENABLE_MOCK = 'false';
    adminEnv.VITE_AUTH_MODE = 'server';
    adminEnv.VITE_DEV_API_PROXY_TARGET = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
  }

  webChild = spawn('pnpm', ['run', '--dir', './web', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
    env: adminEnv,
  });

  const readyUrl = loadWebAdminUrl(projectRoot);
  waitForHttp(readyUrl, CLIENT_READY_TIMEOUT_MS).then((ready) => {
    if (!ready) {
      console.warn(
        t('dev.adminSlow', {
          seconds: CLIENT_READY_TIMEOUT_MS / 1000,
          url: readyUrl,
        })
      );
    }
  });

  webChild.on('close', (code) => {
    if (!shuttingDown) shutdown('SIGINT');
    process.exit(code ?? 0);
  });
}

/** Legacy client when no theme packages in monorepo. */
function spawnLegacyClient(projectRoot) {
  webChild = spawn('pnpm', ['run', '--dir', './client', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
  });

  const readyUrl = loadClientSiteUrl(projectRoot);
  waitForHttp(readyUrl, CLIENT_READY_TIMEOUT_MS).then((clientReady) => {
    if (clientReady) {
      printDevReadyBanner(projectRoot, { webOnly: false });
    } else {
      console.warn(
        t('dev.clientSlow', {
          seconds: CLIENT_READY_TIMEOUT_MS / 1000,
          url: readyUrl,
        })
      );
    }
  });

  webChild.on('close', (code) => {
    if (!shuttingDown) shutdown('SIGINT');
    process.exit(code ?? 0);
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
  console.log(`[reactpress] ✓ ${t('dev.checkNodeOk', { version: process.version })}`);

  const docker = checkDocker();
  if (!docker.ok) {
    console.error(`[reactpress] ${docker.message}`);
    if (docker.fix) console.error(`  → ${docker.fix}`);
    console.error(formatDevFailureHint());
    process.exit(1);
  }
  console.log(`[reactpress] ✓ ${t('dev.checkDockerOk')}`);
}

async function prepareDevInfrastructure(projectRoot) {
  await acquireDevSession(projectRoot);
  await ensureDevDatabase(projectRoot);

  const planNginx = process.env.REACTPRESS_SKIP_NGINX !== '1';
  if (planNginx) {
    nginxEnabled = await startDevNginx(projectRoot);
    if (nginxEnabled) {
      console.log(t('dev.nginxReady', { url: nginxEntryUrl(projectRoot) }));
    }
  }
}

async function startDevStack(projectRoot, { webOnly = false, infraDone = false } = {}) {
  if (!infraDone) {
    logDevPhase(1, 3, 'dev.phasePrerequisites');
    assertDevPrerequisites();
    logDevPhase(2, 3, 'dev.phaseInfra');
    try {
      await prepareDevInfrastructure(projectRoot);
    } catch (err) {
      console.error(t('dev.dbEnsureFailed', { message: err.message || err }));
      console.error(formatDevFailureHint());
      process.exit(1);
    }
  } else if (!(await probeMysqlHost(projectRoot))) {
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
  const includeThemeSite = !webOnly && hasThemePackages(projectRoot);
  const includeLegacyClient = !webOnly && !includeThemeSite && hasClient(projectRoot);
  const planNginx = process.env.REACTPRESS_SKIP_NGINX !== '1';

  if (infraDone) {
    logDevPhase(3, 3, 'dev.phaseServices');
  }

  await ensureDevStackPorts(projectRoot);

  console.log(t('dev.phaseApi'));
  await spawnApi(projectRoot);
  await waitForApiReady(projectRoot, {
    readyMessageKey: webOnly || hasWeb(projectRoot) ? 'dev.apiReadyAdmin' : 'dev.apiReady',
  });

  if (!includeAdmin && !includeThemeSite && !includeLegacyClient) {
    printDevReadyBanner(projectRoot, { apiOnly: true, nginx: nginxEnabled });
    console.log(t('dev.standaloneHint'));
    return;
  }

  if (hasWeb(projectRoot)) {
    console.log(t('dev.phaseAdmin'));
    await spawnAdminWeb(projectRoot, { behindNginx: planNginx, integratedStack: !webOnly });
  }

  if (planNginx && includeThemeSite) {
    process.env.REACTPRESS_BEHIND_NGINX = '1';
  }

  if (includeThemeSite) {
    console.log(t('dev.phaseTheme'));
    await startThemeSiteWithWatch(projectRoot);
  }

  if (includeLegacyClient) {
    console.log(t('dev.phaseClient'));
    spawnLegacyClient(projectRoot);
  }

  const needsProxyWait =
    hasWeb(projectRoot) || includeThemeSite || includeLegacyClient;

  if (needsProxyWait) {
    const waitSpinner = ora({
      text: t('dev.waitingProxies'),
      color: 'cyan',
      spinner: 'dots',
    }).start();
    if (hasWeb(projectRoot)) {
      const adminBase = loadWebAdminUrl(projectRoot).replace(/\/$/, '');
      const adminProbe = planNginx ? `${adminBase}/admin/` : `${adminBase}/`;
      await waitForHttp(adminProbe, 120_000);
      if (planNginx && nginxEnabled) {
        const adminViaNginx = `${nginxEntryUrl(projectRoot).replace(/\/$/, '')}/admin/`;
        const adminOk = await waitForHttp(adminViaNginx, 60_000);
        if (!adminOk) {
          console.warn(t('dev.adminNginxSlow', { url: adminViaNginx }));
        }
      }
    }
    if (includeThemeSite) {
      await waitForHttp(loadClientSiteUrl(projectRoot), 120_000);
    }
    if (includeLegacyClient) {
      await waitForHttp(loadClientSiteUrl(projectRoot), 120_000);
    }
    if (planNginx && !nginxEnabled) {
      nginxEnabled = await startDevNginx(projectRoot);
      if (nginxEnabled) {
        console.log(t('dev.nginxReady', { url: nginxEntryUrl(projectRoot) }));
      }
    }
    waitSpinner.succeed(
      nginxEnabled ? t('dev.nginxReady', { url: nginxEntryUrl(projectRoot) }) : t('dev.proxiesReady'),
    );
  }

  const dbOk = await probeMysqlHost(projectRoot);
  if (!dbOk) {
    console.warn(t('dev.mysqlUnreachable'));
  }

  printDevReadyBanner(projectRoot, {
    webOnly: includeAdmin && !includeThemeSite,
    nginx: nginxEnabled,
    hasThemeSite: includeThemeSite,
    dbOk,
  });
}

async function runDevStartup(projectRoot, { webOnly = false } = {}) {
  try {
    const result = await ensureProjectEnvironment(projectRoot, { skipDatabase: true });
    if (result.message) console.log(`[reactpress] ${result.message}`);
  } catch (err) {
    console.error(t('dev.envFailed'), err.message || err);
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  logDevPhase(1, 3, 'dev.phasePrerequisites');
  assertDevPrerequisites();

  logDevPhase(2, 3, 'dev.phaseInfra');
  try {
    await prepareDevInfrastructure(projectRoot);
  } catch (err) {
    console.error(t('dev.dbEnsureFailed', { message: err.message || err }));
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  await buildToolkit(projectRoot);

  await startDevStack(projectRoot, { webOnly, infraDone: true });
}

async function runWebDev(projectRoot = ensureOriginalCwd()) {
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

  await runDevStartup(projectRoot, { webOnly: true });
}

async function runDev(projectRoot = ensureOriginalCwd()) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('exit', () => {
    try {
      releaseDevSession(projectRoot);
    } catch {
      // ignore
    }
  });

  await runDevStartup(projectRoot);
}

module.exports = {
  runDev,
  runWebDev,
  runDevStartup,
  buildToolkit,
  assertDevPrerequisites,
  prepareDevInfrastructure,
  startDevStack,
  detectProjectType,
  nginxEntryUrl,
};
