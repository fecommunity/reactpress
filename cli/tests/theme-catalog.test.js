const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('lib/theme-catalog (re-export)', () => {
  it('re-exports theme-registry API', () => {
    const catalog = require('../out/lib/theme-catalog');
    const registry = require('../out/lib/theme-registry');
    assert.equal(catalog.OFFICIAL_THEME_STARTER_ID, registry.OFFICIAL_THEME_STARTER_ID);
    assert.equal(typeof catalog.readThemeCatalog, 'function');
    assert.equal(typeof catalog.validateBundledThemes, 'function');
  });
});
