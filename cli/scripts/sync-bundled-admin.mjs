#!/usr/bin/env node
/**
 * Copy built Admin SPA (web/dist) into cli/admin-dist/ for npm publish.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.join(__dirname, '..');
const repoRoot = path.join(cliRoot, '..');
const webDist = path.join(repoRoot, 'web', 'dist');
const bundledAdmin = path.join(cliRoot, 'admin-dist');

function main() {
  const indexHtml = path.join(webDist, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.warn('[sync-bundled-admin] Skip: build web first (pnpm run build:web)');
    process.exit(0);
  }

  if (fs.existsSync(bundledAdmin)) {
    fs.rmSync(bundledAdmin, { recursive: true, force: true });
  }
  fs.cpSync(webDist, bundledAdmin, { recursive: true });
  console.log('[sync-bundled-admin] web/dist -> cli/admin-dist/');
}

main();
