const { spawn, execSync } = require('child_process');
const path = require('path');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function stopDockerServices(projectRoot) {
  console.log(t('docker.stopping'));
  try {
    execSync('docker-compose -f docker-compose.dev.yml down', {
      stdio: 'inherit',
      cwd: projectRoot,
    });
    console.log(t('docker.stopped'));
  } catch (error) {
    console.error(t('docker.stopFailed'), error.message);
    throw error;
  }
}

function startDockerServices(projectRoot) {
  console.log(t('docker.starting'));
  if (!isDockerRunning()) {
    throw new Error(t('docker.notRunning'));
  }
  execSync('docker-compose -f docker-compose.dev.yml up -d', {
    stdio: 'inherit',
    cwd: projectRoot,
  });
  console.log(t('docker.started'));
}

async function waitForMysql(maxAttempts = 30) {
  console.log(t('docker.waitingMysql'));
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      execSync('docker exec reactpress_db mysql -u reactpress -preactpress -e "SELECT 1"', {
        stdio: 'ignore',
      });
      console.log(t('docker.mysqlReady'));
      return true;
    } catch {
      attempts += 1;
      if (attempts % 5 === 0) {
        console.log(t('docker.waitingMysqlProgress', { attempts, max: maxAttempts }));
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.error(t('docker.mysqlTimeout'));
  return false;
}

async function dockerStartWithDev(projectRoot) {
  startDockerServices(projectRoot);
  const ready = await waitForMysql();
  if (!ready) {
    throw new Error(t('docker.mysqlNotReady'));
  }

  const { buildToolkit } = require('./dev');
  await buildToolkit(projectRoot);

  const apiRunner = path.join(__dirname, 'api-dev-runner.js');
  console.log(t('docker.startDevStack'));
  console.log(t('docker.visitUrls'));

  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      [
        'concurrently',
        '-n',
        'api,web',
        '-c',
        'blue,green',
        `node "${apiRunner}"`,
        'pnpm run --dir ./client dev',
      ],
      {
        stdio: 'inherit',
        shell: true,
        cwd: projectRoot,
        env: {
          ...process.env,
          REACTPRESS_ORIGINAL_CWD: projectRoot,
        },
      }
    );

    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(Object.assign(new Error(t('docker.devProcessExit', { code })), { exitCode: code }));
        return;
      }
      resolve();
    });
  });
}

async function runDockerCommand(command, projectRoot = ensureOriginalCwd(), extraArgs = []) {
  switch (command) {
    case 'up':
      startDockerServices(projectRoot);
      await waitForMysql();
      return;
    case 'down':
      stopDockerServices(projectRoot);
      return;
    case 'start':
      await dockerStartWithDev(projectRoot);
      return;
    case 'stop':
      stopDockerServices(projectRoot);
      return;
    case 'restart':
      stopDockerServices(projectRoot);
      await new Promise((r) => setTimeout(r, 2000));
      startDockerServices(projectRoot);
      await waitForMysql();
      return;
    case 'status':
      execSync('docker-compose -f docker-compose.dev.yml ps', {
        stdio: 'inherit',
        cwd: projectRoot,
      });
      return;
    case 'logs': {
      const service = extraArgs[0] || '';
      execSync(`docker-compose -f docker-compose.dev.yml logs -f ${service}`.trim(), {
        stdio: 'inherit',
        cwd: projectRoot,
      });
      return;
    }
    default:
      throw new Error(t('docker.unknownCommand', { command }));
  }
}

module.exports = {
  runDockerCommand,
  startDockerServices,
  stopDockerServices,
  waitForMysql,
  isDockerRunning,
};
