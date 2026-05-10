const { spawn } = require('child_process');
const path = require('path');
const { ensureProjectEnvironment } = require('./bootstrap');
const { loadServerSiteUrl, loadClientSiteUrl, waitForHttp } = require('./http');
const { printDevReadyBanner } = require('./dev-banner');
const { ensureOriginalCwd } = require('./root');

const CLIENT_READY_TIMEOUT_MS = 120_000;

const API_READY_TIMEOUT_MS = 180_000;

function formatDevFailureHint() {
  return [
    '下一步建议:',
    '  → reactpress doctor          环境诊断',
    '  → reactpress docker up       启动嵌入式 MySQL',
    '  → 检查 .env 中 DB_* 与 SERVER_SITE_URL',
    '  → Docker: https://docs.docker.com/get-docker/',
  ].join('\n');
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
        reject(new Error(`toolkit 构建失败，退出码: ${code}`));
        return;
      }
      resolve();
    });
  });
}

async function startDevStack(projectRoot) {
  const serverUrl = loadServerSiteUrl(projectRoot);
  const apiDevRunner = path.join(__dirname, 'api-dev-runner.js');

  console.log('[reactpress] 正在启动 API（首次可能需安装依赖，请稍候）…');
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

  console.log(`[reactpress] 等待 API 就绪: ${serverUrl}`);
  const ready = await waitForHttp(serverUrl, API_READY_TIMEOUT_MS);
  if (!ready) {
    console.error(
      `[reactpress] API 在 ${API_READY_TIMEOUT_MS / 1000}s 内未就绪。\n` +
        '  → 运行 reactpress doctor 查看详情\n' +
        '  → 嵌入式 MySQL：reactpress docker up\n' +
        '  → 检查 .env 中 DB_* 与 SERVER_SITE_URL'
    );
    shutdown('SIGINT');
    process.exit(1);
  }

  printDevReadyBanner(projectRoot, { apiOnly: true });

  console.log('[reactpress] API 已就绪，正在启动前端…');
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
        `[reactpress] 前端在 ${CLIENT_READY_TIMEOUT_MS / 1000}s 内未响应，可能仍在编译。稍后访问 ${clientUrl}`
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
    if (result.message && !result.message.includes('已就绪')) {
      console.log(`[reactpress] ${result.message}`);
    }
  } catch (err) {
    console.error('[reactpress] 环境准备失败:', err.message || err);
    console.error(formatDevFailureHint());
    process.exit(1);
  }

  await buildToolkit(projectRoot);
  await startDevStack(projectRoot);
}

module.exports = { runDev, buildToolkit, startDevStack };
