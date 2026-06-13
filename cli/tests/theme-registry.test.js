const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  OFFICIAL_THEME_STARTER_ID,
  OFFICIAL_THEME_STARTER_SPEC,
  readThemeCatalog,
  readThemesPackageMeta,
  readThemesRegistryMeta,
  readThemeSources,
  resolveCatalogInstallSpec,
  validateLocalThemes,
  validateNpmThemes,
  validateBundledThemes,
  validateCatalogThemes,
  catalogEntryToManifest,
} = require('../lib/theme-registry');

const REPO_ROOT = path.join(__dirname, '../..');

describe('lib/theme-registry', () => {
  it('reads official theme-starter from themes/theme-starter/package.json anchor', () => {
    const catalog = readThemeCatalog(REPO_ROOT);
    const starter = catalog.themes.find((entry) => entry.id === OFFICIAL_THEME_STARTER_ID);
    assert.ok(starter);
    assert.equal(starter.npm, OFFICIAL_THEME_STARTER_SPEC);
    assert.deepEqual(starter.dependency, {
      name: '@fecommunity/reactpress-theme-starter',
      version: '1.0.0-beta.0',
    });
    assert.equal(starter.featured, true);
    assert.equal(starter.dir, 'theme-starter');
    assert.equal(starter.previewUrl, 'https://reactpress-theme-starter.vercel.app');
    assert.equal(catalog.source, 'themes/package.json');
  });

  it('resolveCatalogInstallSpec maps catalog id to npm spec', () => {
    assert.equal(
      resolveCatalogInstallSpec(REPO_ROOT, OFFICIAL_THEME_STARTER_ID),
      OFFICIAL_THEME_STARTER_SPEC,
    );
  });

  it('readThemesRegistryMeta lists local ids and npm anchor dirs', () => {
    const meta = readThemesRegistryMeta(REPO_ROOT);
    assert.ok(meta.local.includes('hello-world'));
    assert.ok(meta.npm.includes('theme-starter'));
  });

  it('readThemesPackageMeta keeps bundled/catalog aliases for legacy callers', () => {
    const meta = readThemesPackageMeta(REPO_ROOT);
    assert.ok(meta.bundled.includes('hello-world'));
    assert.ok(meta.local.includes('hello-world'));
  });

  it('readThemeSources exposes local and npm kinds', () => {
    const sources = readThemeSources(REPO_ROOT);
    assert.ok(sources.local.some((entry) => entry.id === 'hello-world' && entry.kind === 'local'));
    assert.ok(
      sources.npm.some((entry) => entry.id === OFFICIAL_THEME_STARTER_ID && entry.kind === 'npm'),
    );
  });

  it('catalogEntryToManifest maps catalog metadata', () => {
    const entry = readThemeCatalog(REPO_ROOT).themes[0];
    const manifest = catalogEntryToManifest(entry);
    assert.equal(manifest.id, entry.id);
    assert.equal(manifest.name, entry.name);
  });

  it('validateLocalThemes reports missing template dirs', () => {
    const { local, missing } = validateLocalThemes(REPO_ROOT);
    assert.ok(local.includes('hello-world'));
    assert.equal(missing.length, 0);
  });

  it('validateNpmThemes accepts theme-starter anchor package.json', () => {
    const { missing } = validateNpmThemes(REPO_ROOT);
    assert.equal(missing.length, 0);
  });

  it('validateBundledThemes and validateCatalogThemes remain as aliases', () => {
    const bundled = validateBundledThemes(REPO_ROOT);
    const catalog = validateCatalogThemes(REPO_ROOT);
    assert.equal(bundled.missing.length, 0);
    assert.equal(catalog.missing.length, 0);
  });
});
