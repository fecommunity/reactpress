// @ts-nocheck
const fs = require('fs');
const path = require('path');
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
const { stopClient } = require('./client-lifecycle');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');
const { getPm2ServerMemoryRestart } = require('./prod-memory');
const { ensureBundledServerDeps } = require('./server-bundle');
const {
  PM2_API_APP,
  PM2_CLIENT_APP,
  isPm2RuntimeAvailable,
  isPm2AppOnline,
  getPm2AppPid,
  runPm2,
  stopPm2Apps,
} = require('./pm2-runtime');

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

function stopAll(projectRoot) {
  stopPm2Apps(projectRoot, [PM2_API_APP, PM2_CLIENT_APP]);
  stopClient(projectRoot);
  stopApi(projectRoot);
}

async function startApiWithPm2(projectRoot, { wait = true } = {}) {
  const serverBin = getServerBin(projectRoot);
  const serverDir = getServerDir(projectRoot);
  const serverLogDir = path.join(projectRoot, '.reactpress', 'logs', 'server');
  fs.mkdirSync(serverLogDir, { recursive: true });
  const pm2OutLog = path.join(serverLogDir, 'pm2-out.log');
  const pm2ErrLog = path.join(serverLogDir, 'pm2-error.log');

  const started = runPm2(
    projectRoot,
    [
      'start',
      serverBin,
      '--name',
      PM2_API_APP,
      '--cwd',
      serverDir,
      '--output',
      pm2OutLog,
      '--error',
      pm2ErrLog,
      '--max-memory-restart',
      getPm2ServerMemoryRestart(),
      '--update-env',
      '-f',
    ],
    {
      env: {
        REACTPRESS_ORIGINAL_CWD: projectRoot,
        REACTPRESS_SERVER_LOG_DIR: serverLogDir,
      },
      stdio: 'ignore',
    },
  );

  if (!started.ok) {
    console.warn(t('lifecycle.processSupervisorFallback'));
    return startApiDetached(projectRoot, { wait });
  }

  const pid = getPm2AppPid(projectRoot, PM2_API_APP);
  if (pid) {
    writePid(projectRoot, pid);
  }
  console.log(t('lifecycle.apiStartedBg', { pid: pid ?? PM2_API_APP }));

  if (!wait) return 0;
  return waitForApiReady(projectRoot, pid);
}

async function waitForApiReady(projectRoot, pid) {
  const serverUrl = loadServerSiteUrl(projectRoot);
  const spinner = ora({
    text: t('dev.waitingApi', { url: serverUrl }),
    color: 'magenta',
    spinner: 'dots',
  }).start();

  const deadline = Date.now() + 120_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (pid && !isProcessRunning(pid) && !isPm2AppOnline(projectRoot, PM2_API_APP)) {
      spinner.fail(t('lifecycle.apiExitedEarly', { pid }));
      return 1;
    }
    if (await require('./http').isHttpResponding(serverUrl)) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!ready) {
    spinner.fail(t('lifecycle.apiTimeout120', { url: serverUrl }));
    return 1;
  }
  spinner.succeed(t('lifecycle.apiReady', { url: serverUrl }));
  return 0;
}

async function startApiDetached(projectRoot, { wait = true } = {}) {
  const serverLogDir = path.join(projectRoot, '.reactpress', 'logs', 'server');
  fs.mkdirSync(serverLogDir, { recursive: true });

  const child = spawn(process.execPath, [getServerBin(projectRoot)], {
    cwd: getServerDir(projectRoot),
    detached: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: projectRoot,
      REACTPRESS_SERVER_LOG_DIR: serverLogDir,
    },
  });

  child.unref();
  writePid(projectRoot, child.pid);
  console.log(t('lifecycle.apiStartedBg', { pid: child.pid }));

  if (!wait) return 0;
  return waitForApiReady(projectRoot, child.pid);
}

async function startApi(projectRoot, { wait = true } = {}) {
  if (!(await ensureConfig(projectRoot))) {
    return 1;
  }

  if (isPm2AppOnline(projectRoot, PM2_API_APP)) {
    const pid = getPm2AppPid(projectRoot, PM2_API_APP);
    console.log(t('lifecycle.apiAlreadyRunning', { pid: pid ?? PM2_API_APP }));
    return 0;
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

  if (!isUsingMonorepoServer(projectRoot)) {
    const bundled = await ensureBundledServerDeps(projectRoot);
    if (!bundled.ok) {
      console.error(bundled.message || t('bundle.serverBundle.notBuilt'));
      return 1;
    }
  }

  if (isUsingMonorepoServer(projectRoot)) {
    console.log(t('lifecycle.startingLocalApi'));
  } else {
    console.log(t('lifecycle.startingBundledApi'));
  }

  if (isPm2RuntimeAvailable(projectRoot)) {
    return startApiWithPm2(projectRoot, { wait });
  }

  return startApiDetached(projectRoot, { wait });
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
      stopAll(projectRoot);
      return 0;
    case 'restart':
      stopAll(projectRoot);
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
  stopAll,
  statusApi,
  runLifecycleCommand,
};
