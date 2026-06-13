/**
 * ReactPress theme sources — unified model.
 *
 * TWO SOURCES (how a theme is installed into `.reactpress/runtime/{id}/`):
 *   local — copy from `themes/{id}/` (must contain `theme.json`)
 *   npm   — `npm pack` a package spec, then copy into runtime
 *
 * NPM REGISTRY SPEC (canonical):
 *   themes/{anchor}/package.json  →  dependencies + reactpress.theme  (see npm-catalog.schema.json)
 *   themes/package.json           →  reactpress.npm: ["{anchor}", …]
 *
 * THREE LAYERS:
 *   themes/              registry — what is available to install
 *   .reactpress/runtime/ materialized — installed copies the CLI runs
 *   DB + *.json          activation — which theme is active / previewing
 *
 * Legacy: reactpress.bundled / catalog keys; inline objects in reactpress.npm array.
 */
const fs = require('fs');
const path = require('path');

const { THEMES_PACKAGE_REL, themesRoot } = require('./theme-paths');

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatNpmInstallSpec(name, version) {
  return `${name.trim()}@${version.trim()}`;
}

/** Split `package@version` into structured dependency (supports scoped packages). */
function parseNpmSpecToDependency(spec) {
  const trimmed = String(spec || '').trim();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex <= 0) return null;
  const name = trimmed.slice(0, atIndex).trim();
  const version = trimmed.slice(atIndex + 1).trim();
  if (!name || !version) return null;
  return { name, version };
}

function readPackageDependencies(raw) {
  const deps = raw?.dependencies;
  if (!deps || typeof deps !== 'object') return null;
  for (const [name, version] of Object.entries(deps)) {
    if (isNonEmptyString(name) && isNonEmptyString(version)) {
      return { name: name.trim(), version: String(version).trim() };
    }
  }
  return null;
}

function readThemeDependency(theme, raw) {
  const fromDeps = raw ? readPackageDependencies(raw) : null;
  if (fromDeps) return fromDeps;

  if (theme && typeof theme === 'object') {
    const dep = theme.dependency;
    if (dep && typeof dep === 'object' && isNonEmptyString(dep.name) && isNonEmptyString(dep.version)) {
      return { name: dep.name.trim(), version: dep.version.trim() };
    }
    if (isNonEmptyString(theme.npm)) {
      return parseNpmSpecToDependency(theme.npm);
    }
  }

  const pkgName = typeof raw?.name === 'string' ? raw.name : undefined;
  const pkgVersion = typeof raw?.version === 'string' ? raw.version : undefined;
  if (isNonEmptyString(pkgName) && isNonEmptyString(pkgVersion)) {
    return { name: pkgName.trim(), version: pkgVersion.trim() };
  }

  return null;
}

function resolveThemeNpmSpec(theme, raw) {
  const dependency = readThemeDependency(theme, raw);
  return dependency ? formatNpmInstallSpec(dependency.name, dependency.version) : undefined;
}

function isValidNpmCatalogEntry(entry) {
  return (
    entry &&
    isNonEmptyString(entry.id) &&
    isNonEmptyString(entry.name) &&
    (isNonEmptyString(entry.npm) ||
      (entry.dependency &&
        typeof entry.dependency === 'object' &&
        isNonEmptyString(entry.dependency.name) &&
        isNonEmptyString(entry.dependency.version)))
  );
}

function normalizeNpmCatalogEntry(entry) {
  if (!entry || !isNonEmptyString(entry.id) || !isNonEmptyString(entry.name)) return null;

  let dependency =
    entry.dependency &&
    typeof entry.dependency === 'object' &&
    isNonEmptyString(entry.dependency.name) &&
    isNonEmptyString(entry.dependency.version)
      ? { name: entry.dependency.name.trim(), version: entry.dependency.version.trim() }
      : undefined;

  let npmSpec = isNonEmptyString(entry.npm) ? entry.npm.trim() : undefined;
  if (dependency) {
    npmSpec = formatNpmInstallSpec(dependency.name, dependency.version);
  } else if (npmSpec) {
    dependency = parseNpmSpecToDependency(npmSpec) ?? undefined;
  }

  if (!npmSpec) return null;

  return {
    id: entry.id.trim(),
    name: entry.name,
    version: typeof entry.version === 'string' ? entry.version : '0.0.0',
    description: entry.description,
    author: entry.author,
    authorUri: entry.authorUri,
    themeUri: entry.themeUri,
    previewUrl: entry.previewUrl,
    cover: entry.cover,
    tags: Array.isArray(entry.tags) ? entry.tags : undefined,
    dependency,
    npm: npmSpec,
    featured: entry.featured === true,
    requires: entry.requires,
    dir: typeof entry.dir === 'string' ? entry.dir.trim() : undefined,
  };
}

