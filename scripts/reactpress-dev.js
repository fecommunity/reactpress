// scripts/dev.js
const { spawn } = require('child_process');
const path = require('path');

// 获取当前工作目录
const currentWorkingDir = process.cwd();

// 设置环境变量
process.env.REACTPRESS_ORIGINAL_CWD = currentWorkingDir;

console.log(`设置 REACTPRESS_ORIGINAL_CWD: ${currentWorkingDir}`);

// 执行构建命令
const build = spawn('pnpm', ['build:toolkit'], {
  stdio: 'inherit',
  shell: true
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error(`构建失败，退出码: ${code}`);
    process.exit(code);
  }
  
  // 执行并发命令
  const concurrently = spawn('npx', [
    'concurrently',
    'pnpm:dev:server',
    'pnpm:dev:client'
  ], {
    stdio: 'inherit',
    shell: true,
    cwd: currentWorkingDir
  });
  
  concurrently.on('close', (code) => {
    process.exit(code);
  });
});