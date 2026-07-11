const fs = require('fs');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { shouldBuildToolkit } = require('../out/lib/toolkit-build');
const { createMonorepoFixture, rmDir } = require('./helpers/tmp-project');

describe('lib/toolkit-build', () => {
  it('requires build when dist is missing', () => {
    const root = createMonorepoFixture();
    try {
      assert.equal(shouldBuildToolkit(root), true);
    } finally {
      rmDir(root);
    }
  });

  it('skips build when dist is newer than src', () => {
    const root = createMonorepoFixture();
    try {
      const toolkitDir = path.join(root, 'toolkit');
      const distDir = path.join(toolkitDir, 'dist');
      fs.mkdirSync(distDir, { recursive: true });
      fs.writeFileSync(path.join(distDir, 'index.js'), 'module.exports = {};\n');
      const srcDir = path.join(toolkitDir, 'src');
      fs.mkdirSync(srcDir, { recursive: true });
      fs.writeFileSync(path.join(srcDir, 'index.ts'), 'export {};\n');
      const past = new Date(Date.now() - 60_000);
      fs.utimesSync(path.join(srcDir, 'index.ts'), past, past);
      const future = new Date(Date.now() + 60_000);
      fs.utimesSync(path.join(distDir, 'index.js'), future, future);
      assert.equal(shouldBuildToolkit(root), false);
    } finally {
      rmDir(root);
    }
  });

  it('honors REACTPRESS_SKIP_TOOLKIT_BUILD', () => {
    const root = createMonorepoFixture();
    const prev = process.env.REACTPRESS_SKIP_TOOLKIT_BUILD;
    process.env.REACTPRESS_SKIP_TOOLKIT_BUILD = '1';
    try {
      assert.equal(shouldBuildToolkit(root), false);
    } finally {
      if (prev === undefined) delete process.env.REACTPRESS_SKIP_TOOLKIT_BUILD;
      else process.env.REACTPRESS_SKIP_TOOLKIT_BUILD = prev;
      rmDir(root);
    }
  });
});
