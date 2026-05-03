#!/usr/bin/env node

/**
 * Development API: ensure config, start via reactpress-cli, keep process alive for concurrently.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { getMonorepoRoot } = require('./bundled-server-path');

const projectRoot = process.env.REACTPRESS_ORIGINAL_CWD || getMonorepoRoot();
const configPath = path.join(projectRoot, '.reactpress', 'config.json');

process.env.REACTPRESS_ORIGINAL_CWD = projectRoot;

if (!fs.existsSync(configPath)) {
  console.warn('[reactpress] 未找到 .reactpress/config.json，正在执行 reactpress-cli init …');
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

console.log('[reactpress] API 已由 reactpress-cli 启动。按 Ctrl+C 停止 API 与前端。');
console.log('[reactpress] 单独停止 API: pnpm exec reactpress-cli stop');

process.stdin.resume();

function stopApi() {
  spawnSync('pnpm', ['exec', 'reactpress-cli', 'stop'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });
}

process.on('SIGINT', () => {
  stopApi();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopApi();
  process.exit(0);
});
