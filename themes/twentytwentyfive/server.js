const { config } = require('@fecommunity/reactpress-toolkit');
const cliProd = require('next/dist/cli/next-start');
const cliDev = require('next/dist/cli/next-dev');
const open = require('open');
const path = require('path');
const dotenv = require('dotenv');

// 最小化修复：确保环境变量正确加载
const projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || process.cwd();
const envPath = path.join(projectRoot, '.env');
if (require('fs').existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const port = config.CLIENT_PORT || 3001;

try {
  // 这里根据环境判断，如果NODE_ENV=production, 就是生产
  if (process.env.NODE_ENV === 'production') {
    cliProd.nextStart(['-p', port]);
  } else {
    cliDev.nextDev(['-p', port]);
  }
  console.log(`[reactpress] 客户端已启动，端口：${port}`, `访问地址：http://localhost:${port}`);
  // 尝试自动打开
  open(`http://localhost:${port}`);
} catch (err) {
  console.log(`[reactpress] 客户端启动失败！${err.message || err}`);
}