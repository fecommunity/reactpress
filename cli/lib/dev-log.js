const { t } = require('./i18n');

let startedAt = 0;
/** @type {Map<string, number>} */
const marks = new Map();

function startDevTimer() {
  startedAt = Date.now();
  marks.clear();
  marks.set('start', 0);
}

function markDevPhase(name) {
  if (!startedAt) startDevTimer();
  marks.set(name, Date.now() - startedAt);
}

function isDevVerbose() {
  return process.env.REACTPRESS_DEV_VERBOSE === '1';
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function logDevSection(messageKey, vars = {}) {
  console.log(`\n${t(messageKey, vars)}`);
}

function logDevStatus(messageKey, vars = {}) {
  console.log(`  ${t(messageKey, vars)}`);
}

function logDevLine(messageKey, vars = {}) {
  const msg = t(messageKey, vars);
  console.log(msg.startsWith('[reactpress]') ? msg : `[reactpress] ${msg}`);
}

function logDevDetail(messageKey, vars = {}) {
  if (isDevVerbose()) logDevStatus(messageKey, vars);
}

function logDevTimingSummary(extra = {}) {
  markDevPhase('ready');
  const readyMs = marks.get('ready') ?? Date.now() - startedAt;
  const infraMs = marks.has('infra') ? marks.get('infra') - (marks.get('start') || 0) : null;
  const servicesMs = marks.has('services') ? marks.get('services') - (marks.get('infra') || 0) : null;

  const parts = [`${(readyMs / 1000).toFixed(1)}s`];
  if (infraMs != null) parts.push(`${t('dev.timingInfra')} ${formatDuration(infraMs)}`);
  if (servicesMs != null) parts.push(`${t('dev.timingServices')} ${formatDuration(servicesMs)}`);
  if (extra.apiReused) parts.push(t('dev.timingApiReused'));

  logDevStatus('dev.timingReady', { summary: parts.join(' · ') });
}

module.exports = {
  startDevTimer,
  markDevPhase,
  isDevVerbose,
  logDevSection,
  logDevStatus,
  logDevLine,
  logDevDetail,
  logDevTimingSummary,
};
