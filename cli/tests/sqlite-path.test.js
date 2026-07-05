const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

describe('sqlite paths', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-sqlite-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('defaults to .reactpress/reactpress.db', async () => {
    const { getProjectPaths } = require('../out/core/utils/paths');
    const paths = getProjectPaths(tmpDir);
    assert.equal(paths.sqlitePath, path.join(tmpDir, '.reactpress', 'reactpress.db'));
  });

  it('migrates legacy data/reactpress.db on resolve', async () => {
    const legacyDir = path.join(tmpDir, 'data');
    fs.mkdirSync(legacyDir, { recursive: true });
    fs.writeFileSync(path.join(legacyDir, 'reactpress.db'), 'legacy');

    const { resolveSqlitePath } = require('../out/core/services/database/sqlite');
    const resolved = await resolveSqlitePath(tmpDir);
    const expected = path.join(tmpDir, '.reactpress', 'reactpress.db');

    assert.equal(resolved, expected);
    assert.equal(fs.readFileSync(expected, 'utf8'), 'legacy');
  });
});
