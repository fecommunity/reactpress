#!/usr/bin/env node
/**
 * Patch synced ESM server-bundle to require bundled toolkit/dist at package root.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const target = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist',
  'utils',
  'server-bundle.js',
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const src = fs.readFileSync(target, 'utf8');
if (src.includes('getBundledToolkitMain')) {
  process.exit(0);
}

const patched = src
  .replace(
    "const SERVER_ENTRY = join('bin', 'reactpress-server.js');",
    `const SERVER_ENTRY = join('bin', 'reactpress-server.js');
const TOOLKIT_MAIN = join('toolkit', 'dist', 'index.js');`,
  )
  .replace(
    'export function getBundledServerMain() {',
    `export function getBundledToolkitMain() {
    return join(getPackageRoot(), ...TOOLKIT_MAIN.split('/'));
}
export function getBundledServerMain() {`,
  )
  .replace(
    '    if (!(await fs.pathExists(join(serverDir, SERVER_MAIN)))) {',
    `    if (!(await fs.pathExists(join(serverDir, SERVER_MAIN)))) {
        return false;
    }
    if (!(await fs.pathExists(getBundledToolkitMain()))) {`,
  );

fs.writeFileSync(target, patched);
console.log('[patch-bundled-dist] dist/utils/server-bundle.js toolkit check');

const bootstrapPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'out', 'lib', 'bootstrap.js');
if (fs.existsSync(bootstrapPath)) {
  let bootstrap = fs.readFileSync(bootstrapPath, 'utf8');
  const marker = 'ensureBundledPlugins(root)';
  if (!bootstrap.includes(marker)) {
    bootstrap = bootstrap.replace(
      '(0, cli_context_1.setProjectCwd)(root);',
      `(0, cli_context_1.setProjectCwd)(root);
    try {
        const { ensureBundledPlugins } = require('../core/services/local-site');
        ensureBundledPlugins(root);
    }
    catch {
        // ignore
    }`,
    );
    fs.writeFileSync(bootstrapPath, bootstrap);
    console.log('[patch-bundled-dist] bootstrap.js ensureBundledPlugins hook');
  }
}
