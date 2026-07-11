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
