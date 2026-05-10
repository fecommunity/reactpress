const chalk = require('chalk');
const {
  loadClientSiteUrl,
  loadServerSiteUrl,
  getApiPrefix,
  getHealthUrl,
} = require('./http');

function getDevUrls(projectRoot) {
  const client = loadClientSiteUrl(projectRoot).replace(/\/$/, '');
  const server = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
  const prefix = getApiPrefix(projectRoot).replace(/\/$/, '') || '/api';
  return {
    site: client,
    admin: `${client}/admin`,
    api: `${server}${prefix}`,
    swagger: `${server}${prefix}`,
    health: getHealthUrl(projectRoot),
  };
}

function printDevReadyBanner(projectRoot, { apiOnly = false } = {}) {
  const urls = getDevUrls(projectRoot);
  console.log('');
  console.log(chalk.bold.green('  ✓ ReactPress 开发环境已就绪'));
  console.log(chalk.gray('  ─────────────────────────────────────────'));
  if (!apiOnly) {
    console.log(`  ${chalk.cyan('前台')}     ${chalk.underline(urls.site)}`);
    console.log(`  ${chalk.cyan('管理端')}   ${chalk.underline(urls.admin)}`);
  }
  console.log(`  ${chalk.cyan('API')}      ${chalk.underline(urls.api)}`);
  console.log(`  ${chalk.cyan('Swagger')}  ${chalk.underline(urls.swagger)}`);
  console.log(`  ${chalk.cyan('健康检查')} ${urls.health}`);
  console.log(chalk.gray('  ─────────────────────────────────────────'));
  console.log(chalk.gray('  诊断: reactpress doctor  ·  状态: reactpress status'));
  console.log('');
}

module.exports = { getDevUrls, printDevReadyBanner };
