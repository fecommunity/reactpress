#!/usr/bin/env node

/**
 * ReactPress CLI — unified entry for monorepo development.
 * API lifecycle is delegated to @fecommunity/reactpress-cli; client stays local.
 */

const { Command } = require('commander');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const chalk = require('chalk');

const binDir = __dirname;
const rootDir = path.join(binDir, '..');

const program = new Command();

function runReactpressCli(args, options = {}) {
  const result = spawnSync('pnpm', ['exec', 'reactpress-cli', ...args], {
    cwd: options.cwd || rootDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: process.env.REACTPRESS_ORIGINAL_CWD || process.cwd(),
    },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function spawnNodeScript(scriptPath, args = [], options = {}) {
  const child = spawn(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: options.cwd || rootDir,
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: process.env.REACTPRESS_ORIGINAL_CWD || process.cwd(),
      ...options.env,
    },
  });
  child.on('error', (error) => {
    console.error(chalk.red('[ReactPress CLI]'), error);
    process.exit(1);
  });
  child.on('close', (code) => process.exit(code ?? 0));
}

const serverCmd = program.command('server').description('Manage the ReactPress API (via reactpress-cli)');

serverCmd
  .command('start')
  .description('Start the API server (reactpress-cli start, or --pm2 for production)')
  .option('--pm2', 'Start API with PM2 process manager')
  .action((options) => {
    if (options.pm2) {
      spawnNodeScript(path.join(rootDir, 'scripts', 'reactpress-api-pm2.js'));
      return;
    }
    runReactpressCli(['start']);
  });

serverCmd
  .command('stop')
  .description('Stop the API server')
  .option('--database', 'Also stop embedded database container')
  .action((options) => {
    const args = ['stop'];
    if (options.database) args.push('--database');
    runReactpressCli(args);
  });

serverCmd
  .command('restart')
  .description('Restart the API server')
  .action(() => runReactpressCli(['restart']));

serverCmd
  .command('status')
  .description('Show API and database status')
  .action(() => runReactpressCli(['status']));

const clientCmd = program.command('client').description('Manage the ReactPress client');

clientCmd
  .command('start')
  .description('Start the ReactPress client')
  .option('--pm2', 'Start client with PM2 process manager')
  .action((options) => {
    const clientScript = path.join(rootDir, 'client', 'bin', 'reactpress-client.js');
    const args = options.pm2 ? ['--pm2'] : [];
    spawnNodeScript(clientScript, args);
  });

program
  .command('init')
  .description('Initialize ReactPress in the current project (delegates to reactpress-cli)')
  .argument('[directory]', 'Project directory', '.')
  .option('-f, --force', 'Overwrite existing configuration')
  .action((directory, options) => {
    const args = ['init', directory];
    if (options.force) args.push('--force');
    runReactpressCli(args);
  });

const packageJson = require(path.join(rootDir, 'package.json'));
program.version(packageJson.version);

program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ reactpress init .              # Initialize .reactpress/config.json + .env');
  console.log('  $ reactpress server start        # Start API (reactpress-cli start)');
  console.log('  $ reactpress server start --pm2  # Start API with PM2');
  console.log('  $ reactpress client start        # Start Next.js client');
  console.log('  $ pnpm dev                       # Build toolkit + API + client');
  console.log('');
  console.log('API backend: @fecommunity/reactpress-cli bundled Nest server.');
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
