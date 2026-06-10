const fs = require('fs');
const path = require('path');

const { getCliPackageRoot } = require('./paths');
const {
  THEMES_PACKAGE_REL,
  themesRoot,
} = require('./theme-paths');
const {
  readThemesRegistryMeta,
  readThemesPackageMeta,
  readNpmThemeSources,
  readThemeSources,
  readNpmEntryFromPackageDir,
  normalizeNpmCatalogEntry,
  isValidNpmCatalogEntry,
  validateLocalThemes,
  validateNpmThemes,
  validateBundledThemes,
  validateCatalogThemes,
} = require('./theme-sources');

/** Official npm spec for the theme-starter package. */
const OFFICIAL_THEME_STARTER_SPEC = '@fecommunity/reactpress-theme-starter@1.0.0-beta.0';
const OFFICIAL_THEME_STARTER_ID = 'reactpress-theme-starter';
/** Catalog anchor directory under themes/ (metadata in package.json). */
const OFFICIAL_THEME_STARTER_DIR = 'theme-starter';

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readLegacyCatalogFile(projectRoot, filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = readJsonFile(filePath);
  if (!raw) return null;
  const themes = (Array.isArray(raw.themes) ? raw.themes : [])
    .map(normalizeNpmCatalogEntry)
    .filter(Boolean);
  if (!themes.length) return null;
  return {
    version: typeof raw.version === 'number' ? raw.version : 1,
    themes,
    source: path.relative(path.resolve(projectRoot), filePath) || filePath,
  };
}

function readCatalogFromRegistry(projectRoot) {
  const npmSources = readNpmThemeSources(projectRoot);
  if (npmSources.length) {
    return {
      version: 1,
      themes: npmSources.map(({ kind, ...entry }) => entry),
      source: THEMES_PACKAGE_REL,
    };
  }
  return null;
}

/** Aggregate npm catalog from themes/package.json, then CLI template fallback. */
function readThemeCatalog(projectRoot) {
  const fromRegistry = readCatalogFromRegistry(projectRoot);
  if (fromRegistry) return fromRegistry;

  const legacyCatalog = path.join(themesRoot(projectRoot), 'catalog.json');
  const legacy = readLegacyCatalogFile(projectRoot, legacyCatalog);
  if (legacy) return legacy;

  const templatePath = path.join(getCliPackageRoot(), 'templates', 'theme-catalog.json');
  const fromTemplate = readLegacyCatalogFile(projectRoot, templatePath);
  if (fromTemplate) return fromTemplate;

  return { version: 1, themes: [], source: null };
}

function findCatalogTheme(projectRoot, idOrSpec) {
  const needle = String(idOrSpec || '').trim();
  if (!needle) return null;
  const { themes } = readThemeCatalog(projectRoot);
  return (
    themes.find((entry) => entry.id === needle || entry.npm === needle) ??
    themes.find((entry) => entry.npm.startsWith(needle) || needle.startsWith(entry.id)) ??
    null
  );
}

function resolveCatalogInstallSpec(projectRoot, input) {
  const trimmed = String(input || '').trim();
  if (!trimmed) return null;
  if (trimmed === 'reactpress-theme-starter' || trimmed === OFFICIAL_THEME_STARTER_ID) {
    const fromCatalog = findCatalogTheme(projectRoot, OFFICIAL_THEME_STARTER_ID);
    if (fromCatalog?.npm) return fromCatalog.npm;
    return OFFICIAL_THEME_STARTER_SPEC;
  }
  const fromCatalog = findCatalogTheme(projectRoot, trimmed);
  if (fromCatalog?.npm) return fromCatalog.npm;
  return trimmed;
}

/** Map npm catalog metadata to a minimal ThemeManifest-shaped object. */
function catalogEntryToManifest(entry) {
  if (!entry) return null;
  return {
    id: entry.id,
    name: entry.name,
    version: entry.version,
    description: entry.description,
    author: entry.author,
    themeUri: entry.themeUri,
    previewUrl: entry.previewUrl,
    cover: entry.cover,
    tags: entry.tags,
    requires: entry.requires,
  };
}

/** Build aggregated catalog JSON for CLI template sync. */
function buildAggregatedCatalog(projectRoot) {
  const { themes } = readCatalogFromRegistry(projectRoot) ?? { themes: [] };
  return {
    version: 1,
    themes: themes.map(({ dir, ...entry }) => entry),
  };
}

module.exports = {
  OFFICIAL_THEME_STARTER_SPEC,
  OFFICIAL_THEME_STARTER_ID,
  OFFICIAL_THEME_STARTER_DIR,
  isValidNpmCatalogEntry,
  isValidCatalogEntry: isValidNpmCatalogEntry,
  normalizeCatalogEntry: normalizeNpmCatalogEntry,
  readThemesRegistryMeta,
  readThemesPackageMeta,
  readPackageCatalogEntry: readNpmEntryFromPackageDir,
  readThemeSources,
  readThemeCatalog,
  findCatalogTheme,
  resolveCatalogInstallSpec,
  catalogEntryToManifest,
  validateLocalThemes,
  validateNpmThemes,
  validateBundledThemes,
  validateCatalogThemes,
  buildAggregatedCatalog,
};
