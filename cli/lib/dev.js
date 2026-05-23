const { spawn } = require('child_process');
const path = require('path');
const ora = require('ora');
const { runBuild } = require('./build');
const { ensureProjectEnvironment } = require('./bootstrap');
const { loadServerSiteUrl, loadClientSiteUrl, loadWebAdminUrl, waitForHttp } = require('./http');
const { printDevReadyBanner } = require('./dev-banner');
const { ensureOriginalCwd } = require('./root');
const { detectProjectType, hasClient, hasWeb, hasToolkit } = require('./project-type');
const { t } = require('./i18n');

const CLIENT_READY_TIMEOUT_MS = 120_000;
const API_READY_TIMEOUT_MS = 180_000;

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

function shutdown(signal = 'SIGINT') {
  if (shuttingDown) return;
  shuttingDown = true;
  if (webChild && !webChild.killed) webChild.kill(signal);
  if (apiChild && !apiChild.killed) apiChild.kill(signal);
}

async function buildToolkit(projectRoot) {
  if (!hasToolkit(projectRoot)) return;
  await runBuild('toolkit', projectRoot);
}

function spawnApi(projectRoot) {
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
  const serverUrl = loadServerSiteUrl(projectRoot);
  const spinner = ora({
    text: t('dev.waitingApi', { url: serverUrl }),
    color: 'magenta',
    spinner: 'dots',
  }).start();
  const ready = await waitForHttp(serverUrl, API_READY_TIMEOUT_MS);
  if (!ready) {
    spinner.fail(t('dev.apiTimeout', { seconds: API_READY_TIMEOUT_MS / 1000 }));
    shutdown('SIGINT');
    process.exit(1);
  }
  spinner.succeed(t(readyMessageKey));
}

function spawnFrontend(projectRoot, { webOnly = false } = {}) {
  const useWeb = webOnly || hasWeb(projectRoot);
  const frontendDir = useWeb ? './web' : './client';
  webChild = spawn('pnpm', ['run', '--dir', frontendDir, 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
  });

  const readyUrl = useWeb ? loadWebAdminUrl(projectRoot) : loadClientSiteUrl(projectRoot);
  waitForHttp(readyUrl, CLIENT_READY_TIMEOUT_MS).then((clientReady) => {
    if (clientReady) {
      printDevReadyBanner(projectRoot, { webOnly: useWeb && (webOnly || hasWeb(projectRoot)) });
    } else {
      console.warn(
        t(useWeb ? 'dev.adminSlow' : 'dev.clientSlow', {
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
  const includeFrontend = webOnly || hasWeb(projectRoot) || hasClient(projectRoot);

  spawnApi(projectRoot);
  await waitForApiReady(projectRoot, {
    readyMessageKey: webOnly || hasWeb(projectRoot) ? 'dev.apiReadyAdmin' : 'dev.apiReady',
  });

  if (!includeFrontend) {
    printDevReadyBanner(projectRoot, { apiOnly: true });
    console.log(t('dev.standaloneHint'));
    return;
  }
  spawnFrontend(projectRoot, { webOnly });
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
};
