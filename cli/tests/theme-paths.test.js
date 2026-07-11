const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  THEME_RUNTIME_REL,
  THEMES_CATALOG_REL,
  PREVIEW_POOL_PORTS,
  PREVIEW_PROXY_PORT,
  getPreviewBackendPorts,
  themesRoot,
} = require('../out/lib/theme-paths');

describe('lib/theme-paths', () => {
  it('exports stable relative paths', () => {
    assert.equal(THEME_RUNTIME_REL, '.reactpress/runtime');
    assert.equal(THEMES_CATALOG_REL, 'themes/catalog.json');
    assert.deepEqual(PREVIEW_POOL_PORTS, [3003]);
    assert.equal(PREVIEW_PROXY_PORT, 3003);
    assert.deepEqual(getPreviewBackendPorts(), [3004, 3005, 3006]);
  });

  it('themesRoot resolves under project root', () => {
    const root = path.join(__dirname, '../..');
    assert.equal(themesRoot(root), path.join(root, 'themes'));
  });
});
