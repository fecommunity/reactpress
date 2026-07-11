'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI_ROOT = path.join(__dirname, '..');
const MAX_PACK_BYTES = 10 * 1024 * 1024;

function packTarball() {
  const prepack = spawnSync('npm', ['run', 'prepack'], { cwd: CLI_ROOT, encoding: 'utf8' });
  assert.equal(prepack.status, 0, prepack.stderr || prepack.stdout);

  const output = execFileSync('npm', ['pack', '--ignore-scripts'], {
    cwd: CLI_ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  const filename = output.trim().split('\n').pop().trim();
  const tarball = path.join(CLI_ROOT, filename);
  assert.ok(fs.existsSync(tarball), `missing tarball: ${filename}`);
  return { tarball, filename };
}

describe('npm pack size', () => {
  it('pruned tarball is under 10MB and excludes bundled node_modules', () => {
    const { tarball, filename } = packTarball();
    try {
      assert.equal(fs.existsSync(path.join(CLI_ROOT, 'server', 'node_modules')), false);
      assert.equal(fs.existsSync(path.join(CLI_ROOT, 'toolkit', 'node_modules')), false);

      const size = fs.statSync(tarball).size;
      assert.ok(
        size < MAX_PACK_BYTES,
        `tarball ${filename} is ${(size / 1024 / 1024).toFixed(2)}MB (limit 10MB)`,
      );

      const list = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' });
      assert.doesNotMatch(list, /server\/node_modules\//);
      assert.doesNotMatch(list, /toolkit\/node_modules\//);
      assert.doesNotMatch(list, /server\/public\/uploads\//);
      assert.doesNotMatch(list, /server\/\.reactpress\//);
      assert.doesNotMatch(list, /\.tsbuildinfo$/);
      assert.doesNotMatch(list, /\.map$/);
    } finally {
      fs.rmSync(tarball, { force: true });
    }
  });
});
