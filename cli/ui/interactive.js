const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');
const open = require('open');
const { printBanner } = require('./banner');
const {
  brand,
  icon,
  label,
  ok,
  fail,
  sectionHeader,
  statusPill,
  padRight,
} = require('./theme');
const { ensureOriginalCwd } = require('../lib/root');
const { describeProject, hasClient } = require('../lib/project-type');
const { ensureProjectEnvironment } = require('../lib/bootstrap');
const { runDev } = require('../lib/dev');
const { runApiDev } = require('../lib/api-dev');
const { runLifecycleCommand } = require('../lib/lifecycle');
const { runDockerCommand } = require('../lib/docker');
const { runNginxCommand } = require('../lib/nginx');
const { printUnifiedStatus } = require('../lib/status');
const { runDoctor } = require('../lib/doctor');
const { runBuild, TARGETS } = require('../lib/build');
const { runNodeScript } = require('../lib/spawn');
const { getClientBin } = require('../lib/paths');
const { loadClientSiteUrl, loadServerSiteUrl, isHttpResponding } = require('../lib/http');
const { isDockerRunning } = require('../lib/docker');
const { t } = require('../lib/i18n');

function menuSection(title) {
  return new inquirer.Separator(sectionHeader(title));
}

function formatChoice(key, text, hint) {
  const keyCol = key ? brand.primary(padRight(key, 2)) : '   ';
  const hintPart = hint ? brand.dim(`  ${hint}`) : '';
  return `${keyCol}  ${text}${hintPart}`;
}

function assignShortcuts(items) {
  let n = 0;
  return items.map((item) => {
    if (item instanceof inquirer.Separator || item.type === 'separator') {
      return item;
    }
    n += 1;
    const key = n <= 9 ? String(n) : '';
    return {
      ...item,
      name: formatChoice(key, item._label || item.name, item._hint),
      short: item.value,
    };
  });
}

function choice(labelKey, value, hintKey) {
  return {
    _label: t(labelKey),
    _hint: hintKey ? t(hintKey) : '',
    value,
  };
}

function getMenuActions(project) {
  const standalone = project.type === 'standalone';
  const monorepo = project.type === 'monorepo';
  const showClient = hasClient(project.root);

  const items = [
    menuSection(t('menu.section.run')),
    choice('menu.dev', 'dev', 'menu.hint.dev'),
    choice('menu.init', 'init', 'menu.hint.init'),
    choice('menu.status', 'status', 'menu.hint.status'),
    choice('menu.doctor', 'doctor', 'menu.hint.doctor'),
    menuSection(t('menu.section.lifecycle')),
    choice('menu.devApi', 'dev:api', 'menu.hint.devApi'),
  ];

  if (showClient) {
    items.push(choice('menu.devClient', 'dev:client', 'menu.hint.devClient'));
  }

  items.push(
    choice('menu.serverStart', 'server:start', 'menu.hint.serverStart'),
    choice('menu.serverStop', 'server:stop', 'menu.hint.serverStop'),
    choice('menu.serverRestart', 'server:restart', 'menu.hint.serverRestart'),
    menuSection(t('menu.section.build')),
    choice('menu.build', 'build', 'menu.hint.build')
  );

  if (monorepo) {
    items.push(
      choice('menu.dockerStart', 'docker:start', 'menu.hint.dockerStart'),
      choice('menu.dockerUp', 'docker:up', 'menu.hint.dockerUp'),
      choice('menu.dockerStop', 'docker:stop', 'menu.hint.dockerStop')
    );
  } else if (standalone) {
    items.push(
      choice('menu.dockerUp', 'docker:up', 'menu.hint.dockerUp'),
      choice('menu.dockerStop', 'docker:stop', 'menu.hint.dockerStop')
    );
  }

  items.push(
    menuSection(t('menu.section.tools')),
    choice('menu.nginxUp', 'nginx:up', 'menu.hint.nginxUp'),
    choice('menu.nginxOpen', 'nginx:open', 'menu.hint.nginxOpen'),
    choice('menu.nginxReload', 'nginx:reload', 'menu.hint.nginxReload'),
    choice('menu.openAdmin', 'open:admin', 'menu.hint.openAdmin')
  );

  if (monorepo) {
    items.push(choice('menu.publish', 'publish', 'menu.hint.publish'));
  }

  items.push(
    new inquirer.Separator(),
    choice('menu.exit', 'exit', 'menu.hint.exit')
  );

  return assignShortcuts(items);
}

