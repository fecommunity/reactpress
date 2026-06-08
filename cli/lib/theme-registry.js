const fs = require('fs');
const path = require('path');

const { getCliPackageRoot } = require('./paths');
const {
  THEMES_PACKAGE_REL,
  CLI_CATALOG_TEMPLATE_REL,
  themesRoot,
} = require('./theme-paths');

/** Official npm spec for the theme-starter package. */
const OFFICIAL_THEME_STARTER_SPEC = '@fecommunity/reactpress-theme-starter@1.0.0-beta.0';
const OFFICIAL_THEME_STARTER_ID = 'reactpress-theme-starter';
/** Catalog anchor directory under themes/ (metadata in package.json). */
const OFFICIAL_THEME_STARTER_DIR = 'theme-starter';

function isValidCatalogEntry(entry) {
  return (
    entry &&
    typeof entry.id === 'string' &&
    typeof entry.name === 'string' &&
    typeof entry.npm === 'string'
  );
}

function normalizeCatalogEntry(entry) {
  if (!isValidCatalogEntry(entry)) return null;
  return {
    id: entry.id.trim(),
    name: entry.name,
    version: typeof entry.version === 'string' ? entry.version : '0.0.0',
    description: entry.description,
    author: entry.author,
    authorUri: entry.authorUri,
    themeUri: entry.themeUri,
    tags: Array.isArray(entry.tags) ? entry.tags : undefined,
    npm: entry.npm.trim(),
    featured: entry.featured === true,
    requires: entry.requires,
    dir: typeof entry.dir === 'string' ? entry.dir.trim() : undefined,
  };
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readThemesPackageMeta(projectRoot) {
  const pkgPath = path.join(path.resolve(projectRoot), THEMES_PACKAGE_REL);
  if (!fs.existsSync(pkgPath)) {
    return { bundled: [], catalog: [] };
  }

  const raw = readJsonFile(pkgPath);
  if (!raw) return { bundled: [], catalog: [] };

  const reactpress = raw.reactpress && typeof raw.reactpress === 'object' ? raw.reactpress : {};
  const bundled = Array.isArray(reactpress.bundled)
    ? reactpress.bundled.filter((id) => typeof id === 'string' && id.trim())
    : [];
  const catalog = Array.isArray(reactpress.catalog)
    ? reactpress.catalog.filter((dir) => typeof dir === 'string' && dir.trim())
    : [];

  return { bundled, catalog };
}

/** Read catalog metadata from themes/{dir}/package.json → reactpress.theme. */
function readPackageCatalogEntry(catalogDir, pkgPath) {
  const raw = readJsonFile(pkgPath);
  if (!raw) return null;

  const theme =
    raw.reactpress && typeof raw.reactpress === 'object' && raw.reactpress.theme
      ? raw.reactpress.theme
      : null;
  if (!theme || typeof theme.id !== 'string') return null;

  const pkgName = typeof raw.name === 'string' ? raw.name : undefined;
  const pkgVersion = typeof raw.version === 'string' ? raw.version : '0.0.0';
  const npmSpec =
    typeof theme.npm === 'string' && theme.npm.trim()
      ? theme.npm.trim()
      : pkgName
        ? `${pkgName}@${pkgVersion}`
        : undefined;
  if (!npmSpec) return null;

  return normalizeCatalogEntry({
    id: theme.id,
    dir: catalogDir,
    name:
      typeof theme.name === 'string' && theme.name.trim()
        ? theme.name
        : typeof raw.description === 'string'
          ? raw.description
          : theme.id,
    version: typeof theme.version === 'string' ? theme.version : pkgVersion,
    description:
      typeof theme.description === 'string'
        ? theme.description
        : typeof raw.description === 'string'
          ? raw.description
          : undefined,
    author: typeof theme.author === 'string' ? theme.author : raw.author,
    authorUri: typeof theme.authorUri === 'string' ? theme.authorUri : undefined,
    themeUri:
      typeof theme.themeUri === 'string'
        ? theme.themeUri
        : typeof raw.homepage === 'string'
          ? raw.homepage
          : undefined,
    tags: Array.isArray(theme.tags) ? theme.tags : undefined,
    npm: npmSpec,
    featured: theme.featured === true,
    requires: typeof theme.requires === 'string' ? theme.requires : undefined,
  });
}

function readCatalogFromThemeDirs(projectRoot) {
  const root = path.resolve(projectRoot);
  const { catalog } = readThemesPackageMeta(root);
  const themes = [];
  const templates = themesRoot(root);

  for (const dir of catalog) {
    const pkgPath = path.join(templates, dir, 'package.json');
    const entry = readPackageCatalogEntry(dir, pkgPath);
    if (entry) themes.push(entry);
  }

  if (themes.length) {
    return {
      version: 1,
      themes,
      source: THEMES_PACKAGE_REL,
    };
  }
  return null;
}

function readLegacyCatalogFile(projectRoot, filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = readJsonFile(filePath);
  if (!raw) return null;
  const themes = (Array.isArray(raw.themes) ? raw.themes : [])
    .map(normalizeCatalogEntry)
    .filter(Boolean);
  if (!themes.length) return null;
  return {
    version: typeof raw.version === 'number' ? raw.version : 1,
    themes,
    source: path.relative(path.resolve(projectRoot), filePath) || filePath,
  };
}

/** Aggregate catalog from themes/{dir}/package.json, then CLI template fallback. */
function readThemeCatalog(projectRoot) {
  const fromDirs = readCatalogFromThemeDirs(projectRoot);
  if (fromDirs) return fromDirs;

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

/** Map catalog metadata to a minimal ThemeManifest-shaped object. */
function catalogEntryToManifest(entry) {
  if (!entry) return null;
  return {
    id: entry.id,
    name: entry.name,
    version: entry.version,
    description: entry.description,
    author: entry.author,
    themeUri: entry.themeUri,
    tags: entry.tags,
    requires: entry.requires,
  };
}

/** Verify bundled ids from themes/package.json exist with theme.json on disk. */
function validateBundledThemes(projectRoot) {
  const root = path.resolve(projectRoot);
  const { bundled } = readThemesPackageMeta(root);
  const missing = [];
  const templates = themesRoot(root);

  for (const id of bundled) {
    const themeJson = path.join(templates, id, 'theme.json');
    if (!fs.existsSync(themeJson)) {
      missing.push(id);
    }
  }
  return { bundled, missing };
}

/** Verify catalog dirs have package.json with reactpress.theme metadata. */
function validateCatalogThemes(projectRoot) {
  const root = path.resolve(projectRoot);
  const { catalog } = readThemesPackageMeta(root);
  const missing = [];
  const templates = themesRoot(root);

  for (const dir of catalog) {
    const pkgPath = path.join(templates, dir, 'package.json');
    const entry = readPackageCatalogEntry(dir, pkgPath);
    if (!entry) {
      missing.push(`${dir}/package.json (reactpress.theme)`);
    }
  }
  return { catalog, missing };
}

/** Build aggregated catalog JSON for CLI template sync. */
function buildAggregatedCatalog(projectRoot) {
  const { themes } = readCatalogFromThemeDirs(projectRoot) ?? { themes: [] };
  return {
    version: 1,
    themes: themes.map(({ dir, ...entry }) => entry),
  };
}

module.exports = {
  OFFICIAL_THEME_STARTER_SPEC,
  OFFICIAL_THEME_STARTER_ID,
  OFFICIAL_THEME_STARTER_DIR,
  isValidCatalogEntry,
  normalizeCatalogEntry,
  readThemesPackageMeta,
  readPackageCatalogEntry,
  readThemeCatalog,
  findCatalogTheme,
  resolveCatalogInstallSpec,
  catalogEntryToManifest,
  validateBundledThemes,
  validateCatalogThemes,
  buildAggregatedCatalog,
};
