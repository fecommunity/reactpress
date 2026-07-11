'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('fs');
const path = require('node:path');

const CLI_BIN = path.join(__dirname, '..', 'out', 'bin', 'reactpress.js');

function runCli(args, { env } = {}) {
  return execFileSync(process.execPath, [CLI_BIN, ...args], {
    encoding: 'utf8',
    env: { ...process.env, TERM: 'dumb', ...env },
  });
}

function runCliFail(args, { env } = {}) {
  try {
    runCli(args, { env });
    return null;
  } catch (err) {
    return err;
  }
}

describe('reactpress init-only CLI', () => {
  it('--help documents init and doctor commands', () => {
    const out = runCli(['--help']);
    assert.match(out, /reactpress/i);
    assert.match(out, /init/i);
    assert.match(out, /doctor/i);
    assert.doesNotMatch(out, /reactpress docker/i);
    assert.doesNotMatch(out, /reactpress nginx/i);
    assert.doesNotMatch(out, /reactpress dev/i);
    assert.doesNotMatch(out, /reactpress start/i);
  });

  it('rejects legacy subcommands', () => {
    const err = runCliFail(['start']);
    assert.ok(err);
    assert.match(String(err.stderr || err.stdout || ''), /init/i);
  });

  it('runs doctor and prints diagnostics', () => {
    const { createStandaloneProject, rmDir } = require('./helpers/tmp-project');
    const root = createStandaloneProject();
    try {
      const err = runCliFail(['doctor', root], {
        env: { REACTPRESS_LOCAL_MODE: '1', REACTPRESS_SKIP_NGINX: '1' },
      });
      assert.ok(err);
      const out = String(err.stdout || err.stderr || '');
      assert.match(out, /ReactPress Doctor/i);
      assert.match(out, /Node\.js/i);
      assert.match(out, /Admin console/i);
    } finally {
      rmDir(root);
    }
  });

  it('doctor logs lists project log files', () => {
    const { createStandaloneProject, rmDir } = require('./helpers/tmp-project');
    const root = createStandaloneProject();
    try {
      const logDir = path.join(root, '.reactpress', 'logs', 'server', 'error');
      fs.mkdirSync(logDir, { recursive: true });
      fs.writeFileSync(path.join(logDir, 'error.log.-2026-07-11.log'), '[ERROR] test\n', 'utf8');

      const out = runCli(['doctor', 'logs', root, '--tail', '5'], {
        env: { REACTPRESS_LOCAL_MODE: '1', REACTPRESS_SKIP_NGINX: '1' },
      });
      assert.match(out, /ReactPress Doctor/i);
      assert.match(out, /\[ERROR\] test/);
    } finally {
      rmDir(root);
    }
  });
});
