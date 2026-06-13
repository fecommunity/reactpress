#!/usr/bin/env node
/**
 * Verify pre-built production artifacts exist (server should not run build).
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { readActiveThemeManifest, resolveThemeDirectory } = require('../cli/out/lib/theme-runtime.js');

const root = process.cwd();
const missing = [];

function resolvePath(relOrAbs) {
  return path.isAbsolute(relOrAbs) ? relOrAbs : path.join(root, relOrAbs);
}

function check(relOrAbs, label = relOrAbs) {
  if (!fs.existsSync(resolvePath(relOrAbs))) missing.push(label);
}

check('server/dist/main.js', 'server/dist/main.js (API build)');
check('web/dist/index.html', 'web/dist/index.html (admin static)');
check('toolkit/dist/index.js', 'toolkit/dist/index.js (shared toolkit)');

const { activeTheme } = readActiveThemeManifest(root);
const themeDir = resolveThemeDirectory(root, activeTheme);
if (!themeDir) {
  missing.push(`active theme directory for "${activeTheme}"`);
} else {
  const relTheme = path.relative(root, themeDir) || themeDir;
  const buildId = path.join(themeDir, '.next/BUILD_ID');
  const stamp = path.join(themeDir, '.next/.reactpress-theme-id');

  if (!fs.existsSync(buildId)) {
    missing.push(`${relTheme}/.next (theme production build)`);
  }
  if (!fs.existsSync(stamp)) {
    missing.push(`${relTheme}/.next/.reactpress-theme-id (theme build stamp)`);
  } else {
    const stamped = fs.readFileSync(stamp, 'utf8').trim();
    if (stamped !== activeTheme) {
      missing.push(`${relTheme}/.next stamp mismatch (expected ${activeTheme}, got ${stamped})`);
    }
  }
  if (fs.existsSync(buildId) && !fs.existsSync(path.join(themeDir, '.next/server'))) {
    missing.push(`${relTheme}/.next/server (incomplete theme production build)`);
  }
}

if (missing.length) {
  console.error('[reactpress] Missing production artifacts:');
  for (const item of missing) console.error(`  - ${item}`);
  console.error('');
  console.error('Build on CI or locally, then upload artifacts to the server:');
  console.error('  pnpm run build');
  console.error('  scp dist/reactpress-release-*.tar.gz user@server:/path/to/reactpress/dist/');
  console.error('  pnpm run deploy -- dist/reactpress-release-*.tar.gz');
  process.exit(1);
}

console.log(`[reactpress] Production artifacts OK (active theme: ${activeTheme})`);
