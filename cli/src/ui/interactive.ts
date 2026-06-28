// @ts-nocheck
const inquirer = require('inquirer');
const ora = require('ora');
const open = require('open');
const { printBanner, deriveSystemState } = require('./banner');
const {
  brand,
  label,
  ok,
  fail,
  padRight,
  visibleLength,
  pulseBar,
  statusProgressLine,
} = require('./theme');
const { ensureOriginalCwd } = require('../lib/root');
const { describeProject } = require('../lib/project-type');
const { fetchContextStatus } = require('../lib/context-status');
const { hasResolvableActiveTheme } = require('../lib/theme-runtime');
const { ensureProjectEnvironment, initMonorepoProject } = require('../lib/bootstrap');
const { runDev, runThemeDev, runWebDev, runLocalWebDev, runDesktopDev } = require('../lib/dev');
const { runApiDev } = require('../lib/api-dev');
const { runLifecycleCommand } = require('../lib/lifecycle');
const { runDockerCommand } = require('../lib/docker');
const { runNginxCommand } = require('../lib/nginx');
const { printUnifiedStatus } = require('../lib/status');
const { runDoctor } = require('../lib/doctor');
const { runDbBackup } = require('../lib/db-backup');
const { runBuild, TARGETS } = require('../lib/build');
const { loadClientSiteUrl } = require('../lib/http');
const { t } = require('../lib/i18n');

const GROUP_PREFIX = '__group:';

function menuSection(title) {
  return new inquirer.Separator(`  ${brand.border('──')} ${brand.dim(String(title).toUpperCase())}`);
}

function formatChoice(key, text, hint) {
  const keyCol = key ? brand.primary(`${key}.`) : '   ';
  const hintPart = hint ? brand.dim(`  ${hint}`) : '';
  return `${keyCol} ${text}${hintPart}`;
}

function choice(labelKey, value, hintKey) {
  return {
    _label: t(labelKey),
    _hint: hintKey ? t(hintKey) : '',
    value,
  };
}

function toInquirerChoices(items, { start = 1, alignHints = true } = {}) {
  const actionable = items.filter((item) => item._label);
  const labelWidth = alignHints
    ? Math.min(Math.max(...actionable.map((item) => visibleLength(item._label)), 0), 34)
    : 0;

  let n = start - 1;
  return items.map((item) => {
    if (item instanceof inquirer.Separator) {
      return item;
    }
    const shortLabel = item._short || stripAnsi(item._label || item.name || item.value);
    if (item.noShortcut) {
      return {
        name: item._label,
        value: item.value,
        short: shortLabel,
      };
    }
    n += 1;
    const key = n <= 9 ? String(n) : '';
    const labelText = labelWidth ? padRight(item._label, labelWidth) : item._label;
    return {
      name: formatChoice(key, labelText, item._hint),
      value: item.value,
      short: shortLabel,
    };
  });
}

