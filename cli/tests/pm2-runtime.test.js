const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  PM2_API_APP,
  PM2_CLIENT_APP,
  isPm2AppOnline,
  getPm2AppPid,
  getPm2AppLogPaths,
} = require('../out/lib/pm2-runtime');

describe('lib/pm2-runtime', () => {
  it('exports internal app names', () => {
    assert.equal(PM2_API_APP, 'reactpress-api');
    assert.equal(PM2_CLIENT_APP, 'reactpress-client');
  });

  it('isPm2AppOnline returns a boolean', () => {
    const root = '/tmp/reactpress-no-pm2-project';
    assert.equal(typeof isPm2AppOnline(root, PM2_API_APP), 'boolean');
  });

  it('exports pm2 log path helpers', () => {
    const paths = getPm2AppLogPaths('/tmp/reactpress-no-pm2-project');
    assert.match(paths.out, /\.log$/);
    assert.match(paths.err, /\.log$/);
  });
});

describe('initLocalProject idempotent', () => {
  it('returns ok when config already exists', async () => {
    const fs = require('fs-extra');
    const os = require('os');
    const path = require('path');
    const { initLocalProject } = require('../out/core/services/local-site');

    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-init-idempotent-'));
    try {
      const first = await initLocalProject(root);
      assert.equal(first.ok, true);

      const second = await initLocalProject(root);
      assert.equal(second.ok, true);
      assert.match(second.message, /already initialized|已初始化/i);
    } finally {
      fs.removeSync(root);
    }
  });
});
