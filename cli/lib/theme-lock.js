const fs = require('fs');
const path = require('path');

const LOCK_REL = path.join('.reactpress', 'themes.lock.json');
const LOCK_VERSION = 1;

function lockPath(projectRoot) {
  return path.join(path.resolve(projectRoot), LOCK_REL);
}

function readThemeLock(projectRoot) {
  const file = lockPath(projectRoot);
  if (!fs.existsSync(file)) {
    return { version: LOCK_VERSION, themes: {} };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!raw || typeof raw !== 'object') {
      return { version: LOCK_VERSION, themes: {} };
    }
    return {
      version: typeof raw.version === 'number' ? raw.version : LOCK_VERSION,
      themes: raw.themes && typeof raw.themes === 'object' ? raw.themes : {},
    };
  } catch {
    return { version: LOCK_VERSION, themes: {} };
  }
}

function writeThemeLock(projectRoot, lock) {
  const file = lockPath(projectRoot);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
}

function upsertNpmThemeLock(projectRoot, themeId, entry) {
  const lock = readThemeLock(projectRoot);
  lock.themes[themeId] = {
    source: 'npm',
    spec: entry.spec,
    resolvedVersion: entry.resolvedVersion,
    packageName: entry.packageName,
    installedAt: entry.installedAt || new Date().toISOString(),
  };
  writeThemeLock(projectRoot, lock);
  return lock.themes[themeId];
}

function getNpmThemeLockEntry(projectRoot, themeId) {
  const lock = readThemeLock(projectRoot);
  const entry = lock.themes[themeId];
  if (!entry || entry.source !== 'npm') return null;
  return entry;
}

function removeThemeLockEntry(projectRoot, themeId) {
  const lock = readThemeLock(projectRoot);
  if (!lock.themes[themeId]) return false;
  delete lock.themes[themeId];
  writeThemeLock(projectRoot, lock);
  return true;
}

module.exports = {
  LOCK_REL,
  readThemeLock,
  writeThemeLock,
  upsertNpmThemeLock,
  getNpmThemeLockEntry,
  removeThemeLockEntry,
};
