#!/usr/bin/env node

/**
 * ReactPress unified CLI — init, dev, build, server, docker, publish.
 * Run without arguments for an interactive menu (Claude Code–style).
 */

const { Command } = require('commander');
const path = require('path');
const chalk = require('chalk');
const { ensureOriginalCwd, getMonorepoRoot } = require('../lib/root');
const { ensureProjectEnvironment, initMonorepoProject } = require('../lib/bootstrap');
const { runDev } = require('../lib/dev');
const { runApiDev } = require('../lib/api-dev');
const { runLifecycleCommand } = require('../lib/lifecycle');
const { runDockerCommand } = require('../lib/docker');
const { printUnifiedStatus } = require('../lib/status');
const { runBuild } = require('../lib/build');
const { startApiWithPm2 } = require('../lib/pm2');
const { runNodeScript, runReactpressCli } = require('../lib/spawn');
const { getClientBin } = require('../lib/paths');
const { runInteractiveLoop } = require('../ui/interactive');

const rootPkg = require(path.join(getMonorepoRoot(), 'package.json'));

const program = new Command();

program
  .name('reactpress')
  .description('ReactPress 全栈 CLI — 初始化、开发、构建、部署、发布')
  .version(rootPkg.version);

program
  .command('init')
  .description('初始化项目 (.reactpress/config.json + .env + Docker MySQL)')
  .argument('[directory]', '项目目录', '.')
  .option('-f, --force', '覆盖已有配置')
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
  .description('零配置开发: 环境检查 + toolkit 构建 + API + 前端')
  .option('--api-only', '仅启动 API (watch)')
  .option('--client-only', '仅启动前端')
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

const serverCmd = program.command('server').description('管理 API 服务');

serverCmd
  .command('start')
  .description('启动 API（等待 HTTP 就绪）')
  .option('--pm2', '使用 PM2 启动（生产）')
  .option('--bg', '后台启动，不等待 HTTP')
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

serverCmd.command('stop').description('停止 API').action(async () => {
  const code = await runLifecycleCommand('stop', ensureOriginalCwd());
  process.exit(code ?? 0);
});

serverCmd.command('restart').description('重启 API').action(async () => {
  const code = await runLifecycleCommand('restart', ensureOriginalCwd());
  process.exit(code ?? 0);
});

serverCmd.command('status').description('查看 API 状态').action(async () => {
  await runLifecycleCommand('status', ensureOriginalCwd());
});

const clientCmd = program.command('client').description('管理前端');

clientCmd
  .command('start')
  .description('启动 Next.js 客户端')
  .option('--pm2', '使用 PM2 启动')
  .action(async (options) => {
    const args = options.pm2 ? ['--pm2'] : [];
    await runNodeScript(getClientBin(), args, { cwd: ensureOriginalCwd() });
  });

program
  .command('build')
  .description('构建生产产物')
  .option('-t, --target <target>', 'toolkit | server | client | docs | all', 'all')
  .action(async (options) => {
    try {
      await runBuild(options.target, ensureOriginalCwd());
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

const dockerCmd = program.command('docker').description('Docker 开发环境 (MySQL + nginx)');

dockerCmd
  .command('up')
  .description('仅启动 Docker 服务并等待 MySQL')
  .action(async () => {
    await runDockerCommand('up', ensureOriginalCwd());
  });

dockerCmd
  .command('down')
  .alias('stop')
  .description('停止 Docker 服务')
  .action(async () => {
    await runDockerCommand('down', ensureOriginalCwd());
  });

dockerCmd
  .command('start')
  .description('启动 Docker + 全栈开发 (API + 前端)')
  .action(async () => {
    await runDockerCommand('start', ensureOriginalCwd());
  });

dockerCmd.command('restart').description('重启 Docker 服务').action(async () => {
  await runDockerCommand('restart', ensureOriginalCwd());
});

dockerCmd.command('status').description('查看 Docker 容器状态').action(async () => {
  await runDockerCommand('status', ensureOriginalCwd());
});

dockerCmd
  .command('logs [service]')
  .description('查看 Docker 日志 (db | nginx)')
  .action(async (service) => {
    await runDockerCommand('logs', ensureOriginalCwd(), service ? [service] : []);
  });

program
  .command('status')
  .description('查看项目、API、前端、Docker 综合状态')
  .action(async () => {
    await printUnifiedStatus(ensureOriginalCwd());
  });

program
  .command('publish')
  .description('构建并发布 npm 包 (交互式)')
  .option('--build', '仅构建所有包')
  .option('--publish', '交互式发布')
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
  .description('生产模式: 启动 API + 前端')
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
  console.log(chalk.gray('示例:'));
  console.log('  reactpress                  交互式菜单');
  console.log('  reactpress dev              零配置全栈开发');
  console.log('  reactpress init --force     重新初始化配置');
  console.log('  reactpress server start     启动 API');
  console.log('  reactpress status           综合状态');
  console.log('  reactpress docker start     Docker + 全栈');
  console.log('  reactpress publish          发布 npm 包');
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
