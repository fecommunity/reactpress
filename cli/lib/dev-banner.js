const chalk = require('chalk');
const {
  loadClientSiteUrl,
  loadServerSiteUrl,
  getApiPrefix,
  getHealthUrl,
} = require('./http');
const { t } = require('./i18n');

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
  console.log(chalk.bold.green(t('devBanner.ready')));
  console.log(chalk.gray('  ─────────────────────────────────────────'));
  if (!apiOnly) {
    console.log(`  ${chalk.cyan(t('devBanner.site'))}     ${chalk.underline(urls.site)}`);
    console.log(`  ${chalk.cyan(t('devBanner.admin'))}   ${chalk.underline(urls.admin)}`);
  }
  console.log(`  ${chalk.cyan('API')}      ${chalk.underline(urls.api)}`);
  console.log(`  ${chalk.cyan('Swagger')}  ${chalk.underline(urls.swagger)}`);
  console.log(`  ${chalk.cyan(t('devBanner.health'))} ${urls.health}`);
  console.log(chalk.gray('  ─────────────────────────────────────────'));
  console.log(chalk.gray(t('devBanner.hint')));
  console.log('');
}

module.exports = { getDevUrls, printDevReadyBanner };
