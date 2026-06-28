const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const CLI_ROOT = path.join(__dirname, '..');

describe('CLI version resolution', () => {
  it('reads version from package root (not out/package.json)', () => {
    const { getCliVersion, getCliPackageRoot } = require('../out/lib/paths');
    const root = getCliPackageRoot();
    const expected = JSON.parse(
      fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf8'),
    ).version;
    assert.equal(getCliVersion(), expected);
    assert.equal(
      fs.existsSync(path.join(root, 'package.json')),
      true,
      'package root must contain package.json',
    );
    assert.equal(
      fs.existsSync(path.join(root, 'out', 'package.json')),
      false,
      'compiled out/ must not rely on out/package.json',
    );
  });
});
