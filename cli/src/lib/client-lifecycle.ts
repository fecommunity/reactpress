// @ts-nocheck
const ora = require('ora');
const { getThemeBin } = require('./paths');
const { loadClientSiteUrl } = require('./http');
const { runNodeScript } = require('./spawn');
const { readClientPid, isProcessRunning, clearClientPidFile } = require('./process');
const {
  PM2_CLIENT_APP,
  isPm2RuntimeAvailable,
  isPm2AppOnline,
  getPm2AppPid,
} = require('./pm2-runtime');
const { t } = require('./i18n');

function stopClient(projectRoot) {
  const pid = readClientPid(projectRoot);
  if (pid && isProcessRunning(pid)) {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(t('lifecycle.clientStopped', { pid }));
    } catch (err) {
      console.warn(t('lifecycle.stopClientPidFailed', { pid }), err.message);
    }
  }
  clearClientPidFile(projectRoot);
}

async function startClientInBackground(projectRoot) {
  const preferPm2 = isPm2RuntimeAvailable(projectRoot);

  if (preferPm2 && isPm2AppOnline(projectRoot, PM2_CLIENT_APP)) {
    const pid = getPm2AppPid(projectRoot, PM2_CLIENT_APP);
    console.log(t('lifecycle.clientAlreadyRunning', { pid: pid ?? PM2_CLIENT_APP }));
    return 0;
  }

  const existing = readClientPid(projectRoot);
  if (!preferPm2 && existing && isProcessRunning(existing)) {
    console.log(t('lifecycle.clientAlreadyRunning', { pid: existing }));
    return 0;
  }
  clearClientPidFile(projectRoot);

  const themeBin = getThemeBin(projectRoot);
  const { resolveThemeDirectory, readActiveThemeManifest } = require('./theme-runtime');
  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const themeDir = resolveThemeDirectory(projectRoot, activeTheme);

  const bgFlag = preferPm2 ? '--pm2-bg' : '--bg';
  await runNodeScript(themeBin, [bgFlag], {
    cwd: projectRoot,
    env: themeDir ? { REACTPRESS_THEME_DIR: themeDir } : undefined,
  });

  const supervised = isPm2AppOnline(projectRoot, PM2_CLIENT_APP);
  const pid = supervised ? getPm2AppPid(projectRoot, PM2_CLIENT_APP) : readClientPid(projectRoot);
  if (!supervised && !pid) {
    console.error(t('lifecycle.clientPidMissing'));
    return 1;
  }

  const clientUrl = loadClientSiteUrl(projectRoot);
  const spinner = ora({
    text: t('lifecycle.waitingClient', { url: clientUrl }),
    color: 'magenta',
    spinner: 'dots',
  }).start();

  const deadline = Date.now() + 180_000;
  let ready = false;
  while (Date.now() < deadline) {
    const alive = supervised
      ? isPm2AppOnline(projectRoot, PM2_CLIENT_APP)
      : pid
        ? isProcessRunning(pid)
        : false;
    if (!alive) {
      spinner.fail(t('lifecycle.clientExitedEarly', { pid: pid ?? '—' }));
      return 1;
    }
    if (await require('./http').isHttpResponding(clientUrl)) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  if (!ready) {
    spinner.fail(t('lifecycle.clientTimeout', { url: clientUrl }));
    return 1;
  }

  const readyPid = supervised ? getPm2AppPid(projectRoot, PM2_CLIENT_APP) ?? PM2_CLIENT_APP : pid;
  spinner.succeed(t('lifecycle.clientReady', { url: clientUrl, pid: readyPid }));
  return 0;
}

module.exports = {
  startClientInBackground,
  stopClient,
};
