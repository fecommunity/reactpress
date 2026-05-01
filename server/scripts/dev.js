#!/usr/bin/env node

/**
 * Development: ensure DB via reactpress-cli, then run bundled API in the foreground.
 */

const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { getBundledServerBin, getMonorepoRoot } = require('../lib/bundled-server-path');

const projectRoot = getMonorepoRoot();
const configPath = path.join(projectRoot, '.reactpress', 'config.json');

process.env.REACTPRESS_ORIGINAL_CWD = projectRoot;

if (!fs.existsSync(configPath)) {
  console.warn(
    '[ReactPress Server] 未找到 .reactpress/config.json，正在执行 reactpress-cli init …'
  );
  const init = spawnSync('pnpm', ['exec', 'reactpress-cli', 'init', '.'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  if (init.status !== 0) {
    process.exit(init.status ?? 1);
  }
}

const start = spawnSync('pnpm', ['exec', 'reactpress-cli', 'start'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

if (start.status !== 0) {
  process.exit(start.status ?? 1);
}

console.log(
  '[ReactPress Server] API 已由 reactpress-cli 在后台启动。本进程保持运行以便 concurrently 管理；按 Ctrl+C 停止。'
);
console.log('[ReactPress Server] 停止 API: pnpm exec reactpress-cli stop');

process.stdin.resume();

process.on('SIGINT', () => {
  spawnSync('pnpm', ['exec', 'reactpress-cli', 'stop'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  process.exit(0);
});

process.on('SIGTERM', () => {
  spawnSync('pnpm', ['exec', 'reactpress-cli', 'stop'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  process.exit(0);
});
