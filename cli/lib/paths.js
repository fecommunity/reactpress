const fs = require('fs');
const path = require('path');
const { getMonorepoRoot } = require('./root');

function getMonorepoServerDir() {
  return path.join(getMonorepoRoot(), 'server');
}

function hasMonorepoServerSource() {
  return fs.existsSync(path.join(getMonorepoServerDir(), 'src', 'main.ts'));
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

function getClientBin() {
  return path.join(getMonorepoRoot(), 'client', 'bin', 'reactpress-client.js');
}

function getPidFile(projectRoot) {
  return path.join(projectRoot, '.reactpress', 'server.pid');
}

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
  getClientBin,
  getPidFile,
};
