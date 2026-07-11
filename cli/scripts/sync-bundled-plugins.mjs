#!/usr/bin/env node
/**
 * Copy built plugins (plugins/) into cli/plugins/ for npm publish.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.join(__dirname, '..');
const repoRoot = path.join(cliRoot, '..');
const pluginsRoot = path.join(repoRoot, 'plugins');
const bundledPlugins = path.join(cliRoot, 'plugins');

const PLUGIN_SKIP_DIRS = new Set(['node_modules', '.git', '.turbo', 'src', 'coverage']);

function copyPluginTree(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      if (PLUGIN_SKIP_DIRS.has(entry.name)) continue;
      copyPluginTree(src, dest);
      continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function ensurePluginsBuilt() {
  const registry = path.join(pluginsRoot, 'package.json');
  if (!fs.existsSync(registry)) {
    console.warn('[sync-bundled-plugins] Skip: plugins/package.json missing');
    process.exit(0);
  }

  let local = [];
  try {
    const pkg = JSON.parse(fs.readFileSync(registry, 'utf8'));
    local = Array.isArray(pkg.reactpress?.local) ? pkg.reactpress.local : [];
  } catch {
    local = [];
  }

  const needsBuild = local.some((id) => {
    if (typeof id !== 'string' || !id.trim()) return false;
    const pluginDir = path.join(pluginsRoot, id.trim());
    if (!fs.existsSync(path.join(pluginDir, 'plugin.json'))) return false;
    return !fs.existsSync(path.join(pluginDir, 'dist', 'index.js'));
  });

  if (!needsBuild) return;

  console.log('[sync-bundled-plugins] Building plugins before sync…');
  const build = spawnSync('pnpm', ['run', 'build'], {
    cwd: pluginsRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

function main() {
  ensurePluginsBuilt();

  const registry = path.join(pluginsRoot, 'package.json');
  if (!fs.existsSync(registry)) {
    console.warn('[sync-bundled-plugins] Skip: plugins/package.json missing');
    process.exit(0);
  }

  if (fs.existsSync(bundledPlugins)) {
    fs.rmSync(bundledPlugins, { recursive: true, force: true });
  }
  fs.mkdirSync(bundledPlugins, { recursive: true });
  fs.copyFileSync(registry, path.join(bundledPlugins, 'package.json'));

  for (const entry of fs.readdirSync(pluginsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (PLUGIN_SKIP_DIRS.has(entry.name)) continue;
    const pluginDir = path.join(pluginsRoot, entry.name);
    if (!fs.existsSync(path.join(pluginDir, 'plugin.json'))) continue;
    copyPluginTree(pluginDir, path.join(bundledPlugins, entry.name));
  }

  console.log('[sync-bundled-plugins] plugins/ -> cli/plugins/');
}

main();