function stripAnsi(text) {
  return String(text || '').replace(/\u001b\[[0-9;]*m/g, '');
}

function buildMenuGroups(project) {
  const standalone = project.type === 'standalone';
  const monorepo = project.type === 'monorepo';
  const showTheme = hasResolvableActiveTheme(project.root);

  const run = {
    key: 'run',
    title: t('menu.section.run'),
    items: [
      choice('menu.dev', 'dev', 'menu.hint.dev'),
      choice('menu.init', 'init', 'menu.hint.init'),
      choice('menu.status', 'status', 'menu.hint.status'),
      choice('menu.doctor', 'doctor', 'menu.hint.doctor'),
    ],
  };

  const extendItems = [];
  if (project.hasDesktop) {
    extendItems.push(choice('menu.devDesktop', 'dev:desktop', 'menu.hint.devDesktop'));
  }
  if (project.hasWeb) {
    extendItems.push(choice('menu.devWeb', 'dev:web', 'menu.hint.devWeb'));
    extendItems.push(choice('menu.devLocalWeb', 'dev:local-web', 'menu.hint.devLocalWeb'));
  }
  extendItems.push(choice('menu.initLocal', 'init:local', 'menu.hint.initLocal'));
  extendItems.push(choice('menu.themeList', 'theme:list', 'menu.hint.themeList'));
  if (monorepo && project.hasPluginsWorkspace) {
    extendItems.push(choice('menu.pluginList', 'plugin:list', 'menu.hint.pluginList'));
  }

  const lifecycleItems = [choice('menu.devApi', 'dev:api', 'menu.hint.devApi')];
  if (showTheme) {
    lifecycleItems.push(choice('menu.devClient', 'dev:client', 'menu.hint.devClient'));
  }
  lifecycleItems.push(
    choice('menu.serverStart', 'server:start', 'menu.hint.serverStart'),
    choice('menu.serverStop', 'server:stop', 'menu.hint.serverStop'),
    choice('menu.serverRestart', 'server:restart', 'menu.hint.serverRestart')
  );

  const buildItems = [choice('menu.build', 'build', 'menu.hint.build')];
  if (monorepo) {
    buildItems.push(
      choice('menu.dockerStart', 'docker:start', 'menu.hint.dockerStart'),
      choice('menu.dockerUp', 'docker:up', 'menu.hint.dockerUp'),
      choice('menu.dockerStop', 'docker:stop', 'menu.hint.dockerStop')
    );
  } else if (standalone) {
    buildItems.push(
      choice('menu.dockerUp', 'docker:up', 'menu.hint.dockerUp'),
      choice('menu.dockerStop', 'docker:stop', 'menu.hint.dockerStop')
    );
  }
  if (monorepo) {
    buildItems.push(choice('menu.publish', 'publish', 'menu.hint.publish'));
  }

  const toolItems = [
    choice('menu.nginxUp', 'nginx:up', 'menu.hint.nginxUp'),
    choice('menu.nginxOpen', 'nginx:open', 'menu.hint.nginxOpen'),
    choice('menu.nginxReload', 'nginx:reload', 'menu.hint.nginxReload'),
    choice('menu.dbBackup', 'db:backup', 'menu.hint.dbBackup'),
    choice('menu.openAdmin', 'open:admin', 'menu.hint.openAdmin'),
  ];

  const groups = [run];
  if (extendItems.length > 0) {
    groups.push({ key: 'extend', title: t('menu.section.extend'), items: extendItems });
  }
  groups.push(
    { key: 'lifecycle', title: t('menu.section.lifecycle'), items: lifecycleItems },
    { key: 'build', title: t('menu.section.build'), items: buildItems },
    { key: 'tools', title: t('menu.section.tools'), items: toolItems }
  );
  return groups;
}

function getTopLevelMenu(project) {
  const groups = buildMenuGroups(project);
  const runGroup = groups[0];
  const subGroups = groups.slice(1);

  const items = [menuSection(t('menu.section.quick')), ...runGroup.items];

  if (subGroups.length > 0) {
    items.push(menuSection(t('menu.section.explore')));
    for (const group of subGroups) {
      items.push({
        _label: t(`menu.group.${group.key}`),
        _hint: t(`menu.groupHint.${group.key}`),
        value: `${GROUP_PREFIX}${group.key}`,
      });
    }
  }

  items.push(
    new inquirer.Separator(),
    { _label: brand.dim(t('menu.exit')), value: 'exit', noShortcut: true }
  );
  return toInquirerChoices(items, { alignHints: false });
}

function getSubMenu(group) {
  const items = [
    menuSection(group.title),
    ...group.items,
    new inquirer.Separator(),
    { _label: brand.dim(`← ${t('menu.backToMain')}`), value: '__back', noShortcut: true },
  ];
  return toInquirerChoices(items);
}

function getMenuActions(project) {
  const groups = buildMenuGroups(project);
  const items = [];
  for (const group of groups) {
    items.push(menuSection(group.title), ...group.items);
  }
  items.push(new inquirer.Separator(), choice('menu.exit', 'exit'));
  return toInquirerChoices(items);
}

async function pickMenuAction(project) {
  const groups = buildMenuGroups(project);
  const groupMap = Object.fromEntries(groups.map((group) => [group.key, group]));

  while (true) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `${brand.primary('›')} ${t('menu.prompt')}`,
        pageSize: 14,
        loop: false,
        choices: getTopLevelMenu(project),
      },
    ]);

    if (!action || typeof action !== 'string') {
      continue;
    }

    if (!action.startsWith(GROUP_PREFIX)) {
      return action;
    }

    const groupKey = action.slice(GROUP_PREFIX.length);
    const group = groupMap[groupKey];
    if (!group) {
      continue;
    }

    const { subAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'subAction',
        message: `${brand.primary('›')} ${t('menu.subPrompt', { section: group.title })}`,
        pageSize: 14,
        loop: false,
        choices: getSubMenu(group),
      },
    ]);

    if (subAction !== '__back') {
      return subAction;
    }
  }
}