function parseEnvFile(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  const env = {};
  try {
    if (!fs.existsSync(envPath)) return env;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
    }
  } catch {
    // ignore
  }
  return env;
}

async function probeDatabase(projectRoot) {
  try {
    const mysql = require('mysql2/promise');
    const env = parseEnvFile(projectRoot);
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
    return true;
  } catch {
    return false;
  }
}

async function fetchContextStatus(projectRoot) {
  const apiUrl = loadServerSiteUrl(projectRoot);
  const [apiOk, dockerOk, dbOk] = await Promise.all([
    isHttpResponding(apiUrl, 1500),
    Promise.resolve(isDockerRunning()),
    probeDatabase(projectRoot),
  ]);
  return { apiOk, dbOk, dockerOk };
}

function printStatusPanel(status) {
  const on = { on: t('menu.statusOn'), off: t('menu.statusOff') };
  const db = {
    on: t('menu.statusReady'),
    off: t('menu.statusNotReady'),
    pending: t('menu.statusChecking'),
  };
  const docker = { on: t('menu.statusYes'), off: t('menu.statusNo') };

  console.log(sectionHeader(t('menu.statusHeader')));
  const rows = [
    [t('menu.statusLabelApi'), statusPill(status.apiOk, on)],
    [t('menu.statusLabelDb'), statusPill(status.dbOk, db)],
    [t('menu.statusLabelDocker'), statusPill(status.dockerOk, docker)],
  ];
  for (const [name, pill] of rows) {
    console.log(`  ${brand.muted(padRight(name, 10))}  ${pill}`);
  }
  console.log('');
}

async function printContextStatus(projectRoot) {
  const spinner = ora({
    text: brand.dim(t('menu.statusChecking')),
    color: 'magenta',
    spinner: 'dots',
  }).start();
  const status = await fetchContextStatus(projectRoot);
  spinner.stop();
  printStatusPanel(status);
  return status;
}

async function withSpinner(text, fn) {
  const spinner = ora({ text, color: 'magenta', spinner: 'dots' }).start();
  try {
    const result = await fn();
    spinner.succeed();
    return result;
  } catch (err) {
    spinner.fail();
    throw err;
  }
}

async function runMenuAction(action, projectRoot, project) {
  switch (action) {
    case 'dev':
      console.log(label(t('menu.startingDev')));
      await runDev(projectRoot);
      return false;
    case 'init': {
      const result = await withSpinner(t('menu.initProject'), () =>
        ensureProjectEnvironment(projectRoot)
      );
      console.log(ok(result.message || t('menu.done')));
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
      const code = await withSpinner(t('menu.startingApi'), () =>
        runLifecycleCommand('start', projectRoot)
      );
      if (code !== 0) process.exit(code);
      return true;
    }
    case 'server:stop':
      await withSpinner(t('menu.stoppingApi'), async () => {
        await runLifecycleCommand('stop', projectRoot);
      });
      return true;
    case 'server:restart': {
      const code = await withSpinner(t('menu.restartingApi'), () =>
        runLifecycleCommand('restart', projectRoot)
      );
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
          pageSize: 12,
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
      await withSpinner(t('docker.starting'), () => runDockerCommand('up', projectRoot));
      return true;
    case 'docker:stop':
      await withSpinner(t('docker.stopping'), async () => {
        await runDockerCommand('down', projectRoot);
      });
      return true;
    case 'nginx:up':
      await withSpinner(t('cli.nginx.up'), async () => {
        await runNginxCommand('up', projectRoot);
      });
      return true;
    case 'nginx:open':
      await runNginxCommand('open', projectRoot);
      return true;
    case 'nginx:reload':
      await runNginxCommand('reload', projectRoot);
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
  console.log(`  ${brand.dim(t('menu.shortcuts'))}`);
  console.log('');

  let loop = true;
  while (loop) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `${brand.primary(t('menu.actionPrefix'))}  ${brand.dim('›')}`,
        pageSize: 20,
        loop: false,
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

      if (action !== 'status' && action !== 'doctor') {
        console.log('');
        await printContextStatus(projectRoot);
      }
    } catch (err) {
      console.error(fail(err.message || err));
      const { retry } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'retry',
          message: t('menu.retry'),
          default: true,
        },
      ]);
      loop = retry;
      if (loop) {
        console.log('');
        await printContextStatus(projectRoot);
      }
    }
  }
}

module.exports = { runInteractiveLoop, runMenuAction, getMenuActions };
