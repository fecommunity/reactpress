import {
  buildInstallCommand,
  FALLBACK_REACTPRESS_VERSIONS,
} from '@site/src/npm/packageVersions';

/** ReactPress quick-start commands (homepage CLI demo). */
export const QUICK_START_INSTALL_COMMAND = buildInstallCommand('beta');

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

const QUICK_START_DEV_READY_LINES_EN: DevReadyLines = [
  '✓ ReactPress is running',
  'Site     http://localhost:3001',
  'Admin    http://localhost:3001/admin/',
  'API      http://localhost:3002/api',
];

const QUICK_START_DEV_READY_LINES_ZH: DevReadyLines = [
  '✓ ReactPress 已启动',
  '前台     http://localhost:3001',
  '管理端   http://localhost:3001/admin/',
  'API      http://localhost:3002/api',
];

/** @deprecated Use getQuickStartDemoOutputs(locale, installCommand, betaVersion) */
export const QUICK_START_DEMO_OUTPUTS = getQuickStartDemoOutputs(
  'en',
  QUICK_START_INSTALL_COMMAND,
  FALLBACK_REACTPRESS_VERSIONS.beta,
);

/** @deprecated Use getQuickStartDevReadyLines(locale) */
export const QUICK_START_DEV_READY_LINES = QUICK_START_DEV_READY_LINES_EN;

export function buildQuickStartCommands(installCommand = QUICK_START_INSTALL_COMMAND) {
  return [installCommand, 'mkdir my-blog && cd my-blog', 'reactpress init'] as const;
}

export function getInstallDemoOutput(_betaVersion: string): readonly string[] {
  return ['added 1 package in 12s'];
}

export function getQuickStartDemoOutputs(
  locale: string,
  installCommand: string,
  betaVersion: string,
): DemoOutputs {
  const installDemoOutput = getInstallDemoOutput(betaVersion);
  const shared: DemoOutputs = {
    [installCommand]: installDemoOutput,
    'mkdir my-blog && cd my-blog': [],
    'reactpress init': [],
  };
  return shared;
}

export function getQuickStartDevReadyLines(locale: string): DevReadyLines {
  return locale === 'zh' ? QUICK_START_DEV_READY_LINES_ZH : QUICK_START_DEV_READY_LINES_EN;
}
