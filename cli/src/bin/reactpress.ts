#!/usr/bin/env node
// @ts-nocheck

/**
 * ReactPress 4 — zero-dependency publishing platform.
 * Commands: `reactpress init`, `reactpress doctor`. Run `reactpress` or `reactpress --help` for usage.
 */

const { Command } = require('commander');
const path = require('path');
const chalk = require('chalk');
const { brand, divider } = require('../ui/theme');
const { initMonorepoProject, isMonorepoCheckout } = require('../lib/bootstrap');
const { initProject } = require('../core/services/init');
const { runLifecycleCommand } = require('../lib/lifecycle');
const { runNodeScript } = require('../lib/spawn');
const { getThemeBin, getCliVersion } = require('../lib/paths');
const {
  loadServerSiteUrl,
  loadAdminConsoleUrl,
  loadClientSiteUrl,
  getApiPrefix,
} = require('../lib/http');
const { t } = require('../lib/i18n');
const { describeProject } = require('../lib/project-type');
const { refreshBannerWithStartup } = require('../ui/banner-startup');
const { runDoctor } = require('../lib/doctor');
const { runDoctorLogs } = require('../lib/project-logs');

const LEGACY_COMMANDS = new Set([
  'start',
  'dev',
  'docker',
  'nginx',
  'server',
  'build',
  'status',
  'publish',
  'theme',
  'plugin',
  'db',
  'desktop',
  'client',
]);

if (!process.env.REACTPRESS_LOCAL_MODE) {
  process.env.REACTPRESS_LOCAL_MODE = '1';
}
if (!process.env.REACTPRESS_SKIP_NGINX) {
  process.env.REACTPRESS_SKIP_NGINX = '1';
}

const program = new Command();

program
  .name('reactpress')
  .description(t('cli.description'))
  .version(getCliVersion());

function printRunningPanel(projectRoot) {
  const apiUrl = loadServerSiteUrl(projectRoot);
  const adminUrl = loadAdminConsoleUrl(projectRoot);
  const siteUrl = loadClientSiteUrl(projectRoot);
  const apiPrefix = getApiPrefix(projectRoot);

  console.log('');
  console.log(brand.bold(t('init.readyTitle')));
  console.log(divider(48));
  console.log(`  ${brand.muted(t('init.label.site'))}     ${brand.primary(siteUrl)}`);
  console.log(`  ${brand.muted(t('init.label.admin'))}    ${brand.primary(adminUrl)}`);
  console.log(`  ${brand.muted(t('init.label.api'))}      ${brand.primary(`${apiUrl}${apiPrefix}`)}`);
  console.log(divider(48));
  console.log(`  ${brand.dim(t('init.hint'))}`);
  console.log('');
}

async function startServices(projectRoot) {
  const code = await runLifecycleCommand('start', projectRoot);
  if (code !== 0) process.exit(code);

  const { ensureDefaultTheme } = require('../core/services/theme-bootstrap');
  await ensureDefaultTheme(projectRoot);

  printRunningPanel(projectRoot);

  try {
    const themeBin = getThemeBin(projectRoot);
    const { resolveThemeDirectory, readActiveThemeManifest } = require('../lib/theme-runtime');
    const { activeTheme } = readActiveThemeManifest(projectRoot);
    const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
    await runNodeScript(themeBin, [], {
      cwd: projectRoot,
      env: themeDir ? { REACTPRESS_THEME_DIR: themeDir } : undefined,
    });
  } catch (err) {
    if (
      err.code === 'REACTPRESS_THEME_NOT_FOUND' ||
      err.code === 'REACTPRESS_THEME_BIN_NOT_FOUND'
    ) {
      console.log(brand.dim(t('init.apiOnlyHint')));
      return;
    }
    console.error(chalk.red('[reactpress]'), err.message || err);
    process.exit(err.exitCode ?? 1);
  }
}

async function runInit(directory = '.', options = { force: false }) {
  const projectRoot = path.resolve(directory);
  process.env.REACTPRESS_ORIGINAL_CWD = projectRoot;

  const project = describeProject(projectRoot);
  await refreshBannerWithStartup(projectRoot, project);

  const result = isMonorepoCheckout(projectRoot)
    ? await initMonorepoProject(projectRoot, { force: !!options.force })
    : await initProject({ directory: projectRoot, force: !!options.force });

  if (!result.ok) {
    console.error(chalk.red('[reactpress]'), result.message);
    process.exit(1);
  }

  console.log(`${brand.success('✓')} ${result.message}`);
  await startServices(projectRoot);
}

program
  .command('init [directory]')
  .description(t('cli.init.description'))
  .option('-f, --force', t('cli.init.force'))
  .action(async (directory, options) => {
    await runInit(directory || '.', options);
  });

const doctorCommand = program
  .command('doctor')
  .description(t('cli.doctor.description'));

doctorCommand
  .command('logs [directory]')
  .description(t('cli.doctor.logs.description'))
  .option('--tail <n>', t('cli.doctor.logs.tailOption'), '50')
  .option('--source <name>', t('cli.doctor.logs.sourceOption'), 'error')
  .option('--grep <pattern>', t('cli.doctor.logs.grepOption'))
  .option('--list', t('cli.doctor.logs.listOption'))
  .action(async (directory, options) => {
    const projectRoot = path.resolve(directory || '.');
    process.env.REACTPRESS_ORIGINAL_CWD = projectRoot;
    const code = await runDoctorLogs(projectRoot, options);
    process.exit(code);
  });

doctorCommand
  .command('check [directory]', { isDefault: true })
  .description(t('cli.doctor.description'))
  .option('--show-logs', t('cli.doctor.showLogs'))
  .action(async (directory, options) => {
    const projectRoot = path.resolve(directory || '.');
    process.env.REACTPRESS_ORIGINAL_CWD = projectRoot;
    const code = await runDoctor(projectRoot, options);
    process.exit(code);
  });

program.on('--help', () => {
  console.log('');
  console.log(brand.bold(t('cli.help.examples')));
  console.log(divider(40));
  for (const line of [
    t('cli.help.init'),
    t('cli.help.doctor'),
    t('cli.help.doctorLogs'),
    t('cli.help.zeroDep'),
  ]) {
    console.log(brand.dim(line));
  }
  console.log('');
});

async function showHelpBanner() {
  const projectRoot = path.resolve(process.env.REACTPRESS_ORIGINAL_CWD || '.');
  const project = describeProject(projectRoot);
  await refreshBannerWithStartup(projectRoot, project, { animated: false });
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv[0] && LEGACY_COMMANDS.has(argv[0])) {
    console.error(chalk.red('[reactpress]'), t('init.unknownCommand', { cmd: argv[0] }));
    console.error(brand.dim(t('init.useInitOnly')));
    process.exit(1);
  }

  const wantsHelp =
    argv.length === 0 || argv.includes('-h') || argv.includes('--help');

  if (wantsHelp) {
    await showHelpBanner();
    if (argv.length === 0) {
      program.outputHelp();
      return;
    }
  }

  program.parse(process.argv);
}

main().catch((err) => {
  console.error(chalk.red('[reactpress]'), err.message || err);
  process.exit(1);
});
