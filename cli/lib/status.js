const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const {
  loadServerSiteUrl,
  loadClientSiteUrl,
  getHealthUrl,
  checkHealth,
  isHttpResponding,
} = require('./http');
const { isUsingMonorepoServer } = require('./paths');
const { readPid, isProcessRunning } = require('./process');
const { isDockerRunning } = require('./docker');
const { ensureOriginalCwd } = require('./root');

function envFileStatus(projectRoot) {
  const envPath = path.join(projectRoot, '.env');
  const configPath = path.join(projectRoot, '.reactpress', 'config.json');
  return {
    env: fs.existsSync(envPath),
    config: fs.existsSync(configPath),
    envPath,
    configPath,
  };
}

async function printUnifiedStatus(projectRoot = ensureOriginalCwd()) {
  const env = envFileStatus(projectRoot);
  const apiUrl = loadServerSiteUrl(projectRoot);
  const clientUrl = loadClientSiteUrl(projectRoot);
  const pid = readPid(projectRoot);
  const healthUrl = getHealthUrl(projectRoot);
  const [apiHttp, clientHttp, health] = await Promise.all([
    isHttpResponding(apiUrl),
    isHttpResponding(clientUrl),
    checkHealth(healthUrl),
  ]);

  console.log('');
  console.log(chalk.bold.cyan('  ReactPress 项目状态'));
  console.log(chalk.gray('  ─────────────────────────────────────'));
  console.log(`  项目目录    ${chalk.white(projectRoot)}`);
  console.log(`  API 来源    ${chalk.white(isUsingMonorepoServer() ? 'monorepo server/' : 'reactpress-cli')}`);
  console.log(
    `  配置文件    ${env.config ? chalk.green('.reactpress/config.json ✓') : chalk.yellow('未初始化')}`
  );
  console.log(`  环境变量    ${env.env ? chalk.green('.env ✓') : chalk.yellow('缺少 .env')}`);
  console.log(chalk.gray('  ─────────────────────────────────────'));
  console.log(chalk.bold('  API'));
  console.log(`    URL       ${apiUrl}`);
  console.log(`    HTTP      ${apiHttp ? chalk.green('在线') : chalk.red('离线')}`);
  console.log(
    `    Health    ${
      health.ok
        ? chalk.green(`${healthUrl} ✓`)
        : chalk.gray(`${healthUrl} (离线或未启动)`)
    }`
  );
  if (health.ok && health.data?.data) {
    const db = health.data.data.database;
    console.log(
      `    数据库    ${db === 'up' ? chalk.green('连通') : chalk.red(db === 'down' ? '不可用' : '—')}`
    );
  }
  console.log(`    PID       ${pid ?? '—'} ${pid && isProcessRunning(pid) ? chalk.green('(运行中)') : ''}`);
  console.log(chalk.bold('  前端'));
  console.log(`    URL       ${clientUrl}`);
  console.log(`    HTTP      ${clientHttp ? chalk.green('在线') : chalk.gray('离线')}`);
  console.log(chalk.gray('  ─────────────────────────────────────'));
  console.log(chalk.bold('  Docker'));
  console.log(`    引擎      ${isDockerRunning() ? chalk.green('可用') : chalk.red('未运行')}`);
  console.log('');
}

module.exports = { printUnifiedStatus, envFileStatus };