/** Read `themes/package.json` registry lists (local ids + npm catalog refs). */
function readThemesRegistryMeta(projectRoot) {
  const pkgPath = path.join(path.resolve(projectRoot), THEMES_PACKAGE_REL);
  if (!fs.existsSync(pkgPath)) {
    return { local: [], npm: [] };
  }

  const raw = readJsonFile(pkgPath);
  if (!raw?.reactpress || typeof raw.reactpress !== 'object') {
    return { local: [], npm: [] };
  }

  const reactpress = raw.reactpress;
  const localSource = reactpress.local ?? reactpress.bundled;
  const npmSource = reactpress.npm ?? reactpress.catalog;

  const local = Array.isArray(localSource)
    ? localSource.filter((id) => isNonEmptyString(id)).map((id) => id.trim())
    : [];

  const npm = Array.isArray(npmSource) ? npmSource : [];

  return { local, npm };
}

/** @deprecated Use readThemesRegistryMeta — kept for existing imports. */
function readThemesPackageMeta(projectRoot) {
  const { local, npm } = readThemesRegistryMeta(projectRoot);
  const catalog = npm
    .map((item) => {
      if (isNonEmptyString(item)) return item.trim();
      if (item && typeof item === 'object' && isNonEmptyString(item.id)) return item.id.trim();
      return null;
    })
    .filter(Boolean);
  return { bundled: local, catalog, local, npm };
}

function readNpmEntryFromPackageDir(catalogDir, pkgPath) {
  const raw = readJsonFile(pkgPath);
  if (!raw) return null;

  const theme =
    raw.reactpress && typeof raw.reactpress === 'object' && raw.reactpress.theme
      ? raw.reactpress.theme
      : null;
  if (!theme || !isNonEmptyString(theme.id)) return null;

  const pkgVersion = typeof raw.version === 'string' ? raw.version : '0.0.0';
  const dependency = readThemeDependency(theme, raw);
  const npmSpec = dependency ? formatNpmInstallSpec(dependency.name, dependency.version) : undefined;
  if (!npmSpec) return null;

  return normalizeNpmCatalogEntry({
    id: theme.id,
    dir: catalogDir,
    name:
      isNonEmptyString(theme.name) ? theme.name : isNonEmptyString(raw.description) ? raw.description : theme.id,
    version: isNonEmptyString(theme.version) ? theme.version : dependency.version ?? pkgVersion,
    description:
      isNonEmptyString(theme.description) ? theme.description : isNonEmptyString(raw.description) ? raw.description : undefined,
    author: isNonEmptyString(theme.author) ? theme.author : raw.author,
    authorUri: isNonEmptyString(theme.authorUri) ? theme.authorUri : undefined,
    themeUri:
      isNonEmptyString(theme.themeUri) ? theme.themeUri : isNonEmptyString(raw.homepage) ? raw.homepage : undefined,
    previewUrl: isNonEmptyString(theme.previewUrl) ? theme.previewUrl.trim() : undefined,
    cover: isNonEmptyString(theme.cover) ? theme.cover.trim() : undefined,
    tags: Array.isArray(theme.tags) ? theme.tags : undefined,
    dependency,
    npm: npmSpec,
    featured: theme.featured === true,
    requires: isNonEmptyString(theme.requires) ? theme.requires : undefined,
  });
}

function readInlineNpmEntry(item) {
  if (!item || typeof item !== 'object') return null;
  const dependency =
    readPackageDependencies(item) ??
    (item.dependency &&
    typeof item.dependency === 'object' &&
    isNonEmptyString(item.dependency.name) &&
    isNonEmptyString(item.dependency.version)
      ? { name: item.dependency.name.trim(), version: item.dependency.version.trim() }
      : isNonEmptyString(item.npm)
        ? parseNpmSpecToDependency(item.npm)
        : undefined);
  if (!dependency && !isNonEmptyString(item.npm)) return null;
  return normalizeNpmCatalogEntry({
    id: item.id,
    name: item.name,
    version: item.version,
    description: item.description,
    author: item.author,
    authorUri: item.authorUri,
    themeUri: item.themeUri,
    previewUrl: item.previewUrl,
    cover: item.cover,
    tags: item.tags,
    dependency,
    npm: dependency ? formatNpmInstallSpec(dependency.name, dependency.version) : item.npm,
    featured: item.featured,
    requires: item.requires,
  });
}

