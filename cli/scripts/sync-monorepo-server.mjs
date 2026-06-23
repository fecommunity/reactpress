#!/usr/bin/env node
/**
 * Copy built API from monorepo `server/` into `cli/server/` for publish.
 * Runs after sync-bundled-core so security fixes in server/ ship with @fecommunity/reactpress.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.join(__dirname, '..');
const repoRoot = path.join(cliRoot, '..');
const monorepoServer = path.join(repoRoot, 'server');
const bundledServer = path.join(cliRoot, 'server');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'logs') continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function replaceDir(src, dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  copyDir(src, dest);
}

function main() {
  const distMain = path.join(monorepoServer, 'dist', 'main.js');
  if (!fs.existsSync(distMain)) {
    console.warn('[sync-monorepo-server] Skip: build server first (pnpm run build --dir server)');
    process.exit(0);
  }

  replaceDir(path.join(monorepoServer, 'dist'), path.join(bundledServer, 'dist'));
  replaceDir(path.join(monorepoServer, 'public'), path.join(bundledServer, 'public'));
  replaceDir(path.join(monorepoServer, 'bin'), path.join(bundledServer, 'bin'));

  console.log('[sync-monorepo-server] server/dist|public|bin -> cli/server/');
}

main();
