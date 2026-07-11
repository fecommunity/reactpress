// @ts-nocheck
const { spawn } = require('child_process');
const { getServerBin, getServerDir, isUsingMonorepoServer } = require('./paths');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');
const { ensureBundledServerDeps } = require('./server-bundle');

async function startApiWithPm2(projectRoot = ensureOriginalCwd()) {
  if (!isUsingMonorepoServer(projectRoot)) {
    const bundled = await ensureBundledServerDeps(projectRoot);
    if (!bundled.ok) {
      throw new Error(bundled.message || t('bundle.serverBundle.notBuilt'));
    }
  }

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [getServerBin(projectRoot), '--pm2'], {
      stdio: 'inherit',
      cwd: getServerDir(projectRoot),
      env: {
        ...process.env,
        REACTPRESS_ORIGINAL_CWD: projectRoot,
      },
    });

    child.on('error', (error) => {
      console.error(t('pm2.startFailed'), error);
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(Object.assign(new Error(t('pm2.exitCode', { code })), { exitCode: code }));
        return;
      }
      resolve();
    });
  });
}

module.exports = { startApiWithPm2 };
