// @ts-nocheck
const fs = require('fs');
const path = require('path');
const ora = require('ora');
const { brand, icon, ok, warn, label, chip } = require('../ui/theme');
const { runSync } = require('./spawn');
const { ensureOriginalCwd } = require('./root');
const { hasWeb } = require('./project-type');
const { t } = require('./i18n');
const { shouldBuildToolkit } = require('./toolkit-build');
const { hasUsableProductionBuild, readActiveThemeBuildState } = require('./theme-prod');
const { resolveBuildNodeEnv } = require('./prod-memory');

const FORBIDDEN_SCRIPTS = new Set(['build']);

/** @type {Record<string, { script: string, labelKey: string }[]>} */
const BUILD_STEPS = {
  toolkit: [{ script: 'build:toolkit', labelKey: 'build.label.toolkit' }],
  plugins: [{ script: 'build:plugins', labelKey: 'build.label.plugins' }],
  server: [{ script: 'build:server', labelKey: 'build.label.server' }],
  web: [{ script: 'build:web', labelKey: 'build.label.web' }],
  theme: [{ script: 'build:theme', labelKey: 'build.label.theme' }],
  docs: [{ script: 'build:docs', labelKey: 'build.label.docs' }],
};

const TARGETS = [...Object.keys(BUILD_STEPS), 'all'];

function getBuildSteps(target, projectRoot) {
  if (target !== 'all') {
    return BUILD_STEPS[target];
  }

  const steps = [
    { script: 'build:toolkit', labelKey: 'build.label.toolkit' },
    { script: 'build:plugins', labelKey: 'build.label.plugins' },
    { script: 'build:server', labelKey: 'build.label.server' },
  ];
  if (hasWeb(projectRoot)) {
    steps.push({ script: 'build:web', labelKey: 'build.label.web' });
  }
  steps.push({ script: 'build:theme', labelKey: 'build.label.theme' });
  return steps;
}

const buildChildEnv = resolveBuildNodeEnv({ REACTPRESS_BUILD_ACTIVE: '1' });

function readPackageScripts(packageJsonPath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return pkg.scripts || {};
  } catch {
    return {};
  }
}

/** Prefer workspace package scripts over root package.json aliases. */
function resolveBuildInvocation(script, projectRoot) {
  const root = path.resolve(projectRoot);

  if (script === 'build:toolkit') {
    const toolkitDir = path.join(root, 'toolkit');
    if (fs.existsSync(path.join(toolkitDir, 'package.json'))) {
      return { command: 'pnpm', args: ['run', 'build'], cwd: toolkitDir };
    }
    const rootScripts = readPackageScripts(path.join(root, 'package.json'));
    if (rootScripts['build:toolkit']) {
      return { command: 'pnpm', args: ['run', 'build:toolkit'], cwd: root };
    }
    return null;
  }

  if (script === 'build:server') {
    const serverDir = path.join(root, 'server');
    if (fs.existsSync(path.join(serverDir, 'package.json'))) {
      return { command: 'pnpm', args: ['run', 'build'], cwd: serverDir };
    }
  }

  if (script === 'build:plugins') {
    const pluginsDir = path.join(root, 'plugins');
    if (fs.existsSync(path.join(pluginsDir, 'package.json'))) {
      return { command: 'pnpm', args: ['run', 'build'], cwd: pluginsDir };
    }
    const rootScripts = readPackageScripts(path.join(root, 'package.json'));
    if (rootScripts['build:plugins']) {
      return { command: 'pnpm', args: ['run', 'build:plugins'], cwd: root };
    }
  }

  if (script === 'build:web') {
    const webDir = path.join(root, 'web');
    if (fs.existsSync(path.join(webDir, 'package.json'))) {
      return { command: 'pnpm', args: ['run', 'build'], cwd: webDir };
    }
    const rootScripts = readPackageScripts(path.join(root, 'package.json'));
    if (rootScripts['build:web']) {
      return { command: 'pnpm', args: ['run', 'build:web'], cwd: root };
    }
    return null;
  }

  if (script === 'build:theme') {
    const { readActiveThemeManifest, resolveThemeDirectory } = require('./theme-runtime');
    const { activeTheme } = readActiveThemeManifest(root);
    const themeDir = resolveThemeDirectory(root, activeTheme);
    if (themeDir && fs.existsSync(path.join(themeDir, 'package.json'))) {
      return { command: 'pnpm', args: ['run', 'build'], cwd: themeDir };
    }
  }

  if (script === 'build:docs') {
    const docsDir = path.join(root, 'docs');
    if (fs.existsSync(path.join(docsDir, 'package.json'))) {
      return { command: 'pnpm', args: ['run', 'build'], cwd: docsDir };
    }
  }

  const rootScripts = readPackageScripts(path.join(root, 'package.json'));
  if (rootScripts[script]) {
    return { command: 'pnpm', args: ['run', script], cwd: root };
  }

  return null;
}

