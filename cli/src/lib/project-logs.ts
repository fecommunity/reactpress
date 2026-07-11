// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { brand, divider, gradientText, palette, sectionHeader } = require('../ui/theme');
const { getServerDir, getPidFile } = require('./paths');
const { readPid, isProcessRunning } = require('./process');
const { t } = require('./i18n');

const LOG_SOURCES = ['error', 'request', 'response'];

function getProjectServerLogDir(projectRoot) {
  const preferred = path.join(projectRoot, '.reactpress', 'logs', 'server');
  if (fs.existsSync(preferred)) {
    return preferred;
  }
  const bundled = path.join(getServerDir(projectRoot), 'logs');
  if (fs.existsSync(bundled)) {
    return bundled;
  }
  return preferred;
}

function normalizeSource(source) {
  const value = String(source || 'error').toLowerCase();
  if (value === 'all') return 'all';
  if (LOG_SOURCES.includes(value)) return value;
  return 'error';
}

function listLogFiles(logDir, source = 'error') {
  const normalized = normalizeSource(source);
  const sources = normalized === 'all' ? LOG_SOURCES : [normalized];
  const files = [];

  for (const name of sources) {
    const dir = path.join(logDir, name);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (!entry.endsWith('.log')) continue;
      const fullPath = path.join(dir, entry);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;
      files.push({
        source: name,
        path: fullPath,
        name: entry,
        mtimeMs: stat.mtimeMs,
        size: stat.size,
      });
    }
  }

  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return files;
}

function readTailLines(filePath, lineCount = 50) {
  const maxLines = Math.max(1, Math.min(Number(lineCount) || 50, 5000));
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }
  if (!content) return [];
  const lines = content.split(/\r?\n/);
  if (lines.length && lines[lines.length - 1] === '') {
    lines.pop();
  }
  if (lines.length <= maxLines) return lines;
  return lines.slice(-maxLines);
}

function filterLines(lines, pattern) {
  if (!pattern) return lines;
  let re;
  try {
    re = new RegExp(pattern, 'i');
  } catch {
    const err = new Error(t('doctor.logs.badPattern', { pattern }));
    err.code = 'REACTPRESS_LOG_BAD_PATTERN';
    throw err;
  }
  return lines.filter((line) => re.test(line));
}

function formatBytes(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimestamp(ms) {
  return new Date(ms).toISOString().replace('T', ' ').slice(0, 19);
}

function printProcessHint(projectRoot) {
  const pid = readPid(projectRoot);
  const pidFile = getPidFile(projectRoot);
  if (!pid) {
    console.log(`  ${brand.dim(t('doctor.logs.noPid', { path: pidFile }))}`);
    return;
  }
  const alive = isProcessRunning(pid);
  console.log(
    `  ${brand.dim(
      alive
        ? t('doctor.logs.pidRunning', { pid, path: pidFile })
        : t('doctor.logs.pidStale', { pid, path: pidFile })
    )}`
  );
}

async function runDoctorLogs(projectRoot, options = {}) {
  const tail = Math.max(1, Math.min(parseInt(String(options.tail ?? '50'), 10) || 50, 5000));
  const source = normalizeSource(options.source);
  const logDir = getProjectServerLogDir(projectRoot);
  const files = listLogFiles(logDir, source);
  const w = 56;

  console.log('');
  console.log(
    `  ${gradientText(t('doctor.logs.title'), [palette.primary, palette.accent], { bold: true })}  ${brand.dim(t('doctor.logs.subtitle'))}`
  );
  console.log(`  ${brand.dim(t('doctor.project', { path: projectRoot }))}`);
  console.log(`  ${brand.dim(t('doctor.logs.dir', { path: logDir }))}`);
  printProcessHint(projectRoot);
  console.log(`  ${divider(w)}`);

  if (options.list) {
    if (!files.length) {
      console.log(`  ${brand.warn(t('doctor.logs.empty'))}`);
      console.log(`  ${brand.dim(t('doctor.logs.emptyHint'))}`);
      console.log('');
      return 1;
    }
    console.log(sectionHeader(t('doctor.logs.listHeader')));
    for (const file of files) {
      const rel = path.join(file.source, file.name);
      console.log(
        `    ${brand.primary(rel)}  ${brand.dim(`${formatBytes(file.size)}  ${formatTimestamp(file.mtimeMs)}`)}`
      );
    }
    console.log('');
    return 0;
  }

  if (!files.length) {
    console.log(`  ${brand.warn(t('doctor.logs.empty'))}`);
    console.log(`  ${brand.dim(t('doctor.logs.emptyHint'))}`);
    console.log('');
    return 1;
  }

  const grouped = new Map();
  for (const file of files) {
    if (!grouped.has(file.source)) grouped.set(file.source, file);
  }

  let printed = 0;
  for (const name of source === 'all' ? LOG_SOURCES : [source]) {
    const file = grouped.get(name);
    if (!file) continue;
    let lines = readTailLines(file.path, tail);
    lines = filterLines(lines, options.grep);
    const rel = path.join(file.source, file.name);
    console.log('');
    console.log(
      sectionHeader(
        t('doctor.logs.fileHeader', {
          file: rel,
          count: lines.length,
        })
      )
    );
    if (!lines.length) {
      console.log(`    ${brand.dim(t('doctor.logs.noMatchingLines'))}`);
      continue;
    }
    for (const line of lines) {
      const isError = /\[ERROR\]/i.test(line) || name === 'error';
      console.log(`    ${isError ? brand.warn(line) : brand.dim(line)}`);
    }
    printed += lines.length;
  }

  if (!printed) {
    console.log(`  ${brand.warn(t('doctor.logs.noMatchingLines'))}`);
    console.log('');
    return 1;
  }

  console.log('');
  console.log(`  ${brand.dim(t('doctor.logs.moreHint'))}`);
  console.log('');
  return 0;
}

module.exports = {
  LOG_SOURCES,
  getProjectServerLogDir,
  listLogFiles,
  readTailLines,
  filterLines,
  runDoctorLogs,
};