/** Local theme ids registered in themes/package.json with theme.json on disk. */
function readLocalThemeSources(projectRoot) {
  const root = path.resolve(projectRoot);
  const { local } = readThemesRegistryMeta(root);
  const templates = themesRoot(root);
  const sources = [];

  for (const id of local) {
    const themeJson = path.join(templates, id, 'theme.json');
    if (!fs.existsSync(themeJson)) continue;
    const manifest = readJsonFile(themeJson);
    if (!manifest?.id) continue;
    sources.push({
      kind: 'local',
      id: manifest.id,
      dir: id,
      manifest,
    });
  }

  return sources;
}

/** npm catalog entries — anchor dirs (themes/{anchor}/package.json) are canonical. */
function readNpmThemeSources(projectRoot) {
  const root = path.resolve(projectRoot);
  const { npm } = readThemesRegistryMeta(root);
  const templates = themesRoot(root);
  const byId = new Map();

  for (const item of npm) {
    if (isNonEmptyString(item)) {
      const dir = item.trim();
      const entry = readNpmEntryFromPackageDir(dir, path.join(templates, dir, 'package.json'));
      if (entry) byId.set(entry.id, { kind: 'npm', ...entry });
      continue;
    }

    const inline = readInlineNpmEntry(item);
    if (inline) byId.set(inline.id, { kind: 'npm', ...inline });
  }

  return [...byId.values()];
}

/** Combined registry view used by CLI and server. */
function readThemeSources(projectRoot) {
  return {
    local: readLocalThemeSources(projectRoot),
    npm: readNpmThemeSources(projectRoot),
  };
}

function validateLocalThemes(projectRoot) {
  const root = path.resolve(projectRoot);
  const { local } = readThemesRegistryMeta(root);
  const missing = [];
  const templates = themesRoot(root);

  for (const id of local) {
    const themeJson = path.join(templates, id, 'theme.json');
    if (!fs.existsSync(themeJson)) {
      missing.push(id);
    }
  }
  return { local, missing };
}

/** @deprecated Use validateLocalThemes */
function validateBundledThemes(projectRoot) {
  const { local, missing } = validateLocalThemes(projectRoot);
  return { bundled: local, missing };
}

function validateNpmThemes(projectRoot) {
  const root = path.resolve(projectRoot);
  const { npm } = readThemesRegistryMeta(root);
  const missing = [];
  const templates = themesRoot(root);

  for (const item of npm) {
    if (isNonEmptyString(item)) {
      const dir = item.trim();
      const pkgPath = path.join(templates, dir, 'package.json');
      const themeJson = path.join(templates, dir, 'theme.json');
      if (fs.existsSync(themeJson)) {
        missing.push(`${dir}/ must not contain theme.json (npm anchor vs local theme)`);
      }
      const entry = readNpmEntryFromPackageDir(dir, pkgPath);
      if (!entry) missing.push(`${dir}/package.json (dependencies + reactpress.theme)`);
      continue;
    }
    if (!readInlineNpmEntry(item)) {
      missing.push(`inline npm entry (id + dependencies or npm required): ${JSON.stringify(item)}`);
    }
  }

  return { npm, missing };
}

/** @deprecated Use validateNpmThemes */
function validateCatalogThemes(projectRoot) {
  const { npm, missing } = validateNpmThemes(projectRoot);
  const catalog = npm
    .map((item) => (isNonEmptyString(item) ? item.trim() : null))
    .filter(Boolean);
  return { catalog, missing };
}

module.exports = {
  readThemesRegistryMeta,
  readThemesPackageMeta,
  readLocalThemeSources,
  readNpmThemeSources,
  readThemeSources,
  readNpmEntryFromPackageDir,
  readInlineNpmEntry,
  formatNpmInstallSpec,
  parseNpmSpecToDependency,
  readPackageDependencies,
  readThemeDependency,
  resolveThemeNpmSpec,
  normalizeNpmCatalogEntry,
  isValidNpmCatalogEntry,
  validateLocalThemes,
  validateNpmThemes,
  validateBundledThemes,
  validateCatalogThemes,
};
