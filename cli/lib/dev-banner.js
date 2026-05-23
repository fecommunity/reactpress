const {
  brand,
  icon,
  ok,
  divider,
  padRight,
  terminalWidth,
  gradientText,
  palette,
  pulseBar,
  statusLights,
} = require('../ui/theme');
const {
  loadClientSiteUrl,
  loadWebAdminUrl,
  loadServerSiteUrl,
  getApiPrefix,
  getHealthUrl,
} = require('./http');
const { hasWeb } = require('./project-type');
const { t } = require('./i18n');

function getDevUrls(projectRoot) {
  const client = loadClientSiteUrl(projectRoot).replace(/\/$/, '');
  const server = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
  const prefix = getApiPrefix(projectRoot).replace(/\/$/, '') || '/api';
  const admin = hasWeb(projectRoot)
    ? loadWebAdminUrl(projectRoot).replace(/\/$/, '')
    : `${client}/admin`;
  return {
    site: client,
    admin,
    api: `${server}${prefix}`,
    swagger: `${server}${prefix}`,
    health: getHealthUrl(projectRoot),
  };
}

function urlLine(key, url, { underline = true } = {}) {
  const keyCol = brand.muted(padRight(key, 10));
  const value = underline ? brand.accent.underline(url) : brand.dim(url);
  return `  ${brand.accent('▸ ')}${keyCol}  ${value}`;
}

function printDevReadyBanner(projectRoot, { apiOnly = false } = {}) {
  const urls = getDevUrls(projectRoot);
  const w = Math.min(terminalWidth() - 4, 56);

  console.log('');
  console.log(
    `  ${icon.ok}  ${gradientText(t('devBanner.ready'), [palette.green, palette.accent], { bold: true })}  ${statusLights('online')}`
  );
  console.log(`  ${brand.primary('╔' + '═'.repeat(w) + '╗')}`);

  if (!apiOnly) {
    console.log(urlLine(t('devBanner.site'), urls.site));
    console.log(urlLine(t('devBanner.admin'), urls.admin));
  }
  console.log(urlLine(t('devBanner.api'), urls.api));
  console.log(urlLine(t('devBanner.swagger'), urls.swagger));
  console.log(urlLine(t('devBanner.health'), urls.health, { underline: false }));

  const pulseWidth = Math.min(20, w - 4);
  if (pulseWidth > 6) {
    console.log(
      `  ${brand.muted('  ')}${pulseBar(pulseWidth, pulseWidth)}  ${brand.success(t('devBanner.allSystemsGo'))}`
    );
  }

  console.log(`  ${brand.primary('╚' + '═'.repeat(w) + '╝')}`);
  console.log(
    `  ${brand.dim(t('devBanner.hint'))}  ${brand.muted('·')}  ${brand.dim(t('devBanner.shortcuts'))}`
  );
  console.log('');
}

module.exports = { getDevUrls, printDevReadyBanner };
