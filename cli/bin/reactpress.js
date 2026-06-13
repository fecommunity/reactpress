#!/usr/bin/env node

/**
 * ReactPress unified CLI — init, dev, build, server, docker, publish.
 * Run without arguments for an interactive menu (Claude Code–style).
 */

const { Command } = require('commander');
const path = require('path');
const chalk = require('chalk');
const { brand, divider } = require('../ui/theme');
const { ensureOriginalCwd } = require('../lib/root');
const { ensureProjectEnvironment, initMonorepoProject } = require('../lib/bootstrap');
const { runDev, runWebDev, runThemeDev, runDesktopDev } = require('../lib/dev');
const { resolveDevApiOrigins, applyDevApiOriginsToEnv } = require('../lib/remote-dev');
const { runApiDev } = require('../lib/api-dev');
const { runLifecycleCommand } = require('../lib/lifecycle');
const { runDockerCommand } = require('../lib/docker');
const { runNginxCommand } = require('../lib/nginx');
const { printUnifiedStatus } = require('../lib/status');
const { runDoctor } = require('../lib/doctor');
const { runDbBackup } = require('../lib/db-backup');
const { runBuild } = require('../lib/build');
const { startApiWithPm2 } = require('../lib/pm2');
const { runNodeScript, runReactpressCli } = require('../lib/spawn');
const { getThemeBin } = require('../lib/paths');
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
  .option('--web-only', t('cli.dev.webOnly'))
  .option('--remote-origin <url>', t('cli.dev.remoteOrigin'))
  .option('--admin-origin <value>', t('cli.dev.adminOrigin'))
  .option('--client-origin <value>', t('cli.dev.clientOrigin'))
  .action(async (options) => {
    const projectRoot = ensureOriginalCwd();
    try {
      const hasOriginFlag =
        options.remoteOrigin !== undefined ||
        options.adminOrigin !== undefined ||
        options.clientOrigin !== undefined;

      let apiOrigins = { admin: null, client: null, needsLocalApi: true };
      if (hasOriginFlag) {
        const resolved = resolveDevApiOrigins(projectRoot, {
          remoteOrigin: options.remoteOrigin,
          adminOrigin: options.adminOrigin,
          clientOrigin: options.clientOrigin,
        });
        if (resolved.error === 'REMOTE_DEFAULT_REQUIRED') {
          console.error(chalk.red('[reactpress]'), t('cli.dev.remoteDefaultRequired'));
          process.exit(1);
        }
        if (resolved.error === 'INVALID_ORIGIN') {
          console.error(chalk.red('[reactpress]'), t('cli.dev.invalidOrigin'));
          process.exit(1);
        }
        if (
          options.remoteOrigin !== undefined &&
          !resolved.remoteDefault &&
          options.adminOrigin === undefined &&
          options.clientOrigin === undefined
        ) {
          console.error(chalk.red('[reactpress]'), t('cli.dev.remoteOriginRequired'));
          process.exit(1);
        }
        apiOrigins = resolved;
        applyDevApiOriginsToEnv(apiOrigins);
      }

      if (options.clientOnly) {
        await runThemeDev(projectRoot, { apiOrigins });
        return;
      }
      if (options.webOnly) {
        await runWebDev(projectRoot, { apiOrigins });
        return;
      }
      if (options.apiOnly) {
        if (!apiOrigins.needsLocalApi) {
          console.error(chalk.red('[reactpress]'), t('cli.dev.remoteOriginIncompatibleApiOnly'));
          process.exit(1);
        }
        await runApiDev(projectRoot);
        return;
      }
      await runDev(projectRoot, { apiOrigins });
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(err.exitCode ?? 1);
    }
  });

const desktopCmd = program.command('desktop').description(t('cli.desktopDev.description'));

