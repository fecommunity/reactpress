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
const { t } = require('./i18n');

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

  if (!isUsingMonorepoServer()) {
    console.warn(t('lifecycle.noServerSrc'));
    const start = spawnSync('pnpm', ['exec', 'reactpress-cli', 'start'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    return start.status ?? 1;
  }

  console.log(t('lifecycle.startingLocalApi'));
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
  console.log(t('lifecycle.apiStartedBg', { pid: child.pid }));

  if (!wait) {
    return 0;
  }

  const serverUrl = loadServerSiteUrl(projectRoot);
  const ready = await waitForHttp(serverUrl);
  if (!ready) {
    console.error(t('lifecycle.apiTimeout120', { url: serverUrl }));
    return 1;
  }
  console.log(t('lifecycle.apiReady', { url: serverUrl }));
  return 0;
}

async function statusApi(projectRoot) {
  const pid = readPid(projectRoot);
  const serverUrl = loadServerSiteUrl(projectRoot);
  const { isHttpResponding } = require('./http');
  const httpOk = await isHttpResponding(serverUrl);

  const source = isUsingMonorepoServer()
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
      throw new Error(t('lifecycle.unknownCommand', { command }));
  }
}

module.exports = {
  startApi,
  stopApi,
  statusApi,
  runLifecycleCommand,
};
