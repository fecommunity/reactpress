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
const { nginxEntryUrl } = require('./nginx');
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

function printDevReadyBanner(
  projectRoot,
  {
    apiOnly = false,
    webOnly = false,
    nginx = false,
    hasThemeSite = false,
    dbOk = true,
    adminApiOrigin = null,
    clientApiOrigin = null,
  } = {}
) {
  const urls = getDevUrls(projectRoot);
  const w = Math.min(terminalWidth() - 4, 56);
  const readyKey = apiOnly ? 'devBanner.readyApi' : webOnly ? 'devBanner.readyWeb' : 'devBanner.ready';

  console.log('');
  const lights = dbOk ? 'online' : 'degraded';
  const readyGradient = dbOk ? [palette.green, palette.accent] : [palette.amber, palette.muted];
  console.log(
    `  ${dbOk ? icon.ok : icon.warn}  ${gradientText(t(readyKey), readyGradient, { bold: true })}  ${statusLights(lights)}`
  );
  console.log(`  ${brand.primary('╔' + '═'.repeat(w) + '╗')}`);

  if (nginx) {
    const entry = nginxEntryUrl(projectRoot);
    if (!apiOnly && (hasThemeSite || !webOnly)) {
      console.log(urlLine(t('devBanner.site'), entry));
    }
    if (!apiOnly && hasWeb(projectRoot)) {
      console.log(urlLine(t('devBanner.admin'), `${entry}/admin/`));
    }
    console.log(urlLine(t('devBanner.api'), `${entry}/api`, { underline: false }));
    if (clientApiOrigin) {
      console.log(
        `  ${brand.muted('  ')}${brand.dim(t('devBanner.nginxRemoteHint', { url: clientApiOrigin }))}`
      );
    } else {
      console.log(`  ${brand.muted('  ')}${brand.dim(t('devBanner.nginxHint'))}`);
    }
    if (adminApiOrigin) {
      console.log(
        `  ${brand.muted('  ')}${brand.dim(t('devBanner.adminRemoteHint', { url: adminApiOrigin }))}`
      );
    }
  } else {
    if (!apiOnly) {
      if (!webOnly) {
        console.log(urlLine(t('devBanner.site'), urls.site));
      }
      console.log(urlLine(t('devBanner.admin'), urls.admin));
    }
    console.log(urlLine(t('devBanner.api'), urls.api));
    console.log(urlLine(t('devBanner.swagger'), urls.swagger));
    console.log(urlLine(t('devBanner.health'), urls.health, { underline: false }));
  }

  const pulseWidth = Math.min(20, w - 4);
  if (pulseWidth > 6) {
    console.log(
      `  ${brand.muted('  ')}${pulseBar(pulseWidth, pulseWidth)}  ${
        dbOk
          ? brand.success(t('devBanner.allSystemsGo'))
          : brand.warn(t('devBanner.dbDegraded'))
      }`
    );
  }

  console.log(`  ${brand.primary('╚' + '═'.repeat(w) + '╝')}`);
  console.log(
    `  ${brand.dim(t('devBanner.hint'))}  ${brand.muted('·')}  ${brand.dim(t('devBanner.shortcuts'))}`
  );
  console.log('');
}

module.exports = { getDevUrls, printDevReadyBanner };
