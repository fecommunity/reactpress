require('./scripts/ensure-typescript-for-next');

const { config } = require('@fecommunity/reactpress-toolkit');
const cliProd = require('next/dist/cli/next-start');
const cliDev = require('next/dist/cli/next-dev');
const path = require('path');
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
    cliProd.nextStart(['-p', String(port)]);
  } else {
    cliDev.nextDev(['-p', String(port)]);
  }
} catch (err) {
  console.log(`[reactpress] 客户端启动失败！${err.message || err}`);
}
