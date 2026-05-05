#!/usr/bin/env node

/**
 * ReactPress CLI — unified entry for monorepo development.
 * API: local server/ package; init / Docker DB: reactpress-cli.
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

function runLifecycle(command, extraArgs = []) {
  spawnNodeScript(path.join(rootDir, 'scripts', 'reactpress-api-lifecycle.js'), [command, ...extraArgs]);
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

const serverCmd = program.command('server').description('Manage the ReactPress API (monorepo server/)');

serverCmd
  .command('start')
  .description('Start the API server (local server/ or --pm2 for production)')
  .option('--pm2', 'Start API with PM2 process manager')
  .action((options) => {
    if (options.pm2) {
      spawnNodeScript(path.join(rootDir, 'scripts', 'reactpress-api-pm2.js'));
      return;
    }
    runLifecycle('start');
  });

serverCmd
  .command('stop')
  .description('Stop the API server')
  .action(() => runLifecycle('stop'));

serverCmd
  .command('restart')
  .description('Restart the API server')
  .action(() => runLifecycle('restart'));

serverCmd
  .command('status')
  .description('Show API status')
  .action(() => runLifecycle('status'));

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
  .description('Initialize ReactPress (.reactpress/config.json + .env via reactpress-cli)')
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
  console.log('  $ reactpress init .              # .reactpress/config.json + .env');
  console.log('  $ reactpress server start        # Local Nest API (server/)');
  console.log('  $ reactpress server start --pm2  # PM2 production API');
  console.log('  $ reactpress client start        # Next.js client');
  console.log('  $ pnpm dev                       # 零配置: env + DB + toolkit + API + client');
  console.log('');
  console.log('API backend: monorepo server/ (NestJS). Init/DB: @fecommunity/reactpress-cli.');
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
