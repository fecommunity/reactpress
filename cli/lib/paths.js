const fs = require('fs');
const path = require('path');
const { ensureOriginalCwd, getMonorepoRoot } = require('./root');

function resolveProjectRoot(projectRoot) {
  return path.resolve(projectRoot || ensureOriginalCwd());
}

function getMonorepoServerDir(projectRoot) {
  return path.join(resolveProjectRoot(projectRoot), 'server');
}

function hasMonorepoServerSource(projectRoot) {
  return fs.existsSync(
    path.join(getMonorepoServerDir(projectRoot), 'src', 'main.ts')
  );
}

function getCliPackageRoot() {
  const ownRoot = path.join(__dirname, '..');
  if (fs.existsSync(path.join(ownRoot, 'dist', 'index.js'))) {
    return ownRoot;
  }
  try {
    return path.dirname(
      require.resolve('@fecommunity/reactpress-cli-core/package.json')
    );
  } catch {
    return path.dirname(require.resolve('@fecommunity/reactpress-cli/package.json'));
  }
}

function getBundledServerDir() {
  return path.join(getCliPackageRoot(), 'server');
}

function hasBundledServerBuild() {
  return fs.existsSync(path.join(getBundledServerDir(), 'dist', 'main.js'));
}

function getServerDir(projectRoot) {
  if (hasMonorepoServerSource(projectRoot)) {
    return getMonorepoServerDir(projectRoot);
  }
  return getBundledServerDir();
}

function getServerBin(projectRoot) {
  return path.join(getServerDir(projectRoot), 'bin', 'reactpress-server.js');
}

function getSwaggerPath(projectRoot) {
  return path.join(getServerDir(projectRoot), 'public', 'swagger.json');
}

function getServerMain(projectRoot) {
  return path.join(getServerDir(projectRoot), 'dist', 'main.js');
}

function isUsingMonorepoServer(projectRoot) {
  return hasMonorepoServerSource(projectRoot);
}

function canStartLocalApi(projectRoot) {
  return (
    isUsingMonorepoServer(projectRoot) ||
    hasBundledServerBuild()
  );
}

function getClientBin(projectRoot) {
  const binPath = path.join(
    resolveProjectRoot(projectRoot),
    'client',
    'bin',
    'reactpress-client.js'
  );
  if (!fs.existsSync(binPath)) {
    const err = new Error(
      `Client entry not found: ${binPath}. Run from a ReactPress monorepo root or use reactpress dev --client-only with a remote API.`
    );
    err.code = 'REACTPRESS_CLIENT_NOT_FOUND';
    throw err;
  }
  return binPath;
}

function getPidFile(projectRoot) {
  return path.join(resolveProjectRoot(projectRoot), '.reactpress', 'server.pid');
}

module.exports = {
  getMonorepoRoot,
  resolveProjectRoot,
  getMonorepoServerDir,
  hasMonorepoServerSource,
  hasBundledServerBuild,
  isUsingMonorepoServer,
  canStartLocalApi,
  getCliPackageRoot,
  getBundledServerDir,
  getServerDir,
  getServerBin,
  getSwaggerPath,
  getServerMain,
  getClientBin,
  getPidFile,
};
