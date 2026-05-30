const fs = require('fs');
const path = require('path');

const DEFAULT_ACTIVE_THEME = 'twentytwentyfive';
const MANIFEST_REL = path.join('.reactpress', 'active-theme.json');
const { DEV_PORTS, BLOCKED_THEME_DEV_PORTS } = require('./ports');

const PREVIEW_MANIFEST_REL = path.join('.reactpress', 'preview-theme.json');
const DEFAULT_PREVIEW_THEME_PORT = DEV_PORTS.THEME_PREVIEW;
const THEME_ID_RE = /^[a-z0-9][a-z0-9-]*$/i;
const THEMES_RUNTIME_SUBDIR = 'runtime';
/** Reserved under `themes/` — not theme template packages */
const THEMES_RESERVED_SUBDIRS = [THEMES_RUNTIME_SUBDIR, 'starter', 'bundled', 'core'];
const THEMES_LEGACY_STARTER_SUBDIRS = ['starter', 'bundled', 'core'];
const BLOCKED_DEV_PORTS = BLOCKED_THEME_DEV_PORTS;

function isValidThemeId(id) {
  return typeof id === 'string' && THEME_ID_RE.test(id) && id.length <= 64;
}

function isUnderDir(child, parent) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function themeRoots(projectRoot) {
  const root = path.resolve(projectRoot);
  const themes = path.join(root, 'themes');
  return {
    themes,
    runtime: path.join(themes, THEMES_RUNTIME_SUBDIR),
    legacyStarter: THEMES_LEGACY_STARTER_SUBDIRS.map((name) => path.join(themes, name)),
    legacyBundled: path.join(root, 'templates'),
  };
}

function isThemePackageAt(dir) {
  return (
    fs.existsSync(path.join(dir, 'package.json')) ||
    fs.existsSync(path.join(dir, 'theme.json'))
  );
}

function isThemePackageDir(projectRoot, dir) {
  if (!dir) return false;
  const resolved = path.resolve(dir);
  const { themes, runtime, legacyStarter, legacyBundled } = themeRoots(projectRoot);

  if (isUnderDir(resolved, runtime) && isThemePackageAt(resolved)) {
    return true;
  }

  if (isUnderDir(resolved, themes) && !isUnderDir(resolved, runtime)) {
    const rel = path.relative(themes, resolved);
    const top = rel.split(path.sep)[0];
    if (top && !THEMES_RESERVED_SUBDIRS.includes(top) && isThemePackageAt(resolved)) {
      return true;
    }
  }

  for (const base of [...legacyStarter, legacyBundled]) {
    if (!fs.existsSync(base)) continue;
    if (isUnderDir(resolved, base) && isThemePackageAt(resolved)) {
      return true;
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
  if (themeDir.includes('..') || path.isAbsolute(themeDir)) return false;

  if (themeDir.startsWith(`themes/${THEMES_RUNTIME_SUBDIR}/`)) {
    return true;
  }

  if (themeDir.startsWith('themes/') && !themeDir.startsWith(`themes/${THEMES_RUNTIME_SUBDIR}/`)) {
    const rest = themeDir.slice('themes/'.length);
    const top = rest.split('/')[0];
    if (top && !THEMES_RESERVED_SUBDIRS.includes(top)) {
      return true;
    }
  }

  const legacyPrefixes = THEMES_LEGACY_STARTER_SUBDIRS.map((name) => `themes/${name}/`);
  if (legacyPrefixes.some((prefix) => themeDir.startsWith(prefix))) {
    return true;
  }

  return themeDir.startsWith('templates/');
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

  const runtime = path.join(projectRoot, 'themes', THEMES_RUNTIME_SUBDIR, themeId);
  if (isThemePackageAt(runtime)) return runtime;

  const template = path.join(projectRoot, 'themes', themeId);
  if (isThemePackageAt(template) && !THEMES_RESERVED_SUBDIRS.includes(themeId)) {
    return template;
  }

  for (const legacyStarterName of THEMES_LEGACY_STARTER_SUBDIRS) {
    const legacyStarter = path.join(projectRoot, 'themes', legacyStarterName, themeId);
    if (isThemePackageAt(legacyStarter)) return legacyStarter;
  }

  const legacyBundled = path.join(projectRoot, 'templates', themeId);
  if (isThemePackageAt(legacyBundled)) return legacyBundled;

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
  const { themes, runtime, legacyStarter, legacyBundled } = themeRoots(projectRoot);

  if (fs.existsSync(runtime)) {
    if (fs.readdirSync(runtime, { withFileTypes: true }).some((d) => d.isDirectory())) {
      return true;
    }
  }

  if (fs.existsSync(themes)) {
    if (
      fs
        .readdirSync(themes, { withFileTypes: true })
        .some((d) => d.isDirectory() && !THEMES_RESERVED_SUBDIRS.includes(d.name))
    ) {
      return true;
    }
  }

  for (const dir of [...legacyStarter, legacyBundled]) {
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
  THEMES_RUNTIME_SUBDIR,
  THEMES_RESERVED_SUBDIRS,
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
