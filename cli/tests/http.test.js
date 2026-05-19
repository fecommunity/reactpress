const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  loadServerSiteUrl,
  loadClientSiteUrl,
  getApiPrefix,
  getHealthUrl,
} = require('../lib/http');
const { createStandaloneProject, rmDir } = require('./helpers/tmp-project');

describe('lib/http', () => {
  it('reads URLs and health path from .env', () => {
    const root = createStandaloneProject();
    try {
      assert.equal(loadServerSiteUrl(root), 'http://localhost:3002');
      assert.equal(loadClientSiteUrl(root), 'http://localhost:3001');
      assert.equal(getApiPrefix(root), '/api');
      assert.equal(getHealthUrl(root), 'http://localhost:3002/api/health');
    } finally {
      rmDir(root);
    }
  });
});
