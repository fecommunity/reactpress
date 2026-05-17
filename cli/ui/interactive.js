const inquirer = require('inquirer');
const open = require('open');
const { printBanner } = require('./banner');
const { brand, label } = require('./theme');
const { ensureOriginalCwd } = require('../lib/root');
const { ensureProjectEnvironment } = require('../lib/bootstrap');
const { runDev } = require('../lib/dev');
const { runApiDev } = require('../lib/api-dev');
const { runLifecycleCommand } = require('../lib/lifecycle');
const { runDockerCommand } = require('../lib/docker');
const { printUnifiedStatus } = require('../lib/status');
const { runDoctor } = require('../lib/doctor');
const { runBuild, TARGETS } = require('../lib/build');
const { runNodeScript } = require('../lib/spawn');
const { getClientBin } = require('../lib/paths');
const { loadClientSiteUrl } = require('../lib/http');
const { t } = require('../lib/i18n');

function getMenuActions() {
  return [
    { name: t('menu.dev'), value: 'dev' },
    { name: t('menu.init'), value: 'init' },
    { name: t('menu.status'), value: 'status' },
    { name: t('menu.doctor'), value: 'doctor' },
    new inquirer.Separator(),
    { name: t('menu.devApi'), value: 'dev:api' },
    { name: t('menu.devClient'), value: 'dev:client' },
    { name: t('menu.serverStart'), value: 'server:start' },
    { name: t('menu.serverStop'), value: 'server:stop' },
    { name: t('menu.serverRestart'), value: 'server:restart' },
    new inquirer.Separator(),
    { name: t('menu.build'), value: 'build' },
    { name: t('menu.dockerStart'), value: 'docker:start' },
    { name: t('menu.dockerUp'), value: 'docker:up' },
    { name: t('menu.dockerStop'), value: 'docker:stop' },
    new inquirer.Separator(),
    { name: t('menu.openAdmin'), value: 'open:admin' },
    { name: t('menu.publish'), value: 'publish' },
    { name: t('menu.exit'), value: 'exit' },
  ];
}

async function runMenuAction(action, projectRoot) {
  switch (action) {
    case 'dev':
      console.log(label(t('menu.startingDev')));
      await runDev(projectRoot);
      return false;
    case 'init': {
      console.log(label(t('menu.initProject')));
      const result = await ensureProjectEnvironment(projectRoot);
      console.log(brand.success(result.message || t('menu.done')));
      return true;
    }
    case 'status':
      await printUnifiedStatus(projectRoot);
      return true;
    case 'doctor': {
      const code = await runDoctor(projectRoot);
      if (code !== 0) process.exit(code);
      return true;
    }
    case 'dev:api':
      await runApiDev(projectRoot);
      return false;
    case 'dev:client':
      await runNodeScript(getClientBin(), [], { cwd: projectRoot });
      return false;
    case 'server:start': {
      const code = await runLifecycleCommand('start', projectRoot);
      if (code !== 0) process.exit(code);
      return true;
    }
    case 'server:stop':
      await runLifecycleCommand('stop', projectRoot);
      return true;
    case 'server:restart': {
      const code = await runLifecycleCommand('restart', projectRoot);
      if (code !== 0) process.exit(code);
      return true;
    }
    case 'build': {
      const buildChoices = TARGETS.map((target) => ({
        name:
          target === 'all'
            ? t('menu.buildAll')
            : t(`build.label.${target}`),
        value: target,
      }));
      const { target } = await inquirer.prompt([
        {
          type: 'list',
          name: 'target',
          message: t('menu.buildTarget'),
          choices: buildChoices,
        },
      ]);
      await runBuild(target, projectRoot);
      return true;
    }
    case 'docker:start':
      await runDockerCommand('start', projectRoot);
      return false;
    case 'docker:up':
      await runDockerCommand('up', projectRoot);
      return true;
    case 'docker:stop':
      await runDockerCommand('down', projectRoot);
      return true;
    case 'open:admin': {
      const url = loadClientSiteUrl(projectRoot);
      console.log(label(t('menu.opening', { url })));
      await open(url);
      return true;
    }
    case 'publish': {
      const prev = process.argv.slice();
      process.argv = [process.argv[0], process.argv[1], '--publish'];
      await require('../lib/publish').main();
      process.argv = prev;
      return true;
    }
    case 'exit':
      console.log(brand.muted(t('menu.goodbye')));
      return false;
    default:
      return true;
  }
}

async function runInteractiveLoop() {
  const projectRoot = ensureOriginalCwd();
  printBanner();

  let loop = true;
  while (loop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: t('menu.prompt'),
        pageSize: 14,
        choices: getMenuActions(),
      },
    ]);

    if (action === 'exit') {
      console.log(brand.muted(t('menu.goodbye')));
      break;
    }

    try {
      const stay = await runMenuAction(action, projectRoot);
      if (!stay) {
        break;
      }

      if (action !== 'status') {
        const { again } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'again',
            message: t('menu.back'),
            default: true,
          },
        ]);
        loop = again;
      }
    } catch (err) {
      console.error(brand.error(`  ${err.message || err}`));
      const { retry } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'retry',
          message: t('menu.retry'),
          default: true,
        },
      ]);
      loop = retry;
    }
  }
}

module.exports = { runInteractiveLoop, runMenuAction };
