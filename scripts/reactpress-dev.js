const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const currentWorkingDir = process.cwd();
process.env.REACTPRESS_ORIGINAL_CWD = currentWorkingDir;

const API_READY_TIMEOUT_MS = 180_000;
const API_POLL_INTERVAL_MS = 500;

console.log(`设置 REACTPRESS_ORIGINAL_CWD: ${currentWorkingDir}`);

function loadServerSiteUrl() {
  const envPath = path.join(currentWorkingDir, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/^SERVER_SITE_URL=(.+)$/m);
    if (match) {
      return match[1].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return 'http://localhost:3002';
}

function isApiResponding(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve(false);
      return;
    }

    const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port,
        path: parsed.pathname || '/',
        method: 'GET',
        timeout: timeoutMs,
      },
      (res) => {
        resolve(res.statusCode > 0);
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function waitForApi(url, timeoutMs = API_READY_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isApiResponding(url)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, API_POLL_INTERVAL_MS));
  }
  return false;
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

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

async function startDev() {
  const serverUrl = loadServerSiteUrl();

  console.log('[reactpress] 正在启动 API（首次可能需安装内置服务端依赖，请稍候）…');
  apiChild = spawn('pnpm', ['dev:server'], {
    stdio: 'inherit',
    shell: true,
    cwd: currentWorkingDir,
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
  const ready = await waitForApi(serverUrl);
  if (!ready) {
    console.error(
      `[reactpress] API 在 ${API_READY_TIMEOUT_MS / 1000}s 内未就绪。请检查 Docker/MySQL 与 .env 中的 DB_* 配置。`
    );
    shutdown('SIGINT');
    process.exit(1);
  }

  console.log('[reactpress] API 已就绪，正在启动前端…');
  webChild = spawn('pnpm', ['dev:client'], {
    stdio: 'inherit',
    shell: true,
    cwd: currentWorkingDir,
  });

  webChild.on('close', (code) => {
    if (!shuttingDown) {
      shutdown('SIGINT');
    }
    process.exit(code ?? 0);
  });
}

const build = spawn('pnpm', ['build:toolkit'], {
  stdio: 'inherit',
  shell: true,
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error(`构建失败，退出码: ${code}`);
    process.exit(code);
  }

  startDev().catch((err) => {
    console.error('[reactpress] 启动失败:', err);
    shutdown('SIGINT');
    process.exit(1);
  });
});
