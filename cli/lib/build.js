const chalk = require('chalk');
const { runSync } = require('./spawn');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

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

async function runBuild(target = 'all', projectRoot = ensureOriginalCwd()) {
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
    const current = i + 1;
    const label = t(labelKey);
    const stepStarted = Date.now();

    console.log(t('build.step', { current, total, label }));
    runSync('pnpm', ['run', script], { cwd: projectRoot });

    const seconds = ((Date.now() - stepStarted) / 1000).toFixed(1);
    console.log(chalk.green(t('build.stepDone', { current, total, label, seconds })));
  }

  const totalSeconds = ((Date.now() - buildStarted) / 1000).toFixed(1);
  console.log(chalk.green(t('build.done', { seconds: totalSeconds })));
}

module.exports = { runBuild, TARGETS, BUILD_STEPS };
