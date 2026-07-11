// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { brand, divider, gradientText, palette, sectionHeader } = require('../ui/theme');
const { getServerDir, getPidFile } = require('./paths');
const { readPid, isProcessRunning } = require('./process');
const { loadServerSiteUrl } = require('./http');
const {
  getPm2App,
  PM2_API_APP,
  isPm2AppOnline,
  getPm2AppLogPaths,
  resolvePm2Bin,
} = require('./pm2-runtime');
const { t } = require('./i18n');

const LOG_SOURCES = ['error', 'request', 'response'];
const PROCESS_LOG_SOURCES = ['pm2-out', 'pm2-error'];
const PM2_LOG_FILES = {
  'pm2-out': 'pm2-out.log',
  'pm2-error': 'pm2-error.log',
};

function measureLogDir(logDir) {
  if (!fs.existsSync(logDir)) return -1;
  let total = listLogFiles(logDir, 'all').reduce((sum, file) => sum + file.size, 0);
  for (const filename of Object.values(PM2_LOG_FILES)) {
    const filePath = path.join(logDir, filename);
    try {
      if (fs.existsSync(filePath)) {
        total += fs.statSync(filePath).size;
      }
    } catch {
      // ignore
    }
  }
  return total;
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
  if (value === 'process' || value === 'pm2') return 'process';
  if (LOG_SOURCES.includes(value)) return value;
  return 'error';
}

function measureStructuredLogDir(logDir) {
  if (!fs.existsSync(logDir)) return 0;
  let total = 0;
  for (const name of LOG_SOURCES) {
    const dir = path.join(logDir, name);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (!entry.endsWith('.log')) continue;
      try {
        total += fs.statSync(path.join(dir, entry)).size;
      } catch {
        // ignore
      }
    }
  }
  return total;
}

function resolveLogSource(projectRoot, sourceOption) {
  if (sourceOption != null && String(sourceOption).trim() !== '') {
    return normalizeSource(sourceOption);
  }
  const logDir = path.join(projectRoot, '.reactpress', 'logs', 'server');
  if (measureStructuredLogDir(logDir) > 0) {
    return 'error';
  }
  if (isPm2AppOnline(projectRoot, PM2_API_APP)) {
    return 'process';
  }
  return 'error';
}

