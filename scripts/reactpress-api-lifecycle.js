#!/usr/bin/env node

/**
 * API lifecycle for monorepo: start / stop / restart / status (local server package).
 * Init and Docker DB still use reactpress-cli when needed.
 */

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');
const {
  getMonorepoRoot,
  getServerBin,
  getServerDir,
  isUsingMonorepoServer,
} = require('./bundled-server-path');
const { ensureProjectEnvironment } = require('./reactpress-bootstrap');

const projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot();
const pidFile = path.join(projectRoot, '.reactpress', 'server.pid');

process.env.REACTPRESS_ORIGINAL_CWD = projectRoot;

function loadServerSiteUrl() {
  const envPath = path.join(projectRoot, '.env');
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

async function ensureConfig() {
  try {
    await ensureProjectEnvironment(projectRoot);
    return true;
  } catch (err) {
    console.error('[reactpress] 环境准备失败:', err.message || err);
    return false;
  }
}

function readPid() {
  try {
    const raw = fs.readFileSync(pidFile, 'utf8').trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

function isProcessRunning(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function clearPidFile() {
  if (fs.existsSync(pidFile)) {
    fs.unlinkSync(pidFile);
  }
}

function writePid(pid) {
  fs.mkdirSync(path.dirname(pidFile), { recursive: true });
  fs.writeFileSync(pidFile, String(pid));
}

function stopApi() {
  const pid = readPid();
  if (pid && isProcessRunning(pid)) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`[reactpress] 已停止 API 进程 (pid ${pid})`);
    } catch (err) {
      console.warn(`[reactpress] 停止 pid ${pid} 失败:`, err.message);
    }
  }
  clearPidFile();
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
      (res) => resolve(res.statusCode > 0)
    );
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function waitForApi(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isApiResponding(url)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function startApi({ wait = true } = {}) {
  if (!(await ensureConfig())) {
    process.exit(1);
  }

  const existing = readPid();
  if (existing && isProcessRunning(existing)) {
    console.log(`[reactpress] API 已在运行 (pid ${existing})`);
    return 0;
  }
  clearPidFile();

  if (!isUsingMonorepoServer()) {
    console.warn('[reactpress] 未检测到 server/src，回退到 reactpress-cli start');
    const start = spawnSync('pnpm', ['exec', 'reactpress-cli', 'start'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    return start.status ?? 1;
  }

  console.log('[reactpress] 正在启动本地 API (server/)…');
  const child = spawn(process.execPath, [getServerBin()], {
    cwd: getServerDir(),
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: projectRoot,
    },
  });

  child.unref();
  writePid(child.pid);
  console.log(`[reactpress] API 已后台启动 (pid ${child.pid})`);

  if (!wait) {
    return 0;
  }

  const serverUrl = loadServerSiteUrl();
  return waitForApi(serverUrl).then((ready) => {
    if (!ready) {
      console.error(`[reactpress] API 在 120s 内未就绪: ${serverUrl}`);
      return 1;
    }
    console.log(`[reactpress] API 已就绪: ${serverUrl}`);
    return 0;
  });
}

async function statusApi() {
  const pid = readPid();
  const serverUrl = loadServerSiteUrl();
  const httpOk = await isApiResponding(serverUrl);

  console.log('[reactpress] API 状态');
  console.log(`  来源: ${isUsingMonorepoServer() ? 'monorepo server/' : 'reactpress-cli bundle'}`);
  console.log(`  PID 文件: ${pidFile}`);
  console.log(`  记录 PID: ${pid ?? '(无)'}`);
  console.log(`  进程存活: ${pid ? (isProcessRunning(pid) ? '是' : '否') : '—'}`);
  console.log(`  HTTP (${serverUrl}): ${httpOk ? '可访问' : '不可访问'}`);
}

const command = process.argv[2] || 'start';

async function main() {
  switch (command) {
    case 'start': {
      const code = await startApi({ wait: true });
      process.exit(typeof code === 'number' ? code : 0);
      break;
    }
    case 'start:bg': {
      const code = await startApi({ wait: false });
      process.exit(typeof code === 'number' ? code : 0);
      break;
    }
    case 'stop':
      stopApi();
      if (!isUsingMonorepoServer()) {
        spawnSync('pnpm', ['exec', 'reactpress-cli', 'stop'], {
          cwd: projectRoot,
          stdio: 'inherit',
        });
      }
      break;
    case 'restart':
      stopApi();
      if (!isUsingMonorepoServer()) {
        spawnSync('pnpm', ['exec', 'reactpress-cli', 'restart'], {
          cwd: projectRoot,
          stdio: 'inherit',
        });
        break;
      }
      {
        const code = await startApi({ wait: true });
        process.exit(code ?? 0);
      }
      break;
    case 'status':
      await statusApi();
      break;
    default:
      console.log(`
用法: node scripts/reactpress-api-lifecycle.js <command>

命令:
  start      启动 API 并等待就绪（默认）
  start:bg   后台启动，不等待 HTTP
  stop       停止 API
  restart    重启 API
  status     查看 API 状态
`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error('[reactpress]', err);
  process.exit(1);
});
