/** ReactPress 4.0 quick-start commands (homepage + docs) */
export const QUICK_START_INSTALL_COMMAND = 'npm i -g @fecommunity/reactpress@beta';

export const QUICK_START_COMMANDS = [
  QUICK_START_INSTALL_COMMAND,
  'mkdir my-blog && cd my-blog',
  'reactpress init',
] as const;

/** One-click copy: multi-line script */
export const QUICK_START_SCRIPT = QUICK_START_COMMANDS.join('\n');

export const QUICK_START_COPY_COMMAND = QUICK_START_SCRIPT;

export const QUICK_START_READY_DIVIDER = '------------------------------------------------';

export type QuickStartLocale = 'en' | 'zh';

type DemoOutputs = Record<string, readonly string[]>;
type DevReadyLines = readonly string[];

const QUICK_START_DEMO_OUTPUTS_EN: DemoOutputs = {
  [QUICK_START_INSTALL_COMMAND]: [
    '@fecommunity/reactpress@beta',
    'added 1 package in 12s',
  ],
  'mkdir my-blog && cd my-blog': [],
  'reactpress init': [],
};

const QUICK_START_DEMO_OUTPUTS_ZH: DemoOutputs = {
  [QUICK_START_INSTALL_COMMAND]: [
    '@fecommunity/reactpress@beta',
    'added 1 package in 12s',
  ],
  'mkdir my-blog && cd my-blog': [],
  'reactpress init': [],
};

const QUICK_START_DEV_READY_LINES_EN: DevReadyLines = [
  '✓ ReactPress is running',
  'Site     http://localhost:3001',
  'Admin    http://localhost:3000',
  'API      http://localhost:3002/api',
];

const QUICK_START_DEV_READY_LINES_ZH: DevReadyLines = [
  '✓ ReactPress 已启动',
  '前台     http://localhost:3001',
  '管理端   http://localhost:3000',
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
