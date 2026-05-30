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

function getThemeBin(projectRoot) {
  const { readActiveThemeManifest, resolveThemeDirectory } = require('./theme-runtime');
  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
  if (!themeDir) {
    const err = new Error(
      `Active theme not found: ${activeTheme}. Activate a theme in Admin → Appearance.`
    );
    err.code = 'REACTPRESS_THEME_NOT_FOUND';
    throw err;
  }
  const binPath = path.join(themeDir, 'bin', 'reactpress-client.js');
  if (!fs.existsSync(binPath)) {
    const err = new Error(
      `Theme entry not found: ${binPath}. Run from a ReactPress project with an installed theme.`
    );
    err.code = 'REACTPRESS_THEME_BIN_NOT_FOUND';
    throw err;
  }
  return binPath;
}

/** @deprecated Use getThemeBin */
function getClientBin(projectRoot) {
  return getThemeBin(projectRoot);
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
  getThemeBin,
  getClientBin,
  getPidFile,
};
