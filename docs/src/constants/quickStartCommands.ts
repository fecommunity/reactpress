/** ReactPress 3.0 快速开始命令（首页与文档保持一致） */
export const QUICK_START_INSTALL_COMMAND = 'npm i -g @fecommunity/reactpress@3';

export const QUICK_START_COMMANDS = [
  QUICK_START_INSTALL_COMMAND,
  'mkdir my-blog && cd my-blog',
  'reactpress init',
  'reactpress dev',
] as const;

/** 首页「一键复制」仅复制全局安装命令 */
export const QUICK_START_COPY_COMMAND = QUICK_START_INSTALL_COMMAND;

export const QUICK_START_SCRIPT = QUICK_START_COMMANDS.join('\n');
