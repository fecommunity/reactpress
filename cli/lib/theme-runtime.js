const fs = require('fs');
const path = require('path');

const DEFAULT_ACTIVE_THEME = 'twentytwentyfive';
const MANIFEST_REL = path.join('.reactpress', 'active-theme.json');
const THEME_ID_RE = /^[a-z0-9][a-z0-9-]*$/i;
const BLOCKED_DEV_PORTS = new Set([
  22, 80, 443, 3000, 3002, 3003, 5173, 5432, 6379, 8080, 8443, 3306, 3307,
]);

function isValidThemeId(id) {
  return typeof id === 'string' && THEME_ID_RE.test(id) && id.length <= 64;
}

function themeRoots(projectRoot) {
  const root = path.resolve(projectRoot);
  return {
    themes: path.join(root, 'themes'),
    templates: path.join(root, 'templates'),
  };
}

function isThemePackageDir(projectRoot, dir) {
  if (!dir) return false;
  const resolved = path.resolve(dir);
  const { themes, templates } = themeRoots(projectRoot);
  for (const base of [themes, templates]) {
    const rel = path.relative(base, resolved);
    if (rel === '' || (rel && !rel.startsWith('..') && !path.isAbsolute(rel))) {
      return fs.existsSync(path.join(resolved, 'package.json')) || fs.existsSync(path.join(resolved, 'theme.json'));
    }
  }
  return false;
}

function isAllowedThemePort(port) {
  const n = Number(port);
  return Number.isInteger(n) && n >= 1024 && n <= 65535 && !BLOCKED_DEV_PORTS.has(n);
}

function readActiveThemeManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, MANIFEST_REL);
  if (!fs.existsSync(manifestPath)) {
    return { activeTheme: DEFAULT_ACTIVE_THEME };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const id =
      typeof raw.activeTheme === 'string' && isValidThemeId(raw.activeTheme)
        ? raw.activeTheme
        : DEFAULT_ACTIVE_THEME;
    const themeDir =
      typeof raw.themeDir === 'string' && raw.themeDir.startsWith('themes/')
        ? raw.themeDir
        : typeof raw.themeDir === 'string' && raw.themeDir.startsWith('templates/')
          ? raw.themeDir
          : undefined;
    return { activeTheme: id, themeDir, updatedAt: raw.updatedAt };
  } catch {
    return { activeTheme: DEFAULT_ACTIVE_THEME };
  }
}

function resolveThemeDirectory(projectRoot, themeId) {
  if (!isValidThemeId(themeId)) return null;

  const installed = path.join(projectRoot, 'themes', themeId);
  if (isThemePackageDir(projectRoot, installed)) return installed;

  const bundled = path.join(projectRoot, 'templates', themeId);
  if (isThemePackageDir(projectRoot, bundled)) return bundled;

  return null;
}

function readManifestSignature(projectRoot) {
  const manifestPath = path.join(projectRoot, '.reactpress', 'active-theme.json');
  try {
    if (!fs.existsSync(manifestPath)) return '';
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const id = typeof raw.activeTheme === 'string' ? raw.activeTheme : '';
    if (!isValidThemeId(id)) return '';
    const themeDir = resolveThemeDirectory(projectRoot, id);
    if (!themeDir) return '';
    const rel = path.relative(projectRoot, themeDir);
    return `${id}:${rel}`;
  } catch {
    return '';
  }
}

function hasThemePackages(projectRoot) {
  const templates = path.join(projectRoot, 'templates');
  if (!fs.existsSync(templates)) return false;
  return fs.readdirSync(templates, { withFileTypes: true }).some((d) => d.isDirectory());
}

module.exports = {
  MANIFEST_REL,
  THEME_ID_RE,
  BLOCKED_DEV_PORTS,
  isValidThemeId,
  isThemePackageDir,
  isAllowedThemePort,
  readActiveThemeManifest,
  resolveThemeDirectory,
  readManifestSignature,
  hasThemePackages,
  themeRoots,
};
