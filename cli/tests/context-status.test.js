'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  resolveServiceChecks,
  resolveDbType,
  parseEnvFile,
} = require('../out/lib/context-status');

describe('context-status', () => {
  it('parseEnvFile reads DB_TYPE from .env', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-status-'));
    try {
      fs.writeFileSync(path.join(dir, '.env'), 'DB_TYPE=sqlite\nDB_DATABASE=data/app.db\n');
      const env = parseEnvFile(dir);
      assert.equal(env.DB_TYPE, 'sqlite');
      assert.equal(env.DB_DATABASE, 'data/app.db');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('resolveDbType prefers sqlite from .env when config is missing', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-status-'));
    try {
      fs.writeFileSync(path.join(dir, '.env'), 'DB_TYPE=sqlite\n');
      assert.equal(await resolveDbType(dir), 'sqlite');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('resolveDbType defaults to mysql without sqlite hints', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rp-status-'));
    try {
      assert.equal(await resolveDbType(dir), 'mysql');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('resolveServiceChecks includes sqlite or mysql plus core services', () => {
    assert.deepEqual(resolveServiceChecks('sqlite'), ['sqlite', 'server', 'web']);
    assert.deepEqual(resolveServiceChecks('mysql'), ['mysql', 'server', 'web']);
  });
});
