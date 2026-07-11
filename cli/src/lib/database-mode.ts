// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { ensureOriginalCwd } = require('./root');

function isDesktopLocalMode() {
  return process.env.REACTPRESS_DESKTOP_LOCAL === '1';
}

function readSqliteModeFromProject(projectRoot) {
  try {
    const configPath = path.join(projectRoot, '.reactpress/config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.database?.mode === 'embedded-sqlite') return true;
    }
  } catch {
    // ignore
  }
  try {
    const envPath = path.join(projectRoot, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      if (/^DB_TYPE=sqlite/m.test(content)) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

function isLocalSqliteMode(projectRoot = ensureOriginalCwd()) {
  if (process.env.REACTPRESS_LOCAL_MODE === '1' || isDesktopLocalMode()) return true;
  return readSqliteModeFromProject(projectRoot);
}

module.exports = {
  isDesktopLocalMode,
  isLocalSqliteMode,
  readSqliteModeFromProject,
};
