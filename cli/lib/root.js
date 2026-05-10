const fs = require('fs');
const path = require('path');

/** Monorepo root (parent of cli/) */
function getMonorepoRoot() {
  return path.resolve(__dirname, '../..');
}

function getProjectRoot() {
  return path.resolve(process.env.REACTPRESS_ORIGINAL_CWD || process.cwd());
}

function ensureOriginalCwd() {
  const root = getProjectRoot();
  process.env.REACTPRESS_ORIGINAL_CWD = root;
  return root;
}

function isMonorepoCheckout(cwd = getMonorepoRoot()) {
  return (
    fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(cwd, 'server', 'src', 'main.ts'))
  );
}

module.exports = {
  getMonorepoRoot,
  getProjectRoot,
  ensureOriginalCwd,
  isMonorepoCheckout,
};
