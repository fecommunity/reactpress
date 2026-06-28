const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

describe('database sqlite fallback', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-db-fallback-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('promotes embedded-docker to sqlite when docker is unavailable', async () => {
    const reactpressDir = path.join(tmpDir, '.reactpress');
    fs.mkdirSync(reactpressDir, { recursive: true });
    fs.writeFileSync(
      path.join(reactpressDir, 'config.json'),
      JSON.stringify(
        {
          version: 1,
          database: { mode: 'embedded-docker', containerName: 'reactpress_cli_db' },
          server: { port: 3002, clientUrl: 'http://localhost:3001', serverUrl: 'http://localhost:3002' },
        },
        null,
        2,
      ),
    );
    fs.writeFileSync(
      path.join(tmpDir, '.env'),
      [
        'DB_HOST=127.0.0.1',
        'DB_PORT=3307',
        'DB_USER=reactpress',
        'DB_PASSWD=reactpress',
        'DB_DATABASE=reactpress',
        'SERVER_PORT=3002',
      ].join('\n'),
    );

    const { ensureDatabase } = require('../out/core/services/database');
    const { loadConfig } = require('../out/core/services/config');
    const { isDockerAvailable } = require('../out/core/services/exec');

    if (isDockerAvailable()) {
      return;
    }

    const config = await loadConfig(tmpDir);
    const result = await ensureDatabase(tmpDir, config);
    assert.equal(result.ok, true);

    const next = await loadConfig(tmpDir);
    assert.equal(next.database.mode, 'embedded-sqlite');

    const env = fs.readFileSync(path.join(tmpDir, '.env'), 'utf8');
    assert.match(env, /^DB_TYPE=sqlite/m);
  });
});

describe('database-mode', () => {
  it('detects sqlite mode from config.json', () => {
    const { readSqliteModeFromProject } = require('../out/lib/database-mode');
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-db-mode-'));
    try {
      fs.mkdirSync(path.join(tmpDir, '.reactpress'), { recursive: true });
      fs.writeFileSync(
        path.join(tmpDir, '.reactpress/config.json'),
        JSON.stringify({ database: { mode: 'embedded-sqlite' } }),
      );
      assert.equal(readSqliteModeFromProject(tmpDir), true);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
