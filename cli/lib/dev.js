const { spawn, spawnSync } = require('child_process');
const net = require('net');
const path = require('path');
const ora = require('ora');
const { runBuild } = require('./build');
const { ensureProjectEnvironment } = require('./bootstrap');
const {
  loadWebAdminUrl,
  loadClientSiteUrl,
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
const { ensureDevDatabase } = require('./docker');
const { t } = require('./i18n');

const CLIENT_READY_TIMEOUT_MS = 120_000;
const API_READY_TIMEOUT_MS = 180_000;

function logDevPhase(step, total, messageKey, vars = {}) {
  console.log(`\n[reactpress] (${step}/${total}) ${t(messageKey, vars)}\n`);
}

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function parseEnvPort(projectRoot, key, fallback) {
  try {
    const fs = require('fs');
    const content = fs.readFileSync(path.join(projectRoot, '.env'), 'utf8');
    const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    if (match) return parseInt(match[1].trim(), 10);
  } catch {
    // ignore
  }
  return fallback;
}

async function warnIfDevPortsBlocked(projectRoot) {
  const apiPort = parseEnvPort(projectRoot, 'SERVER_PORT', 3002);
  const healthUrl = getHealthUrl(projectRoot);
  const health = await checkHealth(healthUrl, 1500);
  if (health.ok) return;

  const apiBusy = await isPortOpen(apiPort);
  if (apiBusy) {
    console.warn(t('dev.portApiBusy', { port: apiPort }));
    console.warn(t('dev.portApiBusyHint'));
  }
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
}

async function buildToolkit(projectRoot) {
  if (!hasToolkit(projectRoot)) return;
  await runBuild('toolkit', projectRoot);
}

function killListenersOnPort(port) {
  const result = spawnSync('lsof', [`-ti:${port}`], { encoding: 'utf8' });
  if (result.status !== 0 || !result.stdout?.trim()) return;
  for (const pid of result.stdout.trim().split(/\s+/)) {
    if (pid) spawnSync('kill', ['-9', pid]);
  }
}

function spawnApi(projectRoot) {
  const apiPort = parseEnvPort(projectRoot, 'SERVER_PORT', 3002);
  killListenersOnPort(apiPort);

  const apiDevRunner = path.join(__dirname, 'api-dev-runner.js');
  console.log(t('dev.startingApi'));
  apiChild = spawn(process.execPath, [apiDevRunner], {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: projectRoot,
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
  const spinner = ora({
    text: t('dev.waitingApi', { url: healthUrl }),
    color: 'magenta',
    spinner: 'dots',
  }).start();

  await new Promise((r) => setTimeout(r, 2000));

  const deadline = Date.now() + API_READY_TIMEOUT_MS;
  let ready = false;
  let streak = 0;
  while (Date.now() < deadline) {
    const health = await checkHealth(healthUrl, 3000);
    if (health.ok) {
      streak += 1;
      if (streak >= 2) {
        ready = true;
        break;
      }
    } else {
      streak = 0;
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  if (!ready) {
    spinner.fail(t('dev.apiTimeout', { seconds: API_READY_TIMEOUT_MS / 1000 }));
    shutdown('SIGINT');
    process.exit(1);
  }
  spinner.succeed(t(readyMessageKey));
}

function spawnAdminWeb(projectRoot, { behindNginx = false, integratedStack = false } = {}) {
  console.log(t('dev.startingAdmin', { url: loadWebAdminUrl(projectRoot) }));
  const adminEnv = {
    ...process.env,
    REACTPRESS_ORIGINAL_CWD: projectRoot,
  };
  if (behindNginx) {
    adminEnv.VITE_ADMIN_BASE = '/admin/';
    process.env.REACTPRESS_BEHIND_NGINX = '1';
  }
  // Full stack (API + theme site): theme install/activate must hit Nest, not MSW.
  if (integratedStack) {
    adminEnv.VITE_ENABLE_MOCK = 'false';
    adminEnv.VITE_AUTH_MODE = 'server';
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

async function startDevStack(projectRoot, { webOnly = false } = {}) {
  const includeAdmin = webOnly && hasWeb(projectRoot);
  const includeThemeSite = !webOnly && hasThemePackages(projectRoot);
  const includeLegacyClient = !webOnly && !includeThemeSite && hasClient(projectRoot);
  const planNginx = process.env.REACTPRESS_SKIP_NGINX !== '1';
  const totalSteps =
    1 +
    (includeAdmin || hasWeb(projectRoot) ? 1 : 0) +
    (includeThemeSite ? 1 : 0) +
    (includeLegacyClient ? 1 : 0) +
    (planNginx ? 1 : 0);
  let step = 0;

  await warnIfDevPortsBlocked(projectRoot);

  try {
    await ensureDevDatabase(projectRoot);
  } catch (err) {
    console.error(t('dev.dbEnsureFailed', { message: err.message || err }));
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  logDevPhase(++step, totalSteps, 'dev.phaseApi');
  spawnApi(projectRoot);
  await waitForApiReady(projectRoot, {
    readyMessageKey: webOnly || hasWeb(projectRoot) ? 'dev.apiReadyAdmin' : 'dev.apiReady',
  });

  if (!includeAdmin && !includeThemeSite && !includeLegacyClient) {
    if (planNginx) {
      logDevPhase(++step, totalSteps, 'dev.phaseNginx');
      nginxEnabled = await startDevNginx(projectRoot);
    }
    printDevReadyBanner(projectRoot, { apiOnly: true, nginx: nginxEnabled });
    console.log(t('dev.standaloneHint'));
    return;
  }

  if (hasWeb(projectRoot)) {
    logDevPhase(++step, totalSteps, 'dev.phaseAdmin');
    spawnAdminWeb(projectRoot, { behindNginx: planNginx, integratedStack: !webOnly });
  }

  if (planNginx && includeThemeSite) {
    process.env.REACTPRESS_BEHIND_NGINX = '1';
  }

  if (includeThemeSite) {
    logDevPhase(++step, totalSteps, 'dev.phaseTheme');
    startThemeSiteWithWatch(projectRoot);
  }

  if (includeLegacyClient) {
    logDevPhase(++step, totalSteps, 'dev.phaseClient');
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
      const adminProbe = planNginx
        ? 'http://127.0.0.1:5173/admin/'
        : `${loadWebAdminUrl(projectRoot).replace(/\/$/, '')}/`;
      await waitForHttp(adminProbe, 120_000);
    }
    if (includeThemeSite) {
      await waitForHttp(loadClientSiteUrl(projectRoot), 120_000);
    }
    if (includeLegacyClient) {
      await waitForHttp(loadClientSiteUrl(projectRoot), 120_000);
    }
    if (planNginx) {
      waitSpinner.text = t('dev.phaseNginx');
      nginxEnabled = await startDevNginx(projectRoot);
      if (nginxEnabled && hasWeb(projectRoot)) {
        const adminViaNginx = `${nginxEntryUrl(projectRoot).replace(/\/$/, '')}/admin/`;
        const adminOk = await waitForHttp(adminViaNginx, 60_000);
        if (!adminOk) {
          console.warn(t('dev.adminNginxSlow', { url: adminViaNginx }));
        }
      }
      waitSpinner.succeed(t('dev.nginxReady', { url: nginxEntryUrl(projectRoot) }));
    } else {
      waitSpinner.succeed(t('dev.proxiesReady'));
    }
  } else if (planNginx) {
    logDevPhase(++step, totalSteps, 'dev.phaseNginx');
    nginxEnabled = await startDevNginx(projectRoot);
    console.log(t('dev.nginxReady', { url: nginxEntryUrl(projectRoot) }));
  }

  printDevReadyBanner(projectRoot, {
    webOnly: includeAdmin && !includeThemeSite,
    nginx: nginxEnabled,
    hasThemeSite: includeThemeSite,
  });
}

async function runWebDev(projectRoot = ensureOriginalCwd()) {
  if (!hasWeb(projectRoot)) {
    console.error(t('dev.noWeb'));
    process.exit(1);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    const result = await ensureProjectEnvironment(projectRoot);
    if (result.message) console.log(`[reactpress] ${result.message}`);
  } catch (err) {
    console.error(t('dev.envFailed'), err.message || err);
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  await buildToolkit(projectRoot);
  await startDevStack(projectRoot, { webOnly: true });
}

async function runDev(projectRoot = ensureOriginalCwd()) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    const result = await ensureProjectEnvironment(projectRoot);
    if (result.message) console.log(`[reactpress] ${result.message}`);
  } catch (err) {
    console.error(t('dev.envFailed'), err.message || err);
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  await buildToolkit(projectRoot);
  await startDevStack(projectRoot);
}

module.exports = {
  runDev,
  runWebDev,
  buildToolkit,
  startDevStack,
  detectProjectType,
  nginxEntryUrl,
};
