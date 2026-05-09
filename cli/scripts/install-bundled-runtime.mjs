import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const serverDir = join(cliRoot, 'server');

function npmInstall() {
  console.log('[reactpress-cli] installing bundled server runtime dependencies…');
  const result = spawnSync(
    'npm',
    ['install', '--omit=dev', '--legacy-peer-deps', '--no-bin-links'],
    {
      cwd: serverDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    }
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(join(serverDir, 'package.json'))) {
  console.warn('[reactpress-cli] bundled server missing, skip runtime install');
  process.exit(0);
}

const serverRuntimeModules = [
  ['node_modules', '@nestjs', 'core'],
  ['node_modules', '@nestjs', 'typeorm'],
  ['node_modules', 'typeorm'],
  ['node_modules', 'express'],
  ['node_modules', '@fecommunity', 'reactpress-toolkit'],
];

const serverReady =
  existsSync(join(serverDir, 'dist', 'main.js')) &&
  serverRuntimeModules.every((parts) => existsSync(join(serverDir, ...parts)));

if (serverReady) {
  process.exit(0);
}

npmInstall();
