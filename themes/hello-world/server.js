const { config } = require('@fecommunity/reactpress-toolkit');
const cliDev = require('next/dist/cli/next-dev');
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

const projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || process.cwd();
const envPath = path.join(projectRoot, '.env');
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const port = Number(
  process.env.PORT || process.env.CLIENT_PORT || config.CLIENT_PORT || 3001,
);

try {
  if (process.env.NODE_ENV === 'production') {
    const nextBin = path.join(__dirname, 'node_modules', 'next', 'dist', 'bin', 'next');
    spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
      cwd: __dirname,
      env: process.env,
      stdio: 'inherit',
    });
  } else {
    cliDev.nextDev(['-p', String(port)]);
  }
} catch (err) {
  console.log(`[reactpress] 客户端启动失败！${err.message || err}`);
}
