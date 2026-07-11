'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CLI_ROOT = path.join(__dirname, '..');

describe('bundled server sync', () => {
  it('has server dist and toolkit entry for publish', () => {
    assert.ok(fs.existsSync(path.join(CLI_ROOT, 'server', 'dist', 'main.js')));
    assert.ok(fs.existsSync(path.join(CLI_ROOT, 'toolkit', 'dist', 'index.js')));
    assert.ok(fs.existsSync(path.join(CLI_ROOT, 'server', 'package.json')));
  });

  it('bundled server entry exports main() for reactpress-server.js', () => {
    const mainPath = path.join(CLI_ROOT, 'server', 'dist', 'main.js');
    const source = fs.readFileSync(mainPath, 'utf8');
    assert.match(
      source,
      /exports\.main\s*=|Object\.defineProperty\(exports,\s*["']main["']/,
      'dist/main.js must export main()',
    );
  });

  it('keeps README in English and blocks legacy README sync', () => {
    const readme = fs.readFileSync(path.join(CLI_ROOT, 'README.md'), 'utf8');
    assert.match(readme, /official \*\*ReactPress CLI\*\*/i);
    assert.doesNotMatch(readme, /[\u4e00-\u9fff]/, 'cli/README.md must stay in English');

    const syncSrc = fs.readFileSync(path.join(CLI_ROOT, 'scripts', 'sync-bundled-core.mjs'), 'utf8');
    assert.match(
      syncSrc,
      /for \(const file of \['LICENSE'\]\)/,
      'sync-bundled-core must only copy LICENSE, not README.md',
    );
  });

  it('declares prune and npmignore rules for heavyweight paths', () => {
    const npmignore = fs.readFileSync(path.join(CLI_ROOT, '.npmignore'), 'utf8');
    assert.match(npmignore, /server\/node_modules/);
    assert.match(npmignore, /toolkit\/node_modules/);
    assert.match(npmignore, /server\/public\/uploads/);

    const pruneSrc = fs.readFileSync(
      path.join(CLI_ROOT, 'scripts', 'prune-bundled-pack.mjs'),
      'utf8',
    );
    assert.match(pruneSrc, /server\/node_modules/);
    assert.match(pruneSrc, /prune-bundled-pack/);
  });
});
