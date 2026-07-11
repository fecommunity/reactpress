#!/usr/bin/env node
/**
 * prepare lifecycle:
 * - npm install (local): sync bundled core + build TypeScript
 * - npm pack / publish: no-op (prepack already synced and pruned)
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const npmCommand = process.env.npm_command || '';

if (npmCommand === 'pack' || npmCommand === 'publish') {
  process.exit(0);
}

function run(label, cmd, args) {
  const result = spawnSync(cmd, args, { cwd: cliRoot, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('sync-bundled-core', process.execPath, [join(cliRoot, 'scripts', 'sync-bundled-core.mjs')]);
run('build', 'pnpm', ['run', 'build']);
