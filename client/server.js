const { config } = require('@fecommunity/reactpress-config');
const cliProd = require('next/dist/cli/next-start');
const cliDev = require('next/dist/cli/next-dev');
const open = require('open');

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