function createStatusProgress() {
  const barWidth = 24;
  const isTTY = Boolean(process.stdout.isTTY && process.env.TERM !== 'dumb');
  let timer = null;
  let frame = 0;
  let total = 0;
  let completed = 0;
  let inFlight = 0;
  let currentId = null;

  function serviceLabel(id) {
    if (!id || String(id).startsWith('__')) return '';
    return t(`banner.service.${id}`).trim();
  }

  function visualCompleted() {
    if (total <= 0) return 0;
    const partial = completed + inFlight * 0.4;
    return Math.min(total, partial);
  }

  function clearLine() {
    if (!isTTY) return;
    process.stdout.write('\r\x1b[2K');
  }

  function renderLine() {
    const label = serviceLabel(currentId);
    if (total > 0) {
      const visual = visualCompleted();
      let filled = Math.round((visual / total) * barWidth);
      if (completed < total) {
        filled = Math.min(barWidth, filled + (frame % 2));
      }
      return `  ${brand.dim(t('menu.statusChecking'))}  ${statusProgressLine({
        completed: visual,
        total,
        label,
        barWidth,
        filled,
      })}`;
    }
    const indeterminate = 4 + (frame % Math.max(1, barWidth - 4));
    return `  ${brand.dim(t('menu.statusChecking'))}  ${pulseBar(barWidth, indeterminate)}  ${brand.muted('…')}`;
  }

  function paint() {
    if (!isTTY) return;
    process.stdout.write(`\r\x1b[2K${renderLine()}`);
  }

  return {
    start() {
      if (!isTTY) return;
      frame = 0;
      timer = setInterval(() => {
        frame += 1;
        paint();
      }, 90);
      paint();
    },
    setTotal(nextTotal) {
      total = nextTotal;
      paint();
    },
    tickStart(id) {
      inFlight += 1;
      currentId = id;
      paint();
    },
    tickDone(id) {
      inFlight = Math.max(0, inFlight - 1);
      completed += 1;
      currentId = id;
      paint();
    },
    async finish() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (isTTY && total > 0) {
        completed = total;
        inFlight = 0;
        paint();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      clearLine();
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      clearLine();
    },
  };
}

async function refreshInteractiveBanner(projectRoot, project, { spinner = false } = {}) {
  let status;
  if (spinner) {
    const progress = createStatusProgress();
    progress.start();
    try {
      status = await fetchContextStatus(projectRoot, {
        onProgress({ phase, total, id }) {
          if (phase === 'ready') progress.setTotal(total);
          if (phase === 'start') progress.tickStart(id);
          if (phase === 'done') progress.tickDone(id);
        },
      });
    } finally {
      await progress.finish();
    }
  } else {
    status = await fetchContextStatus(projectRoot);
  }
  const systemState = deriveSystemState(project, status);
  printBanner({ projectRoot, project, systemState, status });
  return status;
}

async function withSpinner(text, fn) {
  const spinner = ora({ text, color: 'gray', spinner: 'dots' }).start();
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
      await runThemeDev(projectRoot);
      return false;
    case 'dev:desktop':
      await runDesktopDev(projectRoot);
      return false;
    case 'dev:web':
      await runWebDev(projectRoot);
      return false;
    case 'dev:local-web':
      process.env.REACTPRESS_LOCAL_MODE = '1';
      process.env.REACTPRESS_SKIP_NGINX = '1';
      await runLocalWebDev(projectRoot);
      return false;
    case 'init:local': {
      const { isMonorepoCheckout } = require('../lib/root');
      const { initProject } = require('../core/services/init');
      const result = await withSpinner(t('menu.initProject'), async () => {
        if (isMonorepoCheckout(projectRoot)) {
          return initMonorepoProject(projectRoot, { local: true });
        }
        return initProject({ directory: projectRoot, force: false, local: true });
      });
      console.log(ok(result.message || t('menu.done')));
      return true;
    }
    case 'theme:list':
      require('../lib/theme-cli').runThemeList(projectRoot);
      return true;
    case 'plugin:list':
      require('../lib/plugin-cli').runPluginList(projectRoot);
      return true;
    case 'db:backup':
      await withSpinner(t('cli.db.backup'), async () => {
        await runDbBackup(projectRoot);
      });
      return true;
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

  await refreshInteractiveBanner(projectRoot, project, { spinner: true });
  console.log(`  ${brand.dim(t('menu.shortcuts'))}`);
  console.log('');

  let loop = true;
  while (loop) {
    const action = await pickMenuAction(project);

    if (action === 'exit') {
      console.log(brand.muted(t('menu.goodbye')));
      break;
    }

    try {
      const stay = await runMenuAction(action, projectRoot, project);
      if (!stay) break;

      if (action !== 'status' && action !== 'doctor') {
        console.log('');
        await refreshInteractiveBanner(projectRoot, project, { spinner: true });
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
        await refreshInteractiveBanner(projectRoot, project, { spinner: true });
      }
    }
  }
}

module.exports = {
  runInteractiveLoop,
  runMenuAction,
  getMenuActions,
  buildMenuGroups,
  pickMenuAction,
};
