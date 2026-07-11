#!/usr/bin/env node
/**
 * Simulate a global npm install from a pruned tarball and smoke-test init/doctor.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..');
const cliRoot = path.join(repoRoot, 'cli');

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function packCli() {
  const prepack = spawnSync('npm', ['run', 'prepack'], { cwd: cliRoot, stdio: 'inherit', shell: process.platform === 'win32' });
  if (prepack.status !== 0) {
    process.exit(prepack.status ?? 1);
  }
  const output = execFileSync('npm', ['pack', '--ignore-scripts'], {
    cwd: cliRoot,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  const filename = output.trim().split('\n').pop().trim();
  return path.join(cliRoot, filename);
}

const tarball = packCli();
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-global-'));
const installDir = path.join(workDir, 'global');
const projectDir = path.join(workDir, 'site');

try {
  fs.mkdirSync(installDir, { recursive: true });
  fs.mkdirSync(projectDir, { recursive: true });

  console.log('[simulate-global-install] installing tarball…');
  run('npm', ['install', '--prefix', installDir, tarball]);

  const cliBin = path.join(
    installDir,
    'node_modules',
    '@fecommunity',
    'reactpress',
    'bin',
    'reactpress.js',
  );
  if (!fs.existsSync(cliBin)) {
    console.error('[simulate-global-install] CLI bin not found:', cliBin);
    process.exit(1);
  }

  console.log('[simulate-global-install] reactpress --help');
  run(process.execPath, [cliBin, '--help']);

  console.log('[simulate-global-install] reactpress init');
  run(process.execPath, [cliBin, 'init', projectDir], {
    env: {
      ...process.env,
      REACTPRESS_LOCAL_MODE: '1',
      REACTPRESS_SKIP_NGINX: '1',
      TERM: 'dumb',
    },
  });

  console.log('[simulate-global-install] reactpress doctor');
  const doctor = spawnSync(process.execPath, [cliBin, 'doctor', projectDir], {
    encoding: 'utf8',
    env: {
      ...process.env,
      REACTPRESS_LOCAL_MODE: '1',
      REACTPRESS_SKIP_NGINX: '1',
      TERM: 'dumb',
    },
  });
  const doctorOut = `${doctor.stdout || ''}${doctor.stderr || ''}`;
  if (!/ReactPress Doctor/i.test(doctorOut)) {
    console.error(doctorOut);
    process.exit(1);
  }

  console.log('[simulate-global-install] OK');
} finally {
  fs.rmSync(tarball, { force: true });
  fs.rmSync(workDir, { recursive: true, force: true });
}