function listProcessLogFiles(projectRoot, logDir, source = 'process') {
  const normalized = normalizeSource(source);
  const names =
    normalized === 'all'
      ? PROCESS_LOG_SOURCES
      : normalized === 'process'
        ? PROCESS_LOG_SOURCES
        : PROCESS_LOG_SOURCES.includes(normalized)
          ? [normalized]
          : [];
  if (!names.length) return [];

  const pm2Paths = getPm2AppLogPaths(projectRoot, PM2_API_APP);
  const pathBySource = {
    'pm2-out': pm2Paths.out,
    'pm2-error': pm2Paths.err,
  };
  const files = [];

  for (const name of names) {
    const localPath = path.join(logDir, PM2_LOG_FILES[name]);
    const candidates = [];
    if (fs.existsSync(localPath)) {
      candidates.push(localPath);
    }
    const remotePath = pathBySource[name];
    if (
      remotePath &&
      path.resolve(remotePath) !== path.resolve(localPath) &&
      fs.existsSync(remotePath)
    ) {
      candidates.push(remotePath);
    }
    const seen = new Set();
    for (const fullPath of candidates) {
      const resolved = path.resolve(fullPath);
      if (seen.has(resolved)) continue;
      seen.add(resolved);
      let stat;
      try {
        stat = fs.statSync(resolved);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;
      files.push({
        source: name,
        path: resolved,
        name: path.basename(resolved),
        mtimeMs: stat.mtimeMs,
        size: stat.size,
      });
      break;
    }
  }

  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return files;
}

function listLogFiles(logDir, source = 'error', projectRoot = null) {
  const normalized = normalizeSource(source);
  if (normalized === 'process' || PROCESS_LOG_SOURCES.includes(normalized)) {
    return listProcessLogFiles(projectRoot || '', logDir, normalized);
  }

  const sources =
    normalized === 'all'
      ? [...PROCESS_LOG_SOURCES, ...LOG_SOURCES]
      : [normalized];
  const files = [];

  if (normalized === 'all' && projectRoot) {
    files.push(...listProcessLogFiles(projectRoot, logDir, 'process'));
  }

  for (const name of sources) {
    if (PROCESS_LOG_SOURCES.includes(name)) continue;
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
  if (isPm2AppOnline(projectRoot, PM2_API_APP)) {
    const pid = getPm2App(projectRoot, PM2_API_APP)?.pid;
    console.log(
      `  ${brand.dim(t('doctor.logs.pm2Supervised', { pid: pid ?? PM2_API_APP }))}`
    );
    return;
  }

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

function pickPrimaryLogFile(files, source) {
  if (!files.length) return null;
  if (source === 'process') {
    return (
      files.find((file) => file.source === 'pm2-error') ||
      files.find((file) => file.source === 'pm2-out') ||
      files[0]
    );
  }
  const grouped = new Map();
  for (const file of files) {
    if (!grouped.has(file.source)) grouped.set(file.source, file);
  }
  const order = source === 'all' ? [...PROCESS_LOG_SOURCES, ...LOG_SOURCES] : [source];
  for (const name of order) {
    const file = grouped.get(name);
    if (file) return file;
  }
  return files[0];
}

async function runFollowLogs(projectRoot, { tail, source, logDir, files }) {
  const usePm2Stream = source === 'process' && isPm2AppOnline(projectRoot, PM2_API_APP);
  if (usePm2Stream) {
    const bin = resolvePm2Bin(projectRoot);
    if (!bin) {
      console.error(`  ${brand.warn(t('doctor.logs.pm2Unavailable'))}`);
      return 1;
    }
    const { spawn } = require('child_process');
    await new Promise((resolve) => {
      const child = spawn(bin, ['logs', PM2_API_APP, '--lines', String(tail)], {
        stdio: 'inherit',
      });
      child.on('exit', (code) => resolve(code ?? 0));
    });
    return 0;
  }

  const primary = pickPrimaryLogFile(files, source);
  if (!primary) {
    console.log(`  ${brand.warn(t('doctor.logs.empty'))}`);
    console.log('');
    return 1;
  }

  if (process.platform === 'win32') {
    console.log(`  ${brand.dim(t('doctor.logs.followWindows', { path: primary.path }))}`);
    console.log('');
    return 0;
  }

  const { spawn } = require('child_process');
  await new Promise((resolve) => {
    const child = spawn('tail', ['-n', String(tail), '-f', primary.path], {
      stdio: 'inherit',
    });
    child.on('exit', (code) => resolve(code ?? 0));
  });
  return 0;
}

async function runDoctorLogs(projectRoot, options = {}) {
  const tail = Math.max(1, Math.min(parseInt(String(options.tail ?? '50'), 10) || 50, 5000));
  const source = resolveLogSource(projectRoot, options.source);
  const logDir = getProjectServerLogDir(projectRoot);
  const files = listLogFiles(logDir, source, projectRoot);
  const w = 56;

  console.log('');
  console.log(
    `  ${gradientText(t('logs.title'), [palette.primary, palette.accent], { bold: true })}  ${brand.dim(t('logs.subtitle'))}`
  );
  console.log(`  ${brand.dim(t('doctor.project', { path: projectRoot }))}`);
  console.log(`  ${brand.dim(t('doctor.logs.dir', { path: logDir }))}`);
  printProcessHint(projectRoot);
  console.log(`  ${divider(w)}`);

  if (options.follow) {
    return runFollowLogs(projectRoot, { tail, source, logDir, files });
  }

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

  const displayOrder =
    source === 'all'
      ? [...PROCESS_LOG_SOURCES, ...LOG_SOURCES]
      : source === 'process'
        ? PROCESS_LOG_SOURCES
        : [source];

  let printed = 0;
  for (const name of displayOrder) {
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
      const isError =
        /\[ERROR\]/i.test(line) || name === 'error' || name === 'pm2-error';
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
  PROCESS_LOG_SOURCES,
  getProjectServerLogDir,
  collectLogDirCandidates,
  measureLogDir,
  resolveActiveServerLogDir,
  resolveLogSource,
  listLogFiles,
  readTailLines,
  filterLines,
  runDoctorLogs,
};
