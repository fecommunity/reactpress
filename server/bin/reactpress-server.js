#!/usr/bin/env node

/**
 * @fecommunity/reactpress-server — thin entry that delegates to the server
 * bundled in @fecommunity/reactpress-cli (no local NestJS source in this repo).
 */

const { spawn } = require('child_process');
const path = require('path');
const { getBundledServerBin, getBundledServerDir, getMonorepoRoot } = require('../lib/bundled-server-path');

const args = process.argv.slice(2);
const projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot();

const child = spawn(process.execPath, [getBundledServerBin(), ...args], {
  stdio: 'inherit',
  cwd: getBundledServerDir(),
  env: {
    ...process.env,
    REACTPRESS_ORIGINAL_CWD: projectRoot,
  },
});

child.on('error', (error) => {
  console.error('[ReactPress Server] Failed to start:', error);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
