/**
 * Resolve paths to the Nest server bundled inside @fecommunity/reactpress-cli.
 */
const path = require('path');

function getCliPackageRoot() {
  return path.dirname(require.resolve('@fecommunity/reactpress-cli/package.json'));
}

function getBundledServerDir() {
  return path.join(getCliPackageRoot(), 'server');
}

function getBundledServerBin() {
  return path.join(getBundledServerDir(), 'bin', 'reactpress-server.js');
}

function getBundledSwaggerPath() {
  return path.join(getBundledServerDir(), 'public', 'swagger.json');
}

function getBundledServerMain() {
  return path.join(getBundledServerDir(), 'dist', 'main.js');
}

function getMonorepoRoot() {
  return path.resolve(__dirname, '..');
}

module.exports = {
  getCliPackageRoot,
  getBundledServerDir,
  getBundledServerBin,
  getBundledSwaggerPath,
  getBundledServerMain,
  getMonorepoRoot,
};
