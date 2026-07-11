'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const CLI_BIN = path.join(__dirname, '..', 'out', 'bin', 'reactpress.js');

function runCli(args, { env } = {}) {
  return execFileSync(process.execPath, [CLI_BIN, ...args], {
    encoding: 'utf8',
    env: { ...process.env, TERM: 'dumb', ...env },
  });
}

function runCliFail(args) {
  try {
    runCli(args);
    return null;
  } catch (err) {
    return err;
  }
}

describe('reactpress init-only CLI', () => {
  it('--help documents init as the only command', () => {
    const out = runCli(['--help']);
    assert.match(out, /reactpress/i);
    assert.match(out, /init/i);
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
});
