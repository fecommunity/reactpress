const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readLocalPluginIds(projectRoot) {
  const pkgPath = path.join(projectRoot, 'plugins', 'package.json');
  if (!fs.existsSync(pkgPath)) return [];
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const local = pkg?.reactpress?.local;
    return Array.isArray(local) ? local.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
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

function newestMtime(root, relDir) {
  const dir = path.join(root, relDir);
  if (!fs.existsSync(dir)) return 0;
  let max = 0;
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) max = Math.max(max, fs.statSync(full).mtimeMs);
    }
  };
  walk(dir);
  return max;
}

function shouldBuildPlugin(pluginDir) {
  const pkgPath = path.join(pluginDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    return false;
  }
  if (!pkg.scripts?.build) return false;

  const manifest = readPluginManifest(pluginDir);
  const moduleRel = manifest?.server?.module;
  if (!moduleRel || typeof moduleRel !== 'string') return false;

  const entry = path.join(pluginDir, moduleRel.replace(/^\.\//, ''));
  if (!fs.existsSync(entry)) return true;

  const srcMtime = newestMtime(pluginDir, 'src');
  const entryMtime = fs.statSync(entry).mtimeMs;
  return srcMtime > entryMtime;
}

function buildPlugin(pluginDir, { quiet = false } = {}) {
  const name = path.basename(pluginDir);
  if (!quiet) {
    console.log(`[reactpress] Building plugin "${name}"…`);
  }
  const result = spawnSync('pnpm', ['run', 'build'], {
    cwd: pluginDir,
    stdio: quiet ? 'pipe' : 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    const stderr = result.stderr?.toString?.() ?? '';
    throw new Error(`Plugin "${name}" build failed${stderr ? `: ${stderr.trim()}` : ''}`);
  }
}

function buildLocalPlugins(projectRoot, options = {}) {
  const ids = readLocalPluginIds(projectRoot);
  for (const id of ids) {
    const pluginDir = path.join(projectRoot, 'plugins', id);
    if (!fs.existsSync(pluginDir)) continue;
    if (!shouldBuildPlugin(pluginDir)) continue;
    buildPlugin(pluginDir, options);
  }
}

module.exports = {
  readLocalPluginIds,
  shouldBuildPlugin,
  buildPlugin,
  buildLocalPlugins,
};
