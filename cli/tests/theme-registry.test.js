const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  OFFICIAL_THEME_STARTER_ID,
  OFFICIAL_THEME_STARTER_SPEC,
  readThemeCatalog,
  readThemesPackageMeta,
  resolveCatalogInstallSpec,
  validateBundledThemes,
  validateCatalogThemes,
  catalogEntryToManifest,
} = require('../lib/theme-registry');

const REPO_ROOT = path.join(__dirname, '../..');

describe('lib/theme-registry', () => {
  it('reads official theme-starter from themes/theme-starter/package.json', () => {
    const catalog = readThemeCatalog(REPO_ROOT);
    const starter = catalog.themes.find((entry) => entry.id === OFFICIAL_THEME_STARTER_ID);
    assert.ok(starter);
    assert.equal(starter.npm, OFFICIAL_THEME_STARTER_SPEC);
    assert.equal(starter.featured, true);
    assert.equal(starter.dir, 'theme-starter');
    assert.equal(catalog.source, 'themes/package.json');
  });

  it('resolveCatalogInstallSpec maps catalog id to npm spec', () => {
    assert.equal(
      resolveCatalogInstallSpec(REPO_ROOT, OFFICIAL_THEME_STARTER_ID),
      OFFICIAL_THEME_STARTER_SPEC,
    );
  });

  it('readThemesPackageMeta lists bundled and catalog dirs from themes/package.json', () => {
    const meta = readThemesPackageMeta(REPO_ROOT);
    assert.ok(meta.bundled.includes('hello-world'));
    assert.ok(meta.catalog.includes('theme-starter'));
  });

  it('catalogEntryToManifest maps catalog metadata', () => {
    const entry = readThemeCatalog(REPO_ROOT).themes[0];
    const manifest = catalogEntryToManifest(entry);
    assert.equal(manifest.id, entry.id);
    assert.equal(manifest.name, entry.name);
  });

  it('validateBundledThemes reports missing template dirs', () => {
    const { bundled, missing } = validateBundledThemes(REPO_ROOT);
    assert.ok(bundled.includes('hello-world'));
    assert.equal(missing.length, 0);
  });

  it('validateCatalogThemes reports missing package.json metadata', () => {
    const { catalog, missing } = validateCatalogThemes(REPO_ROOT);
    assert.ok(catalog.includes('theme-starter'));
    assert.equal(missing.length, 0);
  });
});
