#!/usr/bin/env node

/**
 * Start API with PM2 (monorepo server or CLI bundle).
 */

const { spawn } = require('child_process');
const {
  getServerBin,
  getServerDir,
  getMonorepoRoot,
} = require('./bundled-server-path');

const projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot();

const child = spawn(process.execPath, [getServerBin(), '--pm2'], {
  stdio: 'inherit',
  cwd: getServerDir(),
  env: {
    ...process.env,
    REACTPRESS_ORIGINAL_CWD: projectRoot,
  },
});

child.on('error', (error) => {
  console.error('[reactpress] PM2 启动 API 失败:', error);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});
