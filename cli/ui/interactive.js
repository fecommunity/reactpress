const inquirer = require('inquirer');
const open = require('open');
const { printBanner } = require('./banner');
const { brand, label } = require('./theme');
const { ensureOriginalCwd } = require('../lib/root');
const { describeProject, hasClient } = require('../lib/project-type');
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
const { loadClientSiteUrl, loadServerSiteUrl, isHttpResponding } = require('../lib/http');
const { isDockerRunning } = require('../lib/docker');
const { t } = require('../lib/i18n');

function section(title) {
  return new inquirer.Separator(brand.muted(`  ── ${title} ──`));
}

function getMenuActions(project) {
  const standalone = project.type === 'standalone';
  const monorepo = project.type === 'monorepo';
  const showClient = hasClient(project.root);

  const choices = [
    section(t('menu.section.run')),
    { name: t('menu.dev'), value: 'dev' },
    { name: t('menu.init'), value: 'init' },
    { name: t('menu.status'), value: 'status' },
    { name: t('menu.doctor'), value: 'doctor' },
    section(t('menu.section.lifecycle')),
    { name: t('menu.devApi'), value: 'dev:api' },
  ];

  if (showClient) {
    choices.push({ name: t('menu.devClient'), value: 'dev:client' });
  }

  choices.push(
    { name: t('menu.serverStart'), value: 'server:start' },
    { name: t('menu.serverStop'), value: 'server:stop' },
    { name: t('menu.serverRestart'), value: 'server:restart' },
    section(t('menu.section.build')),
    { name: t('menu.build'), value: 'build' }
  );

  if (monorepo) {
    choices.push(
      { name: t('menu.dockerStart'), value: 'docker:start' },
      { name: t('menu.dockerUp'), value: 'docker:up' },
      { name: t('menu.dockerStop'), value: 'docker:stop' }
    );
  } else if (standalone) {
    choices.push(
      { name: t('menu.dockerUp'), value: 'docker:up' },
      { name: t('menu.dockerStop'), value: 'docker:stop' }
    );
  }

  choices.push(
    section(t('menu.section.tools')),
    { name: t('menu.openAdmin'), value: 'open:admin' }
  );

  if (monorepo) {
    choices.push({ name: t('menu.publish'), value: 'publish' });
  }

  choices.push(
    new inquirer.Separator(),
    { name: t('menu.exit'), value: 'exit' }
  );

  return choices;
}

async function printContextStatus(projectRoot) {
  const apiUrl = loadServerSiteUrl(projectRoot);
  const [apiOk, dockerOk] = await Promise.all([
    isHttpResponding(apiUrl, 1500),
    Promise.resolve(isDockerRunning()),
  ]);

  let dbOk = false;
  try {
    const mysql = require('mysql2/promise');
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(projectRoot, '.env');
    const env = {};
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
        const m = line.match(/^([A-Z_]+)=(.*)$/);
        if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
      }
    }
    const conn = await mysql.createConnection({
      host: env.DB_HOST || '127.0.0.1',
      port: Number(env.DB_PORT || 3306),
      user: env.DB_USER || 'reactpress',
      password: env.DB_PASSWD || env.DB_PASSWORD || 'reactpress',
      database: env.DB_DATABASE || 'reactpress',
      connectTimeout: 2000,
    });
    await conn.ping();
    await conn.end();
    dbOk = true;
  } catch {
  }

  const on = t('menu.statusOn');
  const off = t('menu.statusOff');
  const ready = t('menu.statusReady');
  const notReady = t('menu.statusNotReady');
  const yes = t('menu.statusYes');
  const no = t('menu.statusNo');

  console.log(brand.muted(t('menu.statusApi', { status: apiOk ? on : off })));
  console.log(brand.muted(t('menu.statusDb', { status: dbOk ? ready : notReady })));
  console.log(brand.muted(t('menu.statusDocker', { status: dockerOk ? yes : no })));
  console.log('');
}

async function runMenuAction(action, projectRoot, project) {
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
      console.log(label(t('menu.startingApi')));
      const code = await runLifecycleCommand('start', projectRoot);
      if (code !== 0) process.exit(code);
      return true;
    }
    case 'server:stop':
      console.log(label(t('menu.stoppingApi')));
      await runLifecycleCommand('stop', projectRoot);
      return true;
    case 'server:restart': {
      console.log(label(t('menu.restartingApi')));
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
  const project = describeProject(projectRoot);

  printBanner({ projectRoot, project });
  await printContextStatus(projectRoot);
  console.log(brand.muted(`  ${t('menu.tip')}`));
  console.log('');

  let loop = true;
  while (loop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: t('menu.prompt'),
        pageSize: 18,
        choices: getMenuActions(project),
      },
    ]);

    if (action === 'exit') {
      console.log(brand.muted(t('menu.goodbye')));
      break;
    }

    try {
      const stay = await runMenuAction(action, projectRoot, project);
      if (!stay) break;

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
        if (loop) {
          console.log('');
          await printContextStatus(projectRoot);
        }
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

module.exports = { runInteractiveLoop, runMenuAction, getMenuActions };
