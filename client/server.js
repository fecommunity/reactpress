const { config } = require('@fecommunity/reactpress-config');
const cli = require('next/dist/cli/next-dev');

const port = config.CLIENT_PORT || 3001;


try {
  cli.nextDev(['-p', port]);
  console.log(`[ReactPress] 客户端已启动，端口：${port}`);
  // 自动打开
  require('open')(`http://localhost:${port}`);
} catch (err) {
  console.log(`[ReactPress] 客户端启动失败！${err.message || err}`);
}
