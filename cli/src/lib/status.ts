// @ts-nocheck
const fs = require('fs');
const path = require('path');
const {
  brand,
  icon,
  divider,
  padRight,
  statusPill,
  sectionHeader,
  terminalWidth,
  gradientText,
  palette,
} = require('../ui/theme');
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
const { t } = require('./i18n');

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

function fieldRow(label, value) {
  return `    ${brand.muted(padRight(label, 10))}  ${value}`;
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

  const apiSource = isUsingMonorepoServer(projectRoot)
    ? t('status.apiSource.monorepo')
    : t('status.apiSource.bundle');

  const w = Math.min(terminalWidth() - 4, 52);
  const httpOn = { on: t('status.apiOnline'), off: t('status.apiOffline') };

  console.log('');
  console.log(`  ${gradientText(t('status.title'), [palette.primary, palette.accent], { bold: true })}`);
  console.log(`  ${divider(w)}`);

  console.log(sectionHeader(t('status.section.project')));
  console.log(fieldRow(t('status.field.dir'), brand.dim(projectRoot)));
  console.log(fieldRow(t('status.field.source'), brand.accent(apiSource)));
  console.log(
    fieldRow(
      t('status.field.config'),
      env.config ? brand.success(t('status.configOk')) : brand.warn(t('status.configBad'))
    )
  );
  console.log(
    fieldRow(
      t('status.field.env'),
      env.env ? brand.success(t('status.envOk')) : brand.warn(t('status.envBad'))
    )
  );

  console.log('');
  console.log(sectionHeader(t('status.section.api')));
  console.log(fieldRow(t('status.field.url'), brand.dim(apiUrl)));
  console.log(fieldRow(t('status.field.http'), statusPill(apiHttp, httpOn)));
  console.log(
    fieldRow(
      t('status.field.health'),
      health.ok
        ? `${icon.ok} ${brand.dim(healthUrl)}`
        : brand.dim(t('status.apiUnreachable', { url: healthUrl }))
    )
  );
  if (health.ok && health.data?.data) {
    const db = health.data.data.database;
    const dbOk = db === 'up';
    console.log(
      fieldRow(
        t('status.field.database'),
        statusPill(dbOk, { on: t('status.dbUp'), off: t('status.dbDown') })
      )
    );
  }
  const pidAlive = pid && isProcessRunning(pid);
  console.log(
    fieldRow(
      t('status.field.pid'),
      `${brand.dim(pid ?? '—')}${pidAlive ? `  ${brand.success(t('status.pidRunning'))}` : ''}`
    )
  );

  console.log('');
  console.log(sectionHeader(t('status.section.frontend')));
  console.log(fieldRow(t('status.field.url'), brand.dim(clientUrl)));
  console.log(fieldRow(t('status.field.http'), statusPill(clientHttp, httpOn)));

  console.log('');
  console.log(sectionHeader(t('status.section.docker')));
  console.log(
    fieldRow(
      t('status.field.engine'),
      statusPill(isDockerRunning(), {
        on: t('status.dockerUp'),
        off: t('status.dockerDown'),
      })
    )
  );

  console.log(`  ${divider(w)}`);
  console.log('');
}

module.exports = { printUnifiedStatus, envFileStatus };