desktopCmd
  .command('dev')
  .description(t('cli.desktopDev.description'))
  .action(async () => {
    const projectRoot = ensureOriginalCwd();
    try {
      await runDesktopDev(projectRoot);
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
    const projectRoot = ensureOriginalCwd();
    const { resolveThemeDirectory, readActiveThemeManifest } = require('../lib/theme-runtime');
    const { resolveProductionThemeEnv } = require('../lib/theme-prod');
    const { activeTheme } = readActiveThemeManifest(projectRoot);
    const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
    const args = options.pm2 ? ['--pm2'] : [];
    const env =
      themeDir && options.pm2
        ? resolveProductionThemeEnv(projectRoot, themeDir)
        : themeDir
          ? { REACTPRESS_THEME_DIR: themeDir }
          : undefined;
    await runNodeScript(getThemeBin(projectRoot), args, {
      cwd: projectRoot,
      env,
    });
  });

clientCmd
  .command('restart')
  .description(t('cli.client.restart'))
  .option('--pm2', t('cli.client.start.pm2'))
  .action(async (options) => {
    try {
      const projectRoot = ensureOriginalCwd();
      const { restartProductionVisitorClient } = require('../lib/theme-prod');
      if (options.pm2) {
        await restartProductionVisitorClient(projectRoot);
      } else {
        const { buildActiveTheme } = require('../lib/theme-prod');
        const { activeTheme, themeDir } = buildActiveTheme(projectRoot);
        const args = [];
        await runNodeScript(getThemeBin(projectRoot), args, {
          cwd: projectRoot,
          env: { REACTPRESS_THEME_DIR: themeDir },
        });
        console.log(`[reactpress] ${require('../lib/i18n').t('themeProd.restarted', { id: activeTheme })}`);
      }
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('build')
  .description(t('cli.build.description'))
  .option('-t, --target <target>', t('cli.build.target'), 'all')
  .option('--low-mem', t('cli.build.lowMem'))
  .action(async (options) => {
    try {
      if (options.lowMem) {
        process.env.REACTPRESS_LOW_MEM = '1';
      }
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

const nginxCmd = program.command('nginx').description(t('cli.nginx.description'));

function nginxActionOptions(cmd) {
  return cmd.option('--prod', t('cli.nginx.prod')).option('-f, --force', t('cli.nginx.force'));
}

nginxActionOptions(nginxCmd.command('ensure').description(t('cli.nginx.ensure'))).action(async (options) => {
  try {
    await runNginxCommand('ensure', ensureOriginalCwd(), [], options);
  } catch (err) {
    console.error(chalk.red('[reactpress]'), err.message || err);
    process.exit(1);
  }
});

nginxActionOptions(nginxCmd.command('up').description(t('cli.nginx.up'))).action(async (options) => {
  try {
    await runNginxCommand('up', ensureOriginalCwd(), [], options);
  } catch (err) {
    console.error(chalk.red('[reactpress]'), err.message || err);
    process.exit(1);
  }
});

nginxCmd
  .command('down')
  .alias('stop')
  .description(t('cli.nginx.down'))
  .option('--prod', t('cli.nginx.prod'))
  .action(async (options) => {
    try {
      await runNginxCommand('down', ensureOriginalCwd(), [], options);
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

nginxActionOptions(nginxCmd.command('restart').description(t('cli.nginx.restart'))).action(async (options) => {
  try {
    await runNginxCommand('restart', ensureOriginalCwd(), [], options);
  } catch (err) {
    console.error(chalk.red('[reactpress]'), err.message || err);
    process.exit(1);
  }
});

nginxCmd
  .command('status')
  .description(t('cli.nginx.status'))
  .option('--prod', t('cli.nginx.prod'))
  .action(async (options) => {
    try {
      await runNginxCommand('status', ensureOriginalCwd(), [], options);
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

nginxCmd.command('logs').description(t('cli.nginx.logs')).action(async () => {
  try {
    await runNginxCommand('logs', ensureOriginalCwd());
  } catch (err) {
    console.error(chalk.red('[reactpress]'), err.message || err);
    process.exit(1);
  }
});

nginxCmd.command('test').description(t('cli.nginx.test')).action(async () => {
  try {
    await runNginxCommand('test', ensureOriginalCwd());
  } catch (err) {
    console.error(chalk.red('[reactpress]'), err.message || err);
    process.exit(1);
  }
});

nginxCmd.command('reload').description(t('cli.nginx.reload')).action(async () => {
  try {
    await runNginxCommand('reload', ensureOriginalCwd());
  } catch (err) {
    console.error(chalk.red('[reactpress]'), err.message || err);
    process.exit(1);
  }
});

nginxCmd.command('open').description(t('cli.nginx.open')).action(async () => {
  try {
    await runNginxCommand('open', ensureOriginalCwd());
  } catch (err) {
    console.error(chalk.red('[reactpress]'), err.message || err);
    process.exit(1);
  }
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
    try {
      const publish = require('../lib/publish');
      if (options.build) {
        await publish.buildPackages();
        return;
      }
      await publish.publishPackages();
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

const themeCmd = program.command('theme').description(t('cli.theme.description'));

themeCmd
  .command('add')
  .description(t('cli.theme.add.description'))
  .argument('[spec]', t('cli.theme.add.spec'))
  .option('--catalog <id>', t('cli.theme.add.catalog'))
  .option('--skip-deps', t('cli.theme.add.skipDeps'))
  .action(async (spec, options) => {
    try {
      const projectRoot = ensureOriginalCwd();
      const targetSpec = options.catalog || spec;
      if (!targetSpec) {
        throw new Error(t('themeInstall.specRequired'));
      }
      await require('../lib/theme-cli').runThemeAdd(projectRoot, targetSpec, {
        skipDependencies: !!options.skipDeps,
      });
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

themeCmd.command('list').description(t('cli.theme.list.description')).action(() => {
  require('../lib/theme-cli').runThemeList(ensureOriginalCwd());
});

const pluginCmd = program.command('plugin').description('Manage ReactPress plugins');

pluginCmd
  .command('install')
  .description('Install a local plugin into .reactpress/plugins')
  .argument('<id>', 'Plugin id from plugins/ registry')
  .action((id) => {
    try {
      require('../lib/plugin-cli').runPluginInstall(ensureOriginalCwd(), id);
    } catch (err) {
      console.error(chalk.red('[reactpress]'), err.message || err);
      process.exit(1);
    }
  });

pluginCmd.command('list').description('List registered plugins').action(() => {
  require('../lib/plugin-cli').runPluginList(ensureOriginalCwd());
});

program
  .command('start')
  .description(t('cli.start.description'))
  .action(async () => {
    const projectRoot = ensureOriginalCwd();
    const code = await runLifecycleCommand('start', projectRoot);
    if (code !== 0) process.exit(code);

    const { resolveThemeDirectory, readActiveThemeManifest } = require('../lib/theme-runtime');
    const { activeTheme } = readActiveThemeManifest(projectRoot);
    const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
    if (!themeDir) {
      console.log(t('dev.standaloneHint'));
      return;
    }
    const { spawn } = require('child_process');
    const child = spawn('pnpm', ['run', 'start'], {
      stdio: 'inherit',
      shell: true,
      cwd: themeDir,
    });
    child.on('close', (c) => process.exit(c ?? 0));
  });

program.on('--help', () => {
  console.log('');
  console.log(brand.bold(t('cli.help.examples')));
  console.log(divider(40));
  const lines = [
    t('cli.help.interactive'),
    t('cli.help.dev'),
    t('cli.help.init'),
    t('cli.help.server'),
    t('cli.help.status'),
    t('cli.help.doctor'),
    t('cli.help.docker'),
    t('cli.help.nginx'),
    t('cli.help.build'),
    t('cli.help.publish'),
    t('cli.help.theme'),
  ];
  for (const line of lines) {
    console.log(brand.dim(line));
  }
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
