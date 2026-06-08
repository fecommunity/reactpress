const fs = require('fs');
const path = require('path');

const { DEV_PORTS, BLOCKED_THEME_DEV_PORTS } = require('./ports');
const {
  REACTPRESS_DIR,
  THEME_RUNTIME_REL,
  LEGACY_THEMES_RUNTIME_REL,
  ACTIVE_THEME_MANIFEST_REL,
  PREVIEW_THEME_MANIFEST_REL,
  THEMES_RESERVED_SUBDIRS,
  THEMES_LEGACY_STARTER_SUBDIRS,
  THEME_ID_RE,
  DEFAULT_ACTIVE_THEME,
} = require('./theme-paths');

const MANIFEST_REL = ACTIVE_THEME_MANIFEST_REL;
const PREVIEW_MANIFEST_REL = PREVIEW_THEME_MANIFEST_REL;
const DEFAULT_PREVIEW_THEME_PORT = DEV_PORTS.THEME_PREVIEW;
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
    runtime: path.join(root, THEME_RUNTIME_REL),
    legacyThemesRuntime: path.join(root, LEGACY_THEMES_RUNTIME_REL),
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
  const { themes, runtime, legacyThemesRuntime, legacyStarter, legacyBundled } =
    themeRoots(projectRoot);

  if (isUnderDir(resolved, runtime) && isThemePackageAt(resolved)) {
    return true;
  }

  if (isUnderDir(resolved, legacyThemesRuntime) && isThemePackageAt(resolved)) {
    return true;
  }

  if (isUnderDir(resolved, themes)) {
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

  if (themeDir.startsWith(`${THEME_RUNTIME_REL}/`)) {
    return true;
  }

  if (themeDir.startsWith(`${LEGACY_THEMES_RUNTIME_REL}/`)) {
    return true;
  }

  if (themeDir.startsWith('themes/') && !themeDir.startsWith(`${LEGACY_THEMES_RUNTIME_REL}/`)) {
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

  const runtime = path.join(projectRoot, THEME_RUNTIME_REL, themeId);
  if (isThemePackageAt(runtime)) return runtime;

  const legacyRuntime = path.join(projectRoot, LEGACY_THEMES_RUNTIME_REL, themeId);
  if (isThemePackageAt(legacyRuntime)) return legacyRuntime;

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
  const manifestPath = path.join(projectRoot, PREVIEW_MANIFEST_REL);
  try {
    if (!fs.existsSync(manifestPath)) return '';
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const id = typeof raw.activeTheme === 'string' ? raw.activeTheme : '';
    if (!isValidThemeId(id)) return '';
    const themeDir = resolveThemeDirectory(projectRoot, id);
    if (!themeDir) return '';
    const rel = path.relative(projectRoot, themeDir);
    const stamp = typeof raw.updatedAt === 'string' ? raw.updatedAt : '';
    return `${id}:${rel}:${stamp}`;
  } catch {
    return '';
  }
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

function hasResolvableActiveTheme(projectRoot) {
  if (!hasThemePackages(projectRoot)) return false;
  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
  return Boolean(themeDir && isThemePackageDir(projectRoot, themeDir));
}

/** Installed / bundled theme ids (active-theme.json entries may point into runtime/). */
function listAvailableThemeIds(projectRoot) {
  const ids = new Set();
  const { themes, runtime, legacyThemesRuntime, legacyStarter, legacyBundled } =
    themeRoots(projectRoot);

  for (const dir of [runtime, legacyThemesRuntime]) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || !isValidThemeId(entry.name)) continue;
      if (isThemePackageAt(path.join(dir, entry.name))) ids.add(entry.name);
    }
  }

  if (fs.existsSync(themes)) {
    for (const entry of fs.readdirSync(themes, { withFileTypes: true })) {
      if (!entry.isDirectory() || THEMES_RESERVED_SUBDIRS.includes(entry.name)) continue;
      if (!isValidThemeId(entry.name)) continue;
      if (isThemePackageAt(path.join(themes, entry.name))) ids.add(entry.name);
    }
  }

  for (const base of [...legacyStarter, legacyBundled]) {
    if (!fs.existsSync(base)) continue;
    for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
      if (!entry.isDirectory() || !isValidThemeId(entry.name)) continue;
      if (isThemePackageAt(path.join(base, entry.name))) ids.add(entry.name);
    }
  }

  return [...ids].sort();
}

function hasThemePackages(projectRoot) {
  const { themes, runtime, legacyThemesRuntime, legacyStarter, legacyBundled } =
    themeRoots(projectRoot);

  for (const dir of [runtime, legacyThemesRuntime]) {
    if (!fs.existsSync(dir)) continue;
    if (fs.readdirSync(dir, { withFileTypes: true }).some((d) => d.isDirectory())) {
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
  THEME_RUNTIME_REL,
  LEGACY_THEMES_RUNTIME_REL,
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
  hasResolvableActiveTheme,
  listAvailableThemeIds,
  themeRoots,
};
