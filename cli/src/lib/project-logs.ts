// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { brand, divider, gradientText, palette, sectionHeader } = require('../ui/theme');
const { getServerDir, getPidFile } = require('./paths');
const { readPid, isProcessRunning } = require('./process');
const { loadServerSiteUrl } = require('./http');
const { getPm2App, PM2_API_APP } = require('./pm2-runtime');
const { t } = require('./i18n');

const LOG_SOURCES = ['error', 'request', 'response'];

function measureLogDir(logDir) {
  if (!fs.existsSync(logDir)) return -1;
  return listLogFiles(logDir, 'all').reduce((sum, file) => sum + file.size, 0);
}

function getPm2ServerLogDir(projectRoot) {
  try {
    const app = getPm2App(projectRoot, PM2_API_APP);
    const dir = app?.pm2_env?.env?.REACTPRESS_SERVER_LOG_DIR;
    if (typeof dir === 'string' && dir.trim()) {
      return path.resolve(dir.trim());
    }
  } catch {
    // ignore
  }
  return null;
}

function parseUrlPort(urlString) {
  try {
    const url = new URL(urlString);
    const port = Number(url.port);
    if (port > 0) return port;
    return url.protocol === 'https:' ? 443 : 80;
  } catch {
    return null;
  }
}

function resolveListeningPid(port) {
  if (!port || process.platform === 'win32') return null;
  const result = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (result.status !== 0 || !result.stdout.trim()) return null;
  const pids = result.stdout
    .trim()
    .split('\n')
    .map((line) => Number.parseInt(line.trim(), 10))
    .filter((pid) => Number.isFinite(pid));
  return pids[0] ?? null;
}

function resolveLogDirFromPid(pid) {
  if (!pid || process.platform === 'win32') return null;
  const result = spawnSync('lsof', ['-Fn', '-p', String(pid)], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (result.status !== 0) return null;
  for (const line of result.stdout.split('\n')) {
    if (!line.startsWith('n') || !line.includes('.log')) continue;
    const logPath = line.slice(1);
    const match = logPath.match(/^(.*\/logs)\/(?:error|request|response)\//);
    if (match) return match[1];
  }
  return null;
}

function resolveActiveServerLogDir(projectRoot) {
  const port = parseUrlPort(loadServerSiteUrl(projectRoot));
  if (!port) return null;
  const pid = resolveListeningPid(port);
  if (!pid) return null;
  return resolveLogDirFromPid(pid);
}

function collectLogDirCandidates(projectRoot) {
  const candidates = [
    path.join(projectRoot, '.reactpress', 'logs', 'server'),
    path.join(getServerDir(projectRoot), 'logs'),
  ];
  const pm2Dir = getPm2ServerLogDir(projectRoot);
  if (pm2Dir) candidates.push(pm2Dir);
  const activeDir = resolveActiveServerLogDir(projectRoot);
  if (activeDir) candidates.push(activeDir);
  return [...new Set(candidates.map((dir) => path.resolve(dir)))];
}

function getProjectServerLogDir(projectRoot) {
  const preferred = path.join(projectRoot, '.reactpress', 'logs', 'server');
  const bundled = path.join(getServerDir(projectRoot), 'logs');
  const pm2Dir = getPm2ServerLogDir(projectRoot);
  const activeDir = resolveActiveServerLogDir(projectRoot);

  const localCandidates = [preferred, bundled];
  if (pm2Dir) localCandidates.push(pm2Dir);

  let bestLocal = preferred;
  let bestLocalScore = -1;
  for (const dir of [...new Set(localCandidates.map((d) => path.resolve(d)))]) {
    const score = measureLogDir(dir);
    if (score > bestLocalScore) {
      bestLocalScore = score;
      bestLocal = dir;
    }
  }

  if (bestLocalScore > 0) {
    return bestLocal;
  }

  if (activeDir && fs.existsSync(activeDir) && measureLogDir(activeDir) > 0) {
    return activeDir;
  }

  return bestLocal;
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
    const port = parseUrlPort(loadServerSiteUrl(projectRoot));
    const activePid = port ? resolveListeningPid(port) : null;
    if (activePid && isProcessRunning(activePid)) {
      console.log(
        `  ${brand.dim(t('doctor.logs.activePid', { pid: activePid, port }))}`
      );
      return;
    }
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
    `  ${gradientText(t('logs.title'), [palette.primary, palette.accent], { bold: true })}  ${brand.dim(t('logs.subtitle'))}`
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
  collectLogDirCandidates,
  measureLogDir,
  resolveActiveServerLogDir,
  listLogFiles,
  readTailLines,
  filterLines,
  runDoctorLogs,
};
