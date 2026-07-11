const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  loadServerSiteUrl,
  loadClientSiteUrl,
  loadAdminConsoleUrl,
  getApiPrefix,
  getHealthUrl,
  normalizeProbeUrl,
} = require('../out/lib/http');
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

  it('normalizes localhost probes to IPv4 loopback', () => {
    assert.equal(
      normalizeProbeUrl('http://localhost:3002/api/health'),
      'http://127.0.0.1:3002/api/health',
    );
    assert.equal(
      normalizeProbeUrl('http://[::1]:3001/'),
      'http://127.0.0.1:3001/',
    );
  });

  it('resolves admin console URL for local zero-dependency mode', () => {
    const root = createStandaloneProject();
    const prevLocal = process.env.REACTPRESS_LOCAL_MODE;
    const prevNginx = process.env.REACTPRESS_SKIP_NGINX;
    try {
      process.env.REACTPRESS_LOCAL_MODE = '1';
      process.env.REACTPRESS_SKIP_NGINX = '1';
      assert.equal(loadAdminConsoleUrl(root), 'http://localhost:3001/admin/');
    } finally {
      process.env.REACTPRESS_LOCAL_MODE = prevLocal;
      process.env.REACTPRESS_SKIP_NGINX = prevNginx;
      rmDir(root);
    }
  });
});
