// @ts-nocheck
const { spawn } = require('child_process');
const { getServerBin, getServerDir } = require('./paths');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

function startApiWithPm2(projectRoot = ensureOriginalCwd()) {
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
