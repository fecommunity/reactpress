#!/usr/bin/env node

/**
 * ReactPress unified CLI — init, dev, build, server, docker, publish.
 * Run without arguments for an interactive menu (Claude Code–style).
 */

const { Command } = require('commander');
const path = require('path');
const chalk = require('chalk');
const { ensureOriginalCwd } = require('../lib/root');
const { ensureProjectEnvironment, initMonorepoProject } = require('../lib/bootstrap');
const { runDev } = require('../lib/dev');
const { runApiDev } = require('../lib/api-dev');
const { runLifecycleCommand } = require('../lib/lifecycle');
const { runDockerCommand } = require('../lib/docker');
const { printUnifiedStatus } = require('../lib/status');
const { runDoctor } = require('../lib/doctor');
const { runDbBackup } = require('../lib/db-backup');
const { runBuild } = require('../lib/build');
const { startApiWithPm2 } = require('../lib/pm2');
const { runNodeScript, runReactpressCli } = require('../lib/spawn');
const { getClientBin } = require('../lib/paths');
const { runInteractiveLoop } = require('../ui/interactive');
const { t } = require('../lib/i18n');

const rootPkg = require(path.join(__dirname, '..', 'package.json'));

const program = new Command();

program
  .name('reactpress')
  .description(t('cli.description'))
  .version(rootPkg.version);

program
  .command('init')
  .description(t('cli.init.description'))
  .argument('[directory]', t('cli.init.directory'), '.')
  .option('-f, --force', t('cli.init.force'))
  .action(async (directory, options) => {
    const projectRoot = path.resolve(directory);
    process.env.REACTPRESS_ORIGINAL_CWD = projectRoot;
    const { isMonorepoCheckout } = require('../lib/bootstrap');
    if (isMonorepoCheckout(projectRoot)) {
      const result = await initMonorepoProject(projectRoot, { force: !!options.force });
      console.log(`[reactpress] ${result.message}`);
      process.exit(result.ok ? 0 : 1);
      return;
    }
    const args = ['init', directory];
    if (options.force) args.push('--force');
    runReactpressCli(args, { cwd: projectRoot });
  });

program
  .command('dev')
  .description(t('cli.dev.description'))
  .option('--api-only', t('cli.dev.apiOnly'))
  .option('--client-only', t('cli.dev.clientOnly'))
  .action(async (options) => {
    const projectRoot = ensureOriginalCwd();
    try {
      if (options.clientOnly) {
        await runNodeScript(getClientBin(), [], { cwd: projectRoot });
        return;
      }
      if (options.apiOnly) {
        await runApiDev(projectRoot);
        return;
      }
      await runDev(projectRoot);
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(err.exitCode ?? 1);
    }
  });

const serverCmd = program.command('server').description(t('cli.server.description'));

