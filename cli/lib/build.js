const { runSync } = require('./spawn');
const { ensureOriginalCwd } = require('./root');
const { t } = require('./i18n');

const TARGETS = {
  toolkit: ['build:toolkit'],
  server: ['build:server'],
  client: ['build:client'],
  docs: ['build:docs'],
  all: ['build'],
};

async function runBuild(target = 'all', projectRoot = ensureOriginalCwd()) {
  const script = TARGETS[target];
  if (!script) {
    throw new Error(
      t('build.unknownTarget', {
        target,
        available: Object.keys(TARGETS).join(', '),
      })
    );
  }
  for (const name of script) {
    console.log(t('build.running', { name }));
    runSync('pnpm', ['run', name], { cwd: projectRoot });
  }
}

module.exports = { runBuild, TARGETS };