function stepBadge(current, total) {
  return chip(`${current}/${total}`, brand.primary);
}

async function runBuild(target = 'all', projectRoot = ensureOriginalCwd()) {
  if (process.env.REACTPRESS_BUILD_ACTIVE === '1') {
    throw new Error(t('build.recursive'));
  }

  const steps = getBuildSteps(target, projectRoot);
  if (!steps) {
    throw new Error(
      t('build.unknownTarget', {
        target,
        available: TARGETS.join(', '),
      })
    );
  }

  const total = steps.length;
  const buildStarted = Date.now();

  console.log('');
  if (total > 1) {
    console.log(label(t('build.plan', { total })));
    console.log('');
  }

  for (let i = 0; i < steps.length; i++) {
    const { script, labelKey } = steps[i];
    if (FORBIDDEN_SCRIPTS.has(script)) {
      throw new Error(t('build.forbiddenScript', { script }));
    }

    const current = i + 1;
    const stepLabel = t(labelKey);
    const stepStarted = Date.now();
    const badge = stepBadge(current, total);

    if (script === 'build:toolkit' && !shouldBuildToolkit(projectRoot)) {
      console.log(`  ${badge}  ${ok(t('build.stepSkippedFresh', { label: stepLabel }))}`);
      continue;
    }

    if (script === 'build:theme') {
      const themeState = readActiveThemeBuildState(projectRoot);
      if (
        themeState &&
        hasUsableProductionBuild(themeState.themeDir, themeState.activeTheme)
      ) {
        console.log(
          `  ${badge}  ${ok(t('build.stepSkippedReuse', { label: stepLabel, id: themeState.activeTheme }))}`,
        );
        continue;
      }
    }

    const invocation = resolveBuildInvocation(script, projectRoot);
    if (!invocation) {
      console.log(`  ${badge}  ${warn(t('build.stepSkipped', { label: stepLabel }))}`);
      continue;
    }

    const spinner = ora({
      text: `${badge}  ${t('build.step', { current, total, label: stepLabel })}`,
      color: 'magenta',
      spinner: 'dots',
    }).start();

    try {
      runSync(invocation.command, invocation.args, {
        cwd: invocation.cwd,
        env: buildChildEnv,
      });
    } catch (err) {
      spinner.fail(`${badge}  ${t('build.stepFailed', { current, total, label: stepLabel })}`);
      throw err;
    }

    const seconds = ((Date.now() - stepStarted) / 1000).toFixed(1);
    spinner.succeed(
      `${badge}  ${ok(t('build.stepDone', { current, total, label: stepLabel, seconds }))}`
    );
  }

  if (total > 1) {
    const totalSeconds = ((Date.now() - buildStarted) / 1000).toFixed(1);
    console.log('');
    console.log(`  ${icon.spark}  ${ok(t('build.done', { seconds: totalSeconds }))}`);
  }
  console.log('');
}

module.exports = {
  runBuild,
  TARGETS,
  BUILD_STEPS,
  getBuildSteps,
  resolveBuildInvocation,
};
