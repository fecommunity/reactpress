const { spawn, spawnSync } = require('child_process');
const { ensureProjectEnvironment } = require('./bootstrap');
const { loadServerSiteUrl, waitForHttp } = require('./http');
const {
  getServerBin,
  getServerDir,
  isUsingMonorepoServer,
  getPidFile,
} = require('./paths');
const { readPid, isProcessRunning, clearPidFile, writePid } = require('./process');
const { getMonorepoRoot } = require('./root');

async function ensureConfig(projectRoot) {
  try {
    await ensureProjectEnvironment(projectRoot);
    return true;
  } catch (err) {
    console.error('[reactpress] 环境准备失败:', err.message || err);
    return false;
  }
}

function stopApi(projectRoot) {
  const pid = readPid(projectRoot);
  if (pid && isProcessRunning(pid)) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`[reactpress] 已停止 API 进程 (pid ${pid})`);
    } catch (err) {
      console.warn(`[reactpress] 停止 pid ${pid} 失败:`, err.message);
    }
  }
  clearPidFile(projectRoot);
}

async function startApi(projectRoot, { wait = true } = {}) {
  if (!(await ensureConfig(projectRoot))) {
    return 1;
  }

  const existing = readPid(projectRoot);
  if (existing && isProcessRunning(existing)) {
    console.log(`[reactpress] API 已在运行 (pid ${existing})`);
    return 0;
  }
  clearPidFile(projectRoot);

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
  writePid(projectRoot, child.pid);
  console.log(`[reactpress] API 已后台启动 (pid ${child.pid})`);

  if (!wait) {
    return 0;
  }

  const serverUrl = loadServerSiteUrl(projectRoot);
  const ready = await waitForHttp(serverUrl);
  if (!ready) {
    console.error(`[reactpress] API 在 120s 内未就绪: ${serverUrl}`);
    return 1;
  }
  console.log(`[reactpress] API 已就绪: ${serverUrl}`);
  return 0;
}

async function statusApi(projectRoot) {
  const pid = readPid(projectRoot);
  const serverUrl = loadServerSiteUrl(projectRoot);
  const { isHttpResponding } = require('./http');
  const httpOk = await isHttpResponding(serverUrl);

  console.log('[reactpress] API 状态');
  console.log(`  来源: ${isUsingMonorepoServer() ? 'monorepo server/' : 'reactpress-cli bundle'}`);
  console.log(`  PID 文件: ${getPidFile(projectRoot)}`);
  console.log(`  记录 PID: ${pid ?? '(无)'}`);
  console.log(`  进程存活: ${pid ? (isProcessRunning(pid) ? '是' : '否') : '—'}`);
  console.log(`  HTTP (${serverUrl}): ${httpOk ? '可访问' : '不可访问'}`);
}

async function runLifecycleCommand(command, projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot()) {
  switch (command) {
    case 'start':
      return startApi(projectRoot, { wait: true });
    case 'start:bg':
      return startApi(projectRoot, { wait: false });
    case 'stop':
      stopApi(projectRoot);
      if (!isUsingMonorepoServer()) {
        spawnSync('pnpm', ['exec', 'reactpress-cli', 'stop'], {
          cwd: projectRoot,
          stdio: 'inherit',
        });
      }
      return 0;
    case 'restart':
      stopApi(projectRoot);
      if (!isUsingMonorepoServer()) {
        spawnSync('pnpm', ['exec', 'reactpress-cli', 'restart'], {
          cwd: projectRoot,
          stdio: 'inherit',
        });
        return 0;
      }
      return startApi(projectRoot, { wait: true });
    case 'status':
      await statusApi(projectRoot);
      return 0;
    default:
      throw new Error(`未知 lifecycle 命令: ${command}`);
  }
}

module.exports = {
  startApi,
  stopApi,
  statusApi,
  runLifecycleCommand,
};
