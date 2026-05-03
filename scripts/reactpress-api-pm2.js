#!/usr/bin/env node

/**
 * Start bundled API with PM2 (production).
 */

const { spawn } = require('child_process');
const { getBundledServerBin, getBundledServerDir, getMonorepoRoot } = require('./bundled-server-path');

const projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot();

const child = spawn(process.execPath, [getBundledServerBin(), '--pm2'], {
  stdio: 'inherit',
  cwd: getBundledServerDir(),
  env: {
    ...process.env,
    REACTPRESS_ORIGINAL_CWD: projectRoot,
  },
});

child.on('error', (error) => {
  console.error('[reactpress] Failed to start API with PM2:', error);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
