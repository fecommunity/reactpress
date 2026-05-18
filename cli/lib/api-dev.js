const { spawn } = require('child_process');
const path = require('path');
const { ensureProjectEnvironment } = require('./bootstrap');
const {
  getServerBin,
  getServerDir,
  isUsingMonorepoServer,
  canStartLocalApi,
} = require('./paths');
const { stopApi } = require('./lifecycle');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

let apiChild;

function stopApiDev(projectRoot) {
  if (apiChild && !apiChild.killed) {
    apiChild.kill('SIGTERM');
  }
  if (!isUsingMonorepoServer(projectRoot)) {
    stopApi(projectRoot);
  }
}

function startApiDev(projectRoot) {
  if (isUsingMonorepoServer(projectRoot)) {
    console.log(t('apiDev.modeServer'));
    apiChild = spawn('pnpm', ['run', '--dir', './server', 'dev'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        REACTPRESS_ORIGINAL_CWD: projectRoot,
      },
    });
  } else if (canStartLocalApi(projectRoot)) {
    console.log(t('apiDev.modeBundled'));
    apiChild = spawn(process.execPath, [getServerBin(projectRoot)], {
      cwd: getServerDir(projectRoot),
      stdio: 'inherit',
      env: {
        ...process.env,
        REACTPRESS_ORIGINAL_CWD: projectRoot,
      },
    });
  } else {
    console.error(t('lifecycle.noServerAvailable'));
    process.exit(1);
  }

  if (apiChild) {
    apiChild.on('close', (code) => {
      process.exit(code ?? 0);
    });
    console.log(t('apiDev.ctrlCHint'));
    console.log(t('apiDev.stopHint'));
  }
}

async function runApiDev(projectRoot = ensureOriginalCwd()) {
  try {
    await ensureProjectEnvironment(projectRoot);
  } catch (err) {
    console.error(t('dev.envFailed'), err.message || err);
    process.exit(1);
  }

  process.on('SIGINT', () => {
    stopApiDev(projectRoot);
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    stopApiDev(projectRoot);
    process.exit(0);
  });

  startApiDev(projectRoot);
}

function getApiDevScriptPath() {
  return path.join(__dirname, 'api-dev-runner.js');
}

module.exports = {
  runApiDev,
  stopApiDev,
  getApiDevScriptPath,
};
