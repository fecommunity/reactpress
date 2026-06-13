// @ts-nocheck
const fs = require('fs');
const path = require('path');

const CLI_PACKAGE_NAME = '@fecommunity/reactpress';

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

function isPublishedCliRoot(dir) {
  const resolved = path.resolve(dir);
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(resolved, 'package.json'), 'utf8')
    );
    if (pkg.name !== CLI_PACKAGE_NAME) return false;
  } catch {
    return false;
  }
  return !fs.existsSync(path.join(resolved, 'pnpm-workspace.yaml'));
}

function isProjectRoot(dir) {
  const resolved = path.resolve(dir);
  if (isPublishedCliRoot(resolved)) return false;
  return (
    fs.existsSync(path.join(resolved, '.reactpress', 'config.json')) ||
    fs.existsSync(path.join(resolved, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(resolved, 'server', 'src', 'main.ts')) ||
    fs.existsSync(path.join(resolved, 'toolkit', 'package.json'))
  );
}

function findProjectRoot(startDir = process.cwd()) {
  let dir = path.resolve(startDir);
  while (true) {
    if (isProjectRoot(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function getProjectRoot() {
  const envRoot = process.env.REACTPRESS_ORIGINAL_CWD;
  if (envRoot) {
    const resolved = path.resolve(envRoot);
    if (isProjectRoot(resolved)) return resolved;
  }
  const discovered = findProjectRoot(process.cwd());
  if (discovered) return discovered;
  if (envRoot) return path.resolve(envRoot);
  return path.resolve(process.cwd());
}

function ensureOriginalCwd() {
  const root = getProjectRoot();
  process.env.REACTPRESS_ORIGINAL_CWD = root;
  return root;
}

function isMonorepoCheckout(cwd) {
  const resolved = path.resolve(cwd || process.cwd());
  return (
    fs.existsSync(path.join(resolved, 'pnpm-workspace.yaml')) ||
    fs.existsSync(path.join(resolved, 'server', 'src', 'main.ts'))
  );
}

module.exports = {
  getMonorepoRoot,
  getProjectRoot,
  ensureOriginalCwd,
  isMonorepoCheckout,
  isProjectRoot,
  findProjectRoot,
  isPublishedCliRoot,
};
