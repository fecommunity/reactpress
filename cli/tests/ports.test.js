const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

describe('dev stack ports', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.REACTPRESS_INSTANCE;
    delete process.env.REACTPRESS_DEV_INSTANCE;
    delete process.env.SERVER_PORT;
    delete process.env.WEB_ADMIN_PORT;
    delete process.env.CLIENT_PORT;
    delete process.env.REACTPRESS_PREVIEW_PORT;
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('defaults to standard dev ports', () => {
    const { resolveDevStackPorts } = require('../out/lib/ports');
    const ports = resolveDevStackPorts(process.cwd());
    assert.equal(ports.admin, 3000);
    assert.equal(ports.visitor, 3001);
    assert.equal(ports.api, 3002);
    assert.equal(ports.preview, 3003);
  });

  it('offsets ports by REACTPRESS_INSTANCE', () => {
    process.env.REACTPRESS_INSTANCE = '2';
    const { resolveDevStackPorts } = require('../out/lib/ports');
    const ports = resolveDevStackPorts(process.cwd());
    assert.equal(ports.admin, 3020);
    assert.equal(ports.visitor, 3021);
    assert.equal(ports.api, 3022);
    assert.equal(ports.preview, 3023);
  });

  it('process.env overrides instance offset', () => {
    process.env.REACTPRESS_INSTANCE = '1';
    process.env.SERVER_PORT = '3999';
    const { resolveDevStackPorts } = require('../out/lib/ports');
    const ports = resolveDevStackPorts(process.cwd());
    assert.equal(ports.api, 3999);
    assert.equal(ports.admin, 3010);
  });

  it('applyDevStackPortsToEnv sets SERVER_PORT and proxy target', () => {
    const { applyDevStackPortsToEnv } = require('../out/lib/ports');
    applyDevStackPortsToEnv({
      admin: 3010,
      visitor: 3011,
      api: 3012,
      preview: 3013,
    });
    assert.equal(process.env.SERVER_PORT, '3012');
    assert.equal(process.env.REACTPRESS_LOCAL_API_PORT, '3012');
    assert.equal(process.env.VITE_DEV_API_PROXY_TARGET, 'http://127.0.0.1:3012');
  });

  it('devSessionSuffix includes instance id', () => {
    const { devSessionSuffix } = require('../out/lib/ports');
    assert.equal(devSessionSuffix(), '');
    process.env.REACTPRESS_INSTANCE = '3';
    assert.equal(devSessionSuffix(), '-instance-3');
  });
});
