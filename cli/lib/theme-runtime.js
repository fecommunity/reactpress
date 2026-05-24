const fs = require('fs');
const path = require('path');

const DEFAULT_ACTIVE_THEME = 'twentytwentyfive';
const MANIFEST_REL = path.join('.reactpress', 'active-theme.json');
const { DEV_PORTS, BLOCKED_THEME_DEV_PORTS } = require('./ports');

const PREVIEW_MANIFEST_REL = path.join('.reactpress', 'preview-theme.json');
const DEFAULT_PREVIEW_THEME_PORT = DEV_PORTS.THEME_PREVIEW;
const THEME_ID_RE = /^[a-z0-9][a-z0-9-]*$/i;
const THEMES_STARTER_SUBDIR = 'starter';
const THEMES_LEGACY_STARTER_SUBDIRS = ['bundled', 'core'];
const BLOCKED_DEV_PORTS = BLOCKED_THEME_DEV_PORTS;

function isValidThemeId(id) {
  return typeof id === 'string' && THEME_ID_RE.test(id) && id.length <= 64;
}

function themeRoots(projectRoot) {
  const root = path.resolve(projectRoot);
  const themes = path.join(root, 'themes');
  return {
    themes,
    starter: path.join(themes, THEMES_STARTER_SUBDIR),
    legacyStarter: THEMES_LEGACY_STARTER_SUBDIRS.map((name) => path.join(themes, name)),
    legacyBundled: path.join(root, 'templates'),
  };
}

function isThemePackageDir(projectRoot, dir) {
  if (!dir) return false;
  const resolved = path.resolve(dir);
  const { themes, starter, legacyStarter, legacyBundled } = themeRoots(projectRoot);
  for (const base of [themes, starter, ...legacyStarter, legacyBundled]) {
    if (!fs.existsSync(base)) continue;
    const rel = path.relative(base, resolved);
    if (rel === '' || (rel && !rel.startsWith('..') && !path.isAbsolute(rel))) {
      return (
        fs.existsSync(path.join(resolved, 'package.json')) ||
        fs.existsSync(path.join(resolved, 'theme.json'))
      );
    }
  }
  return false;
}

function isAllowedThemePort(port) {
  const n = Number(port);
  return Number.isInteger(n) && n >= 1024 && n <= 65535 && !BLOCKED_DEV_PORTS.has(n);
}

function isAllowedThemeDirRel(themeDir) {
  if (typeof themeDir !== 'string') return false;
  const allowedPrefixes = [
    'themes/',
    `themes/${THEMES_STARTER_SUBDIR}/`,
    ...THEMES_LEGACY_STARTER_SUBDIRS.map((name) => `themes/${name}/`),
    'templates/',
  ];
  return allowedPrefixes.some((prefix) => themeDir.startsWith(prefix));
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
    const themeDir = isAllowedThemeDirRel(raw.themeDir) ? raw.themeDir : undefined;
    return { activeTheme: id, themeDir, updatedAt: raw.updatedAt };
  } catch {
    return { activeTheme: DEFAULT_ACTIVE_THEME };
  }
}

function resolveThemeDirectory(projectRoot, themeId) {
  if (!isValidThemeId(themeId)) return null;

  const installed = path.join(projectRoot, 'themes', themeId);
  if (isThemePackageDir(projectRoot, installed)) return installed;

  const starter = path.join(projectRoot, 'themes', THEMES_STARTER_SUBDIR, themeId);
  if (isThemePackageDir(projectRoot, starter)) return starter;

  for (const legacyStarterName of THEMES_LEGACY_STARTER_SUBDIRS) {
    const legacyStarter = path.join(projectRoot, 'themes', legacyStarterName, themeId);
    if (isThemePackageDir(projectRoot, legacyStarter)) return legacyStarter;
  }

  const legacyBundled = path.join(projectRoot, 'templates', themeId);
  if (isThemePackageDir(projectRoot, legacyBundled)) return legacyBundled;

  return null;
}

function readManifestSignatureFromPath(projectRoot, manifestRel) {
  const manifestPath = path.join(projectRoot, manifestRel);
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

function readManifestSignature(projectRoot) {
  return readManifestSignatureFromPath(projectRoot, MANIFEST_REL);
}

function readPreviewManifestSignature(projectRoot) {
  return readManifestSignatureFromPath(projectRoot, PREVIEW_MANIFEST_REL);
}

function readPreviewThemeManifest(projectRoot) {
  const manifestPath = path.join(projectRoot, PREVIEW_MANIFEST_REL);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const id =
      typeof raw.activeTheme === 'string' && isValidThemeId(raw.activeTheme)
        ? raw.activeTheme
        : null;
    if (!id) return null;
    const themeDir = resolveThemeDirectory(projectRoot, id);
    return { activeTheme: id, themeDir: themeDir ? path.relative(projectRoot, themeDir) : null };
  } catch {
    return null;
  }
}

function getPreviewThemePort() {
  const fromEnv = parseInt(process.env.REACTPRESS_PREVIEW_PORT || '', 10);
  if (Number.isInteger(fromEnv) && isAllowedThemePort(fromEnv)) {
    return String(fromEnv);
  }
  return String(DEFAULT_PREVIEW_THEME_PORT);
}

function hasThemePackages(projectRoot) {
  const { starter, legacyStarter, legacyBundled } = themeRoots(projectRoot);
  for (const dir of [starter, ...legacyStarter, legacyBundled]) {
    if (!fs.existsSync(dir)) continue;
    if (fs.readdirSync(dir, { withFileTypes: true }).some((d) => d.isDirectory())) {
      return true;
    }
  }
  return false;
}

module.exports = {
  MANIFEST_REL,
  PREVIEW_MANIFEST_REL,
  DEFAULT_PREVIEW_THEME_PORT,
  THEME_ID_RE,
  THEMES_STARTER_SUBDIR,
  THEMES_LEGACY_STARTER_SUBDIRS,
  BLOCKED_DEV_PORTS,
  isValidThemeId,
  isThemePackageDir,
  isAllowedThemePort,
  isAllowedThemeDirRel,
  readActiveThemeManifest,
  resolveThemeDirectory,
  readManifestSignature,
  readPreviewManifestSignature,
  readPreviewThemeManifest,
  getPreviewThemePort,
  hasThemePackages,
  themeRoots,
};
