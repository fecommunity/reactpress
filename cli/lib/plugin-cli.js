const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const PLUGIN_RUNTIME_REL = path.join('.reactpress', 'plugins');
const PLUGIN_ID_RE = /^[a-z0-9][a-z0-9-]*$/i;
const COPY_SKIP_NAMES = new Set([
  'node_modules',
  '.git',
  'dist',
  '.turbo',
  'coverage',
  '.reactpress',
  '.cache',
  'package-lock.json',
]);

function isValidPluginId(id) {
  return typeof id === 'string' && PLUGIN_ID_RE.test(id) && id.length <= 64;
}

function readPluginsPackageMeta(projectRoot) {
  const pkgPath = path.join(projectRoot, 'plugins', 'package.json');
  if (!fs.existsSync(pkgPath)) return { local: [] };
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const local = Array.isArray(pkg.reactpress?.local)
      ? pkg.reactpress.local.filter((id) => typeof id === 'string')
      : [];
    return { local };
  } catch {
    return { local: [] };
  }
}

function readPluginManifest(pluginDir) {
  const manifestPath = path.join(pluginDir, 'plugin.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (COPY_SKIP_NAMES.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isSymbolicLink()) {
      fs.symlinkSync(fs.readlinkSync(from), to);
    } else if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) removeDir(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(dir);
}

function materializeRuntimePlugin(projectRoot, templatePath, targetDir) {
  const forceCopy =
    process.env.REACTPRESS_PLUGIN_RUNTIME_COPY === '1' || process.env.NODE_ENV === 'production';
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  if (fs.existsSync(targetDir)) removeDir(targetDir);
  if (!forceCopy) {
    const linkTarget = path.relative(path.dirname(targetDir), templatePath);
    fs.symlinkSync(linkTarget, targetDir, 'dir');
    return;
  }
  copyDir(templatePath, targetDir);
}

function installLocalPlugin(projectRoot, id) {
  if (!isValidPluginId(id)) {
    throw new Error(`Invalid plugin id "${id}"`);
  }
  const templatePath = path.join(projectRoot, 'plugins', id);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Plugin template "${id}" not found under plugins/`);
  }
  const manifest = readPluginManifest(templatePath);
  if (!manifest?.id) {
    throw new Error(`Plugin "${id}" has invalid plugin.json`);
  }
  const targetDir = path.join(projectRoot, PLUGIN_RUNTIME_REL, id);
  materializeRuntimePlugin(projectRoot, templatePath, targetDir);
  return { pluginId: manifest.id, name: manifest.name, pluginDirRel: PLUGIN_RUNTIME_REL };
}

function listAvailablePluginIds(projectRoot) {
  const { local } = readPluginsPackageMeta(projectRoot);
  const runtimeDir = path.join(projectRoot, PLUGIN_RUNTIME_REL);
  const installed = fs.existsSync(runtimeDir)
    ? fs
        .readdirSync(runtimeDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    : [];
  return [...new Set([...local, ...installed])];
}

function runPluginInstall(projectRoot, id) {
  const result = installLocalPlugin(projectRoot, id);
  console.log(
    chalk.green('[reactpress]'),
    `Installed plugin "${result.name}" (${result.pluginId}) → ${result.pluginDirRel}/${result.pluginId}/`,
  );
  console.log(chalk.gray(`Activate via admin /plugins or: reactpress plugin activate ${result.pluginId}`));
  return result;
}

function runPluginList(projectRoot) {
  const ids = listAvailablePluginIds(projectRoot);
  if (!ids.length) {
    console.log('No plugins registered.');
    return;
  }
  console.log('Available plugins:');
  for (const id of ids.sort()) {
    const runtime = path.join(projectRoot, PLUGIN_RUNTIME_REL, id);
    const installed = fs.existsSync(runtime);
    console.log(`  - ${id}${installed ? ' (installed)' : ''}`);
  }
}

module.exports = {
  installLocalPlugin,
  listAvailablePluginIds,
  runPluginInstall,
  runPluginList,
};
