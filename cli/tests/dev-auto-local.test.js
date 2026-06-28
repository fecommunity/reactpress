const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

describe('dev auto local fallback', () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    delete process.env.REACTPRESS_LOCAL_MODE;
    delete process.env.REACTPRESS_SKIP_NGINX;
    delete process.env.REACTPRESS_FORCE_MYSQL;
    delete process.env.REACTPRESS_DESKTOP_LOCAL;
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it('enables local mode when docker is unavailable', async () => {
    const { applyAutoLocalDevFallback } = require('../out/lib/dev');
    const { checkDocker } = require('../out/lib/doctor');
    const docker = checkDocker();
    if (docker.ok) {
      // Cannot simulate missing docker in CI — skip when docker is running.
      return;
    }

    const enabled = await applyAutoLocalDevFallback(process.cwd(), { needsLocalApi: true });
    assert.equal(enabled, true);
    assert.equal(process.env.REACTPRESS_LOCAL_MODE, '1');
    assert.equal(process.env.REACTPRESS_SKIP_NGINX, '1');
  });

  it('respects explicit local mode and force mysql flag', async () => {
    const { applyAutoLocalDevFallback } = require('../out/lib/dev');

    process.env.REACTPRESS_LOCAL_MODE = '1';
    const alreadyLocal = await applyAutoLocalDevFallback(process.cwd(), { needsLocalApi: true });
    assert.equal(alreadyLocal, false);

    delete process.env.REACTPRESS_LOCAL_MODE;
    process.env.REACTPRESS_FORCE_MYSQL = '1';
    const forced = await applyAutoLocalDevFallback(process.cwd(), { needsLocalApi: true });
    assert.equal(forced, false);
    assert.equal(process.env.REACTPRESS_LOCAL_MODE, undefined);
  });
});
