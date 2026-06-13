const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { renderDevNginxConfig } = require('../out/lib/nginx');
const {
  normalizeRemoteOrigin,
  resolveRemoteThemeApiBase,
  parseOriginSpec,
  resolveDevApiOrigins,
  applyDevApiOriginsToEnv,
} = require('../out/lib/remote-dev');

describe('lib/remote-dev', () => {
  it('normalizes bare hostnames to https origins', () => {
    assert.equal(normalizeRemoteOrigin('api.gaoredu.com'), 'https://api.gaoredu.com');
    assert.equal(normalizeRemoteOrigin('https://api.gaoredu.com/'), 'https://api.gaoredu.com');
    assert.equal(normalizeRemoteOrigin(''), null);
  });

  it('parseOriginSpec supports local, remote, and URL', () => {
    assert.deepEqual(parseOriginSpec('local', 'https://api.gaoredu.com'), { url: null });
    assert.deepEqual(parseOriginSpec('remote', 'https://api.gaoredu.com'), {
      url: 'https://api.gaoredu.com',
    });
    assert.deepEqual(parseOriginSpec('remote', null), { error: 'REMOTE_DEFAULT_REQUIRED' });
    assert.deepEqual(parseOriginSpec('api.gaoredu.com', null), { url: 'https://api.gaoredu.com' });
  });

  it('resolveDevApiOrigins splits admin and client', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-origins-'));
    try {
      const mixed = resolveDevApiOrigins(root, {
        remoteOrigin: 'https://api.gaoredu.com',
        adminOrigin: 'local',
        clientOrigin: 'remote',
      });
      assert.equal(mixed.admin, null);
      assert.equal(mixed.client, 'https://api.gaoredu.com');
      assert.equal(mixed.needsLocalApi, true);

      const both = resolveDevApiOrigins(root, {
        remoteOrigin: 'api.gaoredu.com',
      });
      assert.equal(both.admin, 'https://api.gaoredu.com');
      assert.equal(both.client, 'https://api.gaoredu.com');
      assert.equal(both.needsLocalApi, false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('applyDevApiOriginsToEnv sets per-side env keys', () => {
    const keys = [
      'REACTPRESS_DEV_REMOTE_ORIGIN',
      'REACTPRESS_DEV_ADMIN_API_ORIGIN',
      'REACTPRESS_DEV_CLIENT_API_ORIGIN',
    ];
    const prev = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
    try {
      applyDevApiOriginsToEnv({
        remoteDefault: 'https://api.gaoredu.com',
        admin: null,
        client: 'https://api.gaoredu.com',
      });
      assert.equal(process.env.REACTPRESS_DEV_REMOTE_ORIGIN, 'https://api.gaoredu.com');
      assert.equal(process.env.REACTPRESS_DEV_ADMIN_API_ORIGIN, undefined);
      assert.equal(process.env.REACTPRESS_DEV_CLIENT_API_ORIGIN, 'https://api.gaoredu.com');
    } finally {
      for (const key of keys) {
        if (prev[key] === undefined) delete process.env[key];
        else process.env[key] = prev[key];
      }
    }
  });

  it('builds theme API base with /api suffix', () => {
    assert.equal(
      resolveRemoteThemeApiBase('https://api.gaoredu.com'),
      'https://api.gaoredu.com/api',
    );
  });
});

describe('renderDevNginxConfig client /api', () => {
  it('proxies /api to remote upstream when clientApiOrigin is set', () => {
    const content = renderDevNginxConfig({
      adminPort: 3000,
      visitorPort: 3001,
      apiPort: 3002,
      clientApiOrigin: 'https://api.gaoredu.com',
    });
    assert.ok(content.includes('proxy_pass https://api.gaoredu.com'));
    assert.ok(content.includes('proxy_set_header Host api.gaoredu.com'));
    assert.ok(!content.includes('host.docker.internal:3002'));
  });
});
