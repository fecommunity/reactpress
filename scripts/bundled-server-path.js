/**
 * Resolve ReactPress API server paths.
 * Monorepo: prefer ./server when Nest source exists; otherwise fall back to CLI bundle.
 */
const fs = require('fs');
const path = require('path');

function getMonorepoRoot() {
  return path.resolve(__dirname, '..');
}

function getMonorepoServerDir() {
  return path.join(getMonorepoRoot(), 'server');
}

function hasMonorepoServerSource() {
  return fs.existsSync(path.join(getMonorepoServerDir(), 'src', 'main.ts'));
}

function getCliPackageRoot() {
  return path.dirname(require.resolve('@fecommunity/reactpress-cli/package.json'));
}

function getBundledServerDir() {
  return path.join(getCliPackageRoot(), 'server');
}

function getServerDir() {
  if (hasMonorepoServerSource()) {
    return getMonorepoServerDir();
  }
  return getBundledServerDir();
}

function getServerBin() {
  return path.join(getServerDir(), 'bin', 'reactpress-server.js');
}

function getSwaggerPath() {
  return path.join(getServerDir(), 'public', 'swagger.json');
}

function getServerMain() {
  return path.join(getServerDir(), 'dist', 'main.js');
}

function isUsingMonorepoServer() {
  return hasMonorepoServerSource();
}

// Legacy export names
const getBundledServerBin = getServerBin;
const getBundledSwaggerPath = getSwaggerPath;
const getBundledServerMain = getServerMain;

module.exports = {
  getMonorepoRoot,
  getMonorepoServerDir,
  hasMonorepoServerSource,
  isUsingMonorepoServer,
  getCliPackageRoot,
  getBundledServerDir,
  getServerDir,
  getServerBin,
  getSwaggerPath,
  getServerMain,
  getBundledServerBin,
  getBundledSwaggerPath,
  getBundledServerMain,
};
