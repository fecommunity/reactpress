const chalk = require('chalk');
const { runSync } = require('./spawn');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

const FORBIDDEN_SCRIPTS = new Set(['build']);

/** @type {Record<string, { script: string, labelKey: string }[]>} */
const BUILD_STEPS = {
  toolkit: [{ script: 'build:toolkit', labelKey: 'build.label.toolkit' }],
  server: [{ script: 'build:server', labelKey: 'build.label.server' }],
  client: [{ script: 'build:client', labelKey: 'build.label.client' }],
  docs: [{ script: 'build:docs', labelKey: 'build.label.docs' }],
  all: [
    { script: 'build:toolkit', labelKey: 'build.label.toolkit' },
    { script: 'build:server', labelKey: 'build.label.server' },
    { script: 'build:client', labelKey: 'build.label.client' },
  ],
};

const TARGETS = Object.keys(BUILD_STEPS);

const buildChildEnv = { REACTPRESS_BUILD_ACTIVE: '1' };

async function runBuild(target = 'all', projectRoot = ensureOriginalCwd()) {
  if (process.env.REACTPRESS_BUILD_ACTIVE === '1') {
    throw new Error(t('build.recursive'));
  }

  const steps = BUILD_STEPS[target];
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

  if (total > 1) {
    console.log(t('build.plan', { total }));
  }

  for (let i = 0; i < steps.length; i++) {
    const { script, labelKey } = steps[i];
    if (FORBIDDEN_SCRIPTS.has(script)) {
      throw new Error(t('build.forbiddenScript', { script }));
    }

    const current = i + 1;
    const label = t(labelKey);
    const stepStarted = Date.now();

    console.log(t('build.step', { current, total, label }));
    try {
      runSync('pnpm', ['run', script], { cwd: projectRoot, env: buildChildEnv });
    } catch (err) {
      console.error(chalk.red(t('build.stepFailed', { current, total, label })));
      throw err;
    }

    const seconds = ((Date.now() - stepStarted) / 1000).toFixed(1);
    console.log(chalk.green(t('build.stepDone', { current, total, label, seconds })));
  }

  if (total > 1) {
    const totalSeconds = ((Date.now() - buildStarted) / 1000).toFixed(1);
    console.log(chalk.green(t('build.done', { seconds: totalSeconds })));
  }
}

module.exports = { runBuild, TARGETS, BUILD_STEPS };
