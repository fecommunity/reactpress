// @ts-nocheck
const { spawn } = require('child_process');
const ora = require('ora');
const { ensureProjectEnvironment } = require('./bootstrap');
const { loadServerSiteUrl, waitForHttp } = require('./http');
const {
  getServerBin,
  getServerDir,
  isUsingMonorepoServer,
  canStartLocalApi,
  getPidFile,
} = require('./paths');
const net = require('net');
const { readPid, isProcessRunning, clearPidFile, writePid } = require('./process');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

function parseServerPort(projectRoot) {
  try {
    const url = new URL(loadServerSiteUrl(projectRoot));
    return Number(url.port) || 3002;
  } catch {
    return 3002;
  }
}

function isPortBusy(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(800, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitForPortFree(port, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await isPortBusy(port))) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

async function ensureConfig(projectRoot) {
  try {
    await ensureProjectEnvironment(projectRoot);
    return true;
  } catch (err) {
    console.error(t('dev.envFailed'), err.message || err);
    return false;
  }
}

function stopApi(projectRoot) {
  const pid = readPid(projectRoot);
  if (pid && isProcessRunning(pid)) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(t('lifecycle.apiStopped', { pid }));
    } catch (err) {
      console.warn(t('lifecycle.stopPidFailed', { pid }), err.message);
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
    console.log(t('lifecycle.apiAlreadyRunning', { pid: existing }));
    return 0;
  }
  clearPidFile(projectRoot);

  if (!canStartLocalApi(projectRoot)) {
    console.error(t('lifecycle.noServerAvailable'));
    return 1;
  }

  if (isUsingMonorepoServer(projectRoot)) {
    console.log(t('lifecycle.startingLocalApi'));
  } else {
    console.log(t('lifecycle.startingBundledApi'));
  }

  const child = spawn(process.execPath, [getServerBin(projectRoot)], {
    cwd: getServerDir(projectRoot),
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: projectRoot,
    },
  });

  child.unref();
  writePid(projectRoot, child.pid);
  console.log(t('lifecycle.apiStartedBg', { pid: child.pid }));

  if (!wait) {
    return 0;
  }

  const serverUrl = loadServerSiteUrl(projectRoot);
  const spinner = ora({
    text: t('dev.waitingApi', { url: serverUrl }),
    color: 'magenta',
    spinner: 'dots',
  }).start();
  const ready = await waitForHttp(serverUrl);
  if (!ready) {
    spinner.fail(t('lifecycle.apiTimeout120', { url: serverUrl }));
    return 1;
  }
  spinner.succeed(t('lifecycle.apiReady', { url: serverUrl }));
  return 0;
}

async function statusApi(projectRoot) {
  const pid = readPid(projectRoot);
  const serverUrl = loadServerSiteUrl(projectRoot);
  const { isHttpResponding } = require('./http');
  const httpOk = await isHttpResponding(serverUrl);

  const source = isUsingMonorepoServer(projectRoot)
    ? t('lifecycle.source.monorepo')
    : t('lifecycle.source.bundle');

  console.log(t('lifecycle.apiStatusTitle'));
  console.log(t('lifecycle.source', { source }));
  console.log(t('lifecycle.pidFile', { path: getPidFile(projectRoot) }));
  console.log(
    t('lifecycle.recordedPid', {
      pid: pid ?? t('common.none'),
    })
  );
  console.log(
    t('lifecycle.processAlive', {
      alive: pid
        ? isProcessRunning(pid)
          ? t('common.yes')
          : t('common.no')
        : '—',
    })
  );
  console.log(
    t('lifecycle.httpStatus', {
      url: serverUrl,
      status: httpOk ? t('lifecycle.httpReachable') : t('lifecycle.httpUnreachable'),
    })
  );
}

async function runLifecycleCommand(command, projectRoot = ensureOriginalCwd()) {
  switch (command) {
    case 'start':
      return startApi(projectRoot, { wait: true });
    case 'start:bg':
      return startApi(projectRoot, { wait: false });
    case 'stop':
      stopApi(projectRoot);
      return 0;
    case 'restart':
      stopApi(projectRoot);
      await waitForPortFree(parseServerPort(projectRoot));
      await new Promise((r) => setTimeout(r, 400));
      return startApi(projectRoot, { wait: true });
    case 'status':
      await statusApi(projectRoot);
      return 0;
    default:
      throw new Error(t('lifecycle.unknownCommand', { command }));
  }
}

module.exports = {
  startApi,
  stopApi,
  statusApi,
  runLifecycleCommand,
};
