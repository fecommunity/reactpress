#!/usr/bin/env node
/** Drop stale Next 12 / React 17 dev chunks after theme upgrades. */
import { rmSync, existsSync, readFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themeDir = path.resolve(__dirname, '..');
const nextDir = path.join(themeDir, '.next');

if (!process.env.REACTPRESS_THEME_ID) {
  try {
    const manifest = JSON.parse(
      readFileSync(path.join(themeDir, 'theme.json'), 'utf8'),
    );
    if (manifest?.id) process.env.REACTPRESS_THEME_ID = manifest.id;
  } catch {
    // ignore — createThemeApp still has manifest.id fallback
  }
}

function hasStaleReact17Cache() {
  if (!existsSync(nextDir)) return false;
  try {
    const out = execFileSync('grep', ['-rl', 'react@17.0.2', nextDir], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return Boolean(out.trim());
  } catch {
    return false;
  }
}

if (hasStaleReact17Cache()) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log('[twentytwentyfive] Cleared stale .next cache (react@17 chunks).');
}

const result = spawnSync('next', ['dev'], {
  cwd: themeDir,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
