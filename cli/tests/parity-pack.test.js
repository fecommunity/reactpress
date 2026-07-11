const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const CLI_ROOT = path.join(__dirname, '..');

/** Files that must ship in the npm tarball and exist locally (publish/local parity). */
const REQUIRED_SHIPPED = [
  'package.json',
  'bin/reactpress.js',
  'bin/reactpress-cli-shim.js',
  'out/lib/root.js',
  'out/lib/publish.js',
  'out/lib/project-type.js',
  'out/ui/interactive.js',
  'out/ui/banner.js',
  'out/ui/theme.js',
  'dist/index.js',
  'templates/env.default',
  'templates/config.default.json',
];

describe('publish/local file parity', () => {
  it('critical runtime files exist on disk', () => {
    for (const required of REQUIRED_SHIPPED) {
      assert.ok(fs.existsSync(path.join(CLI_ROOT, required)), `missing locally: ${required}`);
    }
  });

  it('package.json files[] lists top-level dirs for all shipped assets', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'));
    const declared = new Set(pkg.files || []);
    for (const required of REQUIRED_SHIPPED) {
      if (required === 'package.json') continue;
      const top = required.split('/')[0];
      assert.ok(
        declared.has(top) || declared.has(required),
        `package.json files[] missing "${top}" (needed for ${required})`,
      );
    }
    assert.ok(declared.has('toolkit'), 'package.json files[] must ship bundled toolkit');
  });
});
