/** ReactPress 3.0 快速开始命令（首页与文档保持一致） */
export const QUICK_START_INSTALL_COMMAND = 'npm i -g @fecommunity/reactpress@3';

export const QUICK_START_COMMANDS = [
  QUICK_START_INSTALL_COMMAND,
  'mkdir my-blog && cd my-blog',
  'reactpress init',
  'reactpress dev',
] as const;

/** 首页「一键复制」：多行脚本，粘贴到终端即可按序执行 */
export const QUICK_START_SCRIPT = QUICK_START_COMMANDS.join('\n');

export const QUICK_START_COPY_COMMAND = QUICK_START_SCRIPT;

/** 首页 CLI 演示：每条命令执行后的模拟输出 */
export const QUICK_START_DEMO_OUTPUTS: Record<string, readonly string[]> = {
  [QUICK_START_INSTALL_COMMAND]: ['added 1 package in 6s'],
  'mkdir my-blog && cd my-blog': [],
  'reactpress init': [
    '[reactpress] 已生成 .reactpress/config.json',
    '[reactpress] Docker MySQL 已就绪',
  ],
  'reactpress dev': [
    '[reactpress] 正在启动 API（首次可能需安装依赖，请稍候）…',
    '[reactpress] API 已就绪，正在启动前端…',
  ],
};

/** `reactpress dev` 成功后的就绪横幅（与 CLI dev-banner 一致） */
export const QUICK_START_DEV_READY_LINES = [
  '✓ ReactPress 开发环境已就绪',
  '前台     http://localhost:3001',
  '管理端   http://localhost:3001/admin',
  'API      http://localhost:3002/api',
] as const;
