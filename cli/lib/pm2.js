const { spawn } = require('child_process');
const { getServerBin, getServerDir } = require('./paths');
const { ensureOriginalCwd } = require('./root');

function startApiWithPm2(projectRoot = ensureOriginalCwd()) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [getServerBin(), '--pm2'], {
      stdio: 'inherit',
      cwd: getServerDir(),
      env: {
        ...process.env,
        REACTPRESS_ORIGINAL_CWD: projectRoot,
      },
    });

    child.on('error', (error) => {
      console.error('[reactpress] PM2 启动 API 失败:', error);
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(Object.assign(new Error(`PM2 退出码 ${code}`), { exitCode: code }));
        return;
      }
      resolve();
    });
  });
}

module.exports = { startApiWithPm2 };
