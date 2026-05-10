const { spawn, spawnSync } = require('child_process');
const path = require('path');
const { ensureProjectEnvironment } = require('./bootstrap');
const { isUsingMonorepoServer } = require('./paths');
const { getMonorepoRoot } = require('./root');

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
    console.log('[reactpress] 开发模式: server/ (nest start --watch)');
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
    console.log('[reactpress] 开发模式: reactpress-cli（未找到 server/src）');
    const start = spawnSync('pnpm', ['exec', 'reactpress-cli', 'start'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    if (start.status !== 0) {
      process.exit(start.status ?? 1);
    }
    console.log('[reactpress] API 已由 reactpress-cli 启动。');
    process.stdin.resume();
    return;
  }

  if (apiChild) {
    apiChild.on('close', (code) => {
      process.exit(code ?? 0);
    });
    console.log('[reactpress] 按 Ctrl+C 停止 API。');
    console.log('[reactpress] 单独停止: reactpress server stop');
  }
}

async function runApiDev(projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot()) {
  try {
    await ensureProjectEnvironment(projectRoot);
  } catch (err) {
    console.error('[reactpress] 环境准备失败:', err.message || err);
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
