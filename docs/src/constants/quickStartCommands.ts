/** ReactPress 3.0 quick-start commands (homepage + docs) */
export const QUICK_START_INSTALL_COMMAND = 'npm i -g @fecommunity/reactpress@3';

export const QUICK_START_COMMANDS = [
  QUICK_START_INSTALL_COMMAND,
  'mkdir my-blog && cd my-blog',
  'reactpress init',
  'reactpress dev',
] as const;

/** One-click copy: multi-line script */
export const QUICK_START_SCRIPT = QUICK_START_COMMANDS.join('\n');

export const QUICK_START_COPY_COMMAND = QUICK_START_SCRIPT;

export type QuickStartLocale = 'en' | 'zh';

type DemoOutputs = Record<string, readonly string[]>;
type DevReadyLines = readonly string[];

const QUICK_START_DEMO_OUTPUTS_EN: DemoOutputs = {
  [QUICK_START_INSTALL_COMMAND]: ['added 1 package in 6s'],
  'mkdir my-blog && cd my-blog': [],
  'reactpress init': ['[reactpress] Created .reactpress/config.json', '[reactpress] Docker MySQL is ready'],
  'reactpress dev': [
    '[reactpress] Starting API (first run may install deps)…',
    '[reactpress] API ready, starting frontend…',
  ],
};

const QUICK_START_DEMO_OUTPUTS_ZH: DemoOutputs = {
  [QUICK_START_INSTALL_COMMAND]: ['added 1 package in 6s'],
  'mkdir my-blog && cd my-blog': [],
  'reactpress init': ['[reactpress] 已生成 .reactpress/config.json', '[reactpress] Docker MySQL 已就绪'],
  'reactpress dev': [
    '[reactpress] 正在启动 API（首次可能需安装依赖，请稍候）…',
    '[reactpress] API 已就绪，正在启动前端…',
  ],
};

const QUICK_START_DEV_READY_LINES_EN: DevReadyLines = [
  '✓ ReactPress dev environment is ready',
  'Site     http://localhost:3001',
  'Admin    http://localhost:3001/admin',
  'API      http://localhost:3002/api',
];

const QUICK_START_DEV_READY_LINES_ZH: DevReadyLines = [
  '✓ ReactPress 开发环境已就绪',
  '前台     http://localhost:3001',
  '管理端   http://localhost:3001/admin',
  'API      http://localhost:3002/api',
];

/** @deprecated Use getQuickStartDemoOutputs(locale) */
export const QUICK_START_DEMO_OUTPUTS = QUICK_START_DEMO_OUTPUTS_EN;

/** @deprecated Use getQuickStartDevReadyLines(locale) */
export const QUICK_START_DEV_READY_LINES = QUICK_START_DEV_READY_LINES_EN;

export function getQuickStartDemoOutputs(locale: string): DemoOutputs {
  return locale === 'zh' ? QUICK_START_DEMO_OUTPUTS_ZH : QUICK_START_DEMO_OUTPUTS_EN;
}

export function getQuickStartDevReadyLines(locale: string): DevReadyLines {
  return locale === 'zh' ? QUICK_START_DEV_READY_LINES_ZH : QUICK_START_DEV_READY_LINES_EN;
}
