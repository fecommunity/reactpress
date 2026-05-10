const { runSync } = require('./spawn');
const { ensureOriginalCwd } = require('./root');

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
    throw new Error(`未知构建目标: ${target}，可选: ${Object.keys(TARGETS).join(', ')}`);
  }
  for (const name of script) {
    console.log(`[reactpress] 构建: ${name}`);
    runSync('pnpm', ['run', name], { cwd: projectRoot });
  }
}

module.exports = { runBuild, TARGETS };
