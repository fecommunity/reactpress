const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const CLI_ROOT = path.join(__dirname, '..');

describe('server-bundle', () => {
  it('ensureBundledServerDeps skips monorepo server projects', async () => {
    const { ensureBundledServerDeps } = require('../out/lib/server-bundle');
    const repoRoot = path.join(CLI_ROOT, '..');
    const result = await ensureBundledServerDeps(repoRoot);
    assert.equal(result.ok, true);
  });

  it('isBundledServerReady requires toolkit dist and server runtime modules', () => {
    const { isBundledServerReady } = require('../out/lib/server-bundle');
    const ready = isBundledServerReady();
    const hasToolkit = fs.existsSync(path.join(CLI_ROOT, 'toolkit', 'dist', 'index.js'));
    const hasServerMain = fs.existsSync(path.join(CLI_ROOT, 'server', 'dist', 'main.js'));
    if (hasToolkit && hasServerMain) {
      assert.equal(typeof ready, 'boolean');
    } else {
      assert.equal(ready, false);
    }
  });
});

describe('install-bundled-runtime script', () => {
  it('exits without error in monorepo checkout', () => {
    const { spawnSync } = require('child_process');
    const script = path.join(CLI_ROOT, 'scripts', 'install-bundled-runtime.mjs');
    const result = spawnSync(process.execPath, [script], { cwd: CLI_ROOT, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });
});
