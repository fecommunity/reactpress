const { spawn, execSync } = require('child_process');
const path = require('path');
const { ensureOriginalCwd } = require('./root');

function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function stopDockerServices(projectRoot) {
  console.log('[reactpress] 正在停止 Docker 服务…');
  try {
    execSync('docker-compose -f docker-compose.dev.yml down', {
      stdio: 'inherit',
      cwd: projectRoot,
    });
    console.log('[reactpress] Docker 服务已停止。');
  } catch (error) {
    console.error('[reactpress] 停止 Docker 失败:', error.message);
    throw error;
  }
}

function startDockerServices(projectRoot) {
  console.log('[reactpress] 正在启动 Docker 服务…');
  if (!isDockerRunning()) {
    throw new Error('Docker 未运行，请先启动 Docker Desktop。');
  }
  execSync('docker-compose -f docker-compose.dev.yml up -d', {
    stdio: 'inherit',
    cwd: projectRoot,
  });
  console.log('[reactpress] Docker 服务已启动。');
}

async function waitForMysql(maxAttempts = 30) {
  console.log('[reactpress] 等待 MySQL 就绪…');
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      execSync('docker exec reactpress_db mysql -u reactpress -preactpress -e "SELECT 1"', {
        stdio: 'ignore',
      });
      console.log('[reactpress] MySQL 已就绪。');
      return true;
    } catch {
      attempts += 1;
      if (attempts % 5 === 0) {
        console.log(`[reactpress] 等待 MySQL… (${attempts}/${maxAttempts})`);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.error('[reactpress] MySQL 在超时时间内未就绪。');
  return false;
}

async function dockerStartWithDev(projectRoot) {
  startDockerServices(projectRoot);
  const ready = await waitForMysql();
  if (!ready) {
    throw new Error('MySQL 未就绪');
  }

  const { buildToolkit } = require('./dev');
  await buildToolkit(projectRoot);

  const apiRunner = path.join(__dirname, 'api-dev-runner.js');
  console.log('[reactpress] 启动 API + 前端 (Docker MySQL)…');
  console.log('[reactpress] 访问: http://localhost:8080 (nginx) / http://localhost:3001 (client)');

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
        reject(Object.assign(new Error(`开发进程退出: ${code}`), { exitCode: code }));
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
      throw new Error(`未知 docker 命令: ${command}`);
  }
}

module.exports = {
  runDockerCommand,
  startDockerServices,
  stopDockerServices,
  waitForMysql,
  isDockerRunning,
};
