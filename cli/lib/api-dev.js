const { spawn, spawnSync } = require('child_process');
const path = require('path');
const { ensureProjectEnvironment } = require('./bootstrap');
const { isUsingMonorepoServer } = require('./paths');
const { getMonorepoRoot } = require('./root');
const { t } = require('./i18n');

let apiChild;

function stopApiDev(projectRoot) {
  if (apiChild && !apiChild.killed) {
    apiChild.kill('SIGTERM');
  }
  if (!isUsingMonorepoServer()) {
    spawnSync('pnpm', ['exec', 'reactpress-cli', 'stop'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });
  }
}

function startApiDev(projectRoot) {
  if (isUsingMonorepoServer()) {
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
  } else {
    console.log(t('apiDev.modeCli'));
    const start = spawnSync('pnpm', ['exec', 'reactpress-cli', 'start'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    if (start.status !== 0) {
      process.exit(start.status ?? 1);
    }
    console.log(t('apiDev.startedByCli'));
    process.stdin.resume();
    return;
  }

  if (apiChild) {
    apiChild.on('close', (code) => {
      process.exit(code ?? 0);
    });
    console.log(t('apiDev.ctrlCHint'));
    console.log(t('apiDev.stopHint'));
  }
}

async function runApiDev(projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot()) {
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