serverCmd
  .command('start')
  .description(t('cli.server.start.description'))
  .option('--pm2', t('cli.server.start.pm2'))
  .option('--bg', t('cli.server.start.bg'))
  .action(async (options) => {
    const projectRoot = ensureOriginalCwd();
    try {
      if (options.pm2) {
        await startApiWithPm2(projectRoot);
        return;
      }
      const cmd = options.bg ? 'start:bg' : 'start';
      const code = await runLifecycleCommand(cmd, projectRoot);
      process.exit(code ?? 0);
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

serverCmd.command('stop').description(t('cli.server.stop')).action(async () => {
  const code = await runLifecycleCommand('stop', ensureOriginalCwd());
  process.exit(code ?? 0);
});

serverCmd.command('restart').description(t('cli.server.restart')).action(async () => {
  const code = await runLifecycleCommand('restart', ensureOriginalCwd());
  process.exit(code ?? 0);
});

serverCmd.command('status').description(t('cli.server.status')).action(async () => {
  await runLifecycleCommand('status', ensureOriginalCwd());
});

const clientCmd = program.command('client').description(t('cli.client.description'));

clientCmd
  .command('start')
  .description(t('cli.client.start'))
  .option('--pm2', t('cli.client.start.pm2'))
  .action(async (options) => {
    const args = options.pm2 ? ['--pm2'] : [];
    await runNodeScript(getClientBin(), args, { cwd: ensureOriginalCwd() });
  });

program
  .command('build')
  .description(t('cli.build.description'))
  .option('-t, --target <target>', t('cli.build.target'), 'all')
  .action(async (options) => {
    try {
      await runBuild(options.target, ensureOriginalCwd());
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

const dockerCmd = program.command('docker').description(t('cli.docker.description'));

dockerCmd
  .command('up')
  .description(t('cli.docker.up'))
  .action(async () => {
    await runDockerCommand('up', ensureOriginalCwd());
  });

dockerCmd
  .command('down')
  .alias('stop')
  .description(t('cli.docker.down'))
  .action(async () => {
    await runDockerCommand('down', ensureOriginalCwd());
  });

dockerCmd
  .command('start')
  .description(t('cli.docker.start'))
  .action(async () => {
    await runDockerCommand('start', ensureOriginalCwd());
  });

dockerCmd.command('restart').description(t('cli.docker.restart')).action(async () => {
  await runDockerCommand('restart', ensureOriginalCwd());
});

dockerCmd.command('status').description(t('cli.docker.status')).action(async () => {
  await runDockerCommand('status', ensureOriginalCwd());
});

dockerCmd
  .command('logs [service]')
  .description(t('cli.docker.logs'))
  .action(async (service) => {
    await runDockerCommand('logs', ensureOriginalCwd(), service ? [service] : []);
  });

program
  .command('status')
  .description(t('cli.status.description'))
  .action(async () => {
    await printUnifiedStatus(ensureOriginalCwd());
  });

program
  .command('doctor')
  .description(t('cli.doctor.description'))
  .action(async () => {
    const code = await runDoctor(ensureOriginalCwd());
    process.exit(code);
  });

const dbCmd = program.command('db').description(t('cli.db.description'));

dbCmd
  .command('backup')
  .description(t('cli.db.backup'))
  .option('-o, --output <file>', t('cli.db.backup.output'))
  .action(async (options) => {
    try {
      await runDbBackup(ensureOriginalCwd(), options.output);
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('publish')
  .description(t('cli.publish.description'))
  .option('--build', t('cli.publish.build'))
  .option('--publish', t('cli.publish.publish'))
  .action(async (options) => {
    const prev = process.argv.slice();
    const args = [process.argv[0], process.argv[1]];
    if (options.build) args.push('--build');
    else if (options.publish) args.push('--publish');
    else args.push('--publish');
    process.argv = args;
    try {
      await require('../lib/publish').main();
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    } finally {
      process.argv = prev;
    }
  });

program
  .command('start')
  .description(t('cli.start.description'))
  .action(async () => {
    const projectRoot = ensureOriginalCwd();
    const { spawn } = require('child_process');
    const code = await runLifecycleCommand('start', projectRoot);
    if (code !== 0) process.exit(code);
    const child = spawn('pnpm', ['run', '--dir', './client', 'start'], {
      stdio: 'inherit',
      shell: true,
      cwd: projectRoot,
    });
    child.on('close', (c) => process.exit(c ?? 0));
  });

program.on('--help', () => {
  console.log('');
  console.log(chalk.gray(t('cli.help.examples')));
  console.log(t('cli.help.interactive'));
  console.log(t('cli.help.dev'));
  console.log(t('cli.help.init'));
  console.log(t('cli.help.server'));
  console.log(t('cli.help.status'));
  console.log(t('cli.help.doctor'));
  console.log(t('cli.help.docker'));
  console.log(t('cli.help.build'));
  console.log(t('cli.help.publish'));
  console.log('');
});

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    await runInteractiveLoop();
    return;
  }
  program.parse(process.argv);
}

main().catch((err) => {
  console.error(chalk.red('[reactpress]'), err.message || err);
  process.exit(1);
});
