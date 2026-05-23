const { spawn } = require('child_process');
const path = require('path');
const { ensureProjectEnvironment } = require('./bootstrap');
const { loadServerSiteUrl, loadClientSiteUrl, waitForHttp } = require('./http');
const { printDevReadyBanner } = require('./dev-banner');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

const CLIENT_READY_TIMEOUT_MS = 120_000;

const API_READY_TIMEOUT_MS = 180_000;

function formatDevFailureHint() {
  return [t('dev.nextSteps'), t('dev.nextDoctor'), t('dev.nextDocker'), t('dev.nextEnv')].join('\n');
}

let apiChild;
let webChild;
let shuttingDown = false;

function shutdown(signal = 'SIGINT') {
  if (shuttingDown) return;
  shuttingDown = true;
  if (webChild && !webChild.killed) {
    webChild.kill(signal);
  }
  if (apiChild && !apiChild.killed) {
    apiChild.kill(signal);
  }
}

async function buildToolkit(projectRoot) {
  return new Promise((resolve, reject) => {
    const build = spawn('pnpm', ['build:toolkit'], {
      stdio: 'inherit',
      shell: true,
      cwd: projectRoot,
    });
    build.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(t('dev.toolkitFailed', { code })));
        return;
      }
      resolve();
    });
  });
}

async function startDevStack(projectRoot) {
  const serverUrl = loadServerSiteUrl(projectRoot);
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
    if (webChild && !webChild.killed) {
      webChild.kill('SIGINT');
    }
    process.exit(code ?? 1);
  });

  console.log(t('dev.waitingApi', { url: serverUrl }));
  const ready = await waitForHttp(serverUrl, API_READY_TIMEOUT_MS);
  if (!ready) {
    console.error(
      t('dev.apiTimeout', { seconds: API_READY_TIMEOUT_MS / 1000 }),
    );
    shutdown('SIGINT');
    process.exit(1);
  }

  printDevReadyBanner(projectRoot, { apiOnly: true });

  console.log(t('dev.apiReady'));
  webChild = spawn('pnpm', ['run', '--dir', './client', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
  });

  const clientUrl = loadClientSiteUrl(projectRoot);
  waitForHttp(clientUrl, CLIENT_READY_TIMEOUT_MS).then((clientReady) => {
    if (clientReady) {
      printDevReadyBanner(projectRoot);
    } else {
      console.warn(
        t('dev.clientSlow', {
          seconds: CLIENT_READY_TIMEOUT_MS / 1000,
          url: clientUrl,
        }),
      );
    }
  });

  webChild.on('close', (code) => {
    if (!shuttingDown) {
      shutdown('SIGINT');
    }
    process.exit(code ?? 0);
  });
}

async function runDev(projectRoot = ensureOriginalCwd()) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    const result = await ensureProjectEnvironment(projectRoot);
    if (result.message) {
      console.log(`[reactpress] ${result.message}`);
    }
  } catch (err) {
    console.error(t('dev.envFailed'), err.message || err);
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  await buildToolkit(projectRoot);
  await startDevStack(projectRoot);
}

module.exports = { runDev, buildToolkit, startDevStack };
