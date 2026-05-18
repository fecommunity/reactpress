const fs = require('fs');
const path = require('path');

/**
 * Install root: monorepo checkout (repo root) or published @fecommunity/reactpress package root.
 * cli/lib -> ../.. when pnpm-workspace.yaml exists; published lib/ -> .. only.
 */
function getMonorepoRoot() {
  const packageRoot = path.resolve(__dirname, '..');
  const parentOfPackage = path.resolve(__dirname, '../..');
  if (fs.existsSync(path.join(parentOfPackage, 'pnpm-workspace.yaml'))) {
    return parentOfPackage;
  }
  return packageRoot;
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
