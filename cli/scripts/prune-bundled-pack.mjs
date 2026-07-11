#!/usr/bin/env node
/**
 * Strip heavyweight artifacts before `npm pack` so the published tarball stays <10MB.
 * Runtime deps are installed via postinstall (install-bundled-runtime.mjs).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.join(__dirname, '..');

const REMOVE_DIRS = [
  'server/node_modules',
  'toolkit/node_modules',
  'server/logs',
  'server/.reactpress',
  'server/public/uploads',
  'server/dist/public',
];

const PRUNE_DIRS = ['out', 'dist', 'server/dist', 'toolkit/dist'];

function shouldPruneFile(name) {
  return (
    name.endsWith('.map') ||
    name.endsWith('.d.ts') ||
    name.endsWith('.d.ts.map') ||
    name.endsWith('.tsbuildinfo')
  );
}

function rmDir(rel) {
  const abs = path.join(cliRoot, rel);
  if (!fs.existsSync(abs)) return;
  fs.rmSync(abs, { recursive: true, force: true });
  console.log(`[prune-bundled-pack] removed ${rel}`);
}

function walkPrune(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') {
        fs.rmSync(abs, { recursive: true, force: true });
        console.log(`[prune-bundled-pack] removed ${path.relative(cliRoot, abs)}`);
        continue;
      }
      walkPrune(abs);
      continue;
    }
    if (shouldPruneFile(entry.name)) {
      fs.unlinkSync(abs);
    }
  }
}

function main() {
  for (const rel of REMOVE_DIRS) {
    rmDir(rel);
  }
  for (const rel of PRUNE_DIRS) {
    walkPrune(path.join(cliRoot, rel));
  }
  console.log('[prune-bundled-pack] done');
}

main();
