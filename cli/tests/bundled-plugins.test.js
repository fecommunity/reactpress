const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const CLI_ROOT = path.join(__dirname, '..');

describe('sync-bundled-plugins', () => {
  it('copies plugin registry and built plugin trees into cli/plugins', () => {
    const script = path.join(CLI_ROOT, 'scripts', 'sync-bundled-plugins.mjs');
    assert.ok(fs.existsSync(script));

    const result = require('node:child_process').spawnSync(process.execPath, [script], {
      cwd: CLI_ROOT,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const bundled = path.join(CLI_ROOT, 'plugins');
    assert.ok(fs.existsSync(path.join(bundled, 'package.json')));
    for (const id of ['hello-world', 'seo', 'image-optimizer']) {
      assert.ok(
        fs.existsSync(path.join(bundled, id, 'plugin.json')),
        `missing bundled plugin ${id}/plugin.json`,
      );
      assert.ok(
        fs.existsSync(path.join(bundled, id, 'dist', 'index.js')),
        `missing bundled plugin ${id}/dist/index.js`,
      );
    }
  });
});

describe('ensureBundledPlugins', () => {
  it('seeds default plugins into an empty project from the CLI bundle', () => {
    const bundledRegistry = path.join(CLI_ROOT, 'plugins', 'package.json');
    if (!fs.existsSync(bundledRegistry)) {
      require('node:child_process').spawnSync(process.execPath, [
        path.join(CLI_ROOT, 'scripts', 'sync-bundled-plugins.mjs'),
      ], { cwd: CLI_ROOT, stdio: 'inherit' });
    }

    const { ensureBundledPlugins } = require('../out/core/services/local-site');
    const siteRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-plugins-seed-'));
    try {
      assert.equal(ensureBundledPlugins(siteRoot), true);
      assert.ok(fs.existsSync(path.join(siteRoot, 'plugins', 'hello-world', 'plugin.json')));
      assert.ok(fs.existsSync(path.join(siteRoot, 'plugins', 'seo', 'plugin.json')));
      assert.equal(ensureBundledPlugins(siteRoot), false);
    } finally {
      fs.rmSync(siteRoot, { recursive: true, force: true });
    }
  });
});
