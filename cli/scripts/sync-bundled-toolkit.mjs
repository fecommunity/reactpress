#!/usr/bin/env node
/**
 * Copy built toolkit into cli/toolkit/ for bundled server runtime (require ../../toolkit/dist).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.join(__dirname, '..');
const repoRoot = path.join(cliRoot, '..');
const monorepoToolkit = path.join(repoRoot, 'toolkit');
const bundledToolkit = path.join(cliRoot, 'toolkit');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
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
  const distIndex = path.join(monorepoToolkit, 'dist', 'index.js');
  if (!fs.existsSync(distIndex)) {
    console.warn('[sync-bundled-toolkit] Skip: build toolkit first (pnpm run build --dir toolkit)');
    process.exit(0);
  }

  replaceDir(path.join(monorepoToolkit, 'dist'), path.join(bundledToolkit, 'dist'));

  const srcPkg = JSON.parse(
    fs.readFileSync(path.join(monorepoToolkit, 'package.json'), 'utf8'),
  );
  const minimal = {
    name: srcPkg.name,
    version: srcPkg.version,
    main: srcPkg.main ?? 'dist/index.js',
    types: srcPkg.types ?? 'dist/index.d.ts',
    ...(srcPkg.exports ? { exports: srcPkg.exports } : {}),
  };
  fs.writeFileSync(
    path.join(bundledToolkit, 'package.json'),
    `${JSON.stringify(minimal, null, 2)}\n`,
  );

  console.log('[sync-bundled-toolkit] toolkit/dist -> cli/toolkit/');
}

main();
