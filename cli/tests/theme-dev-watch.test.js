const fs = require('fs');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  hasThemePackages,
  hasResolvableActiveTheme,
  readActiveThemeManifest,
  resolveThemeDirectory,
  readManifestSignature,
} = require('../out/lib/theme-runtime');
const { createStandaloneProject, rmDir } = require('./helpers/tmp-project');

const HELLO_WORLD = path.join(__dirname, '../../themes/hello-world');

describe('theme dev watcher prerequisites', () => {
  it('detects theme packages even when active theme is missing on disk', () => {
    const root = createStandaloneProject();
    try {
      const runtimeHello = path.join(root, '.reactpress', 'runtime', 'hello-world');
      fs.mkdirSync(path.dirname(runtimeHello), { recursive: true });
      fs.cpSync(HELLO_WORLD, runtimeHello, { recursive: true });

      const manifestPath = path.join(root, '.reactpress', 'active-theme.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({ activeTheme: 'missing-theme', themeDir: null }, null, 2),
      );

      assert.equal(hasThemePackages(root), true);
      assert.equal(hasResolvableActiveTheme(root), false);
      assert.equal(readManifestSignature(root), '');
      assert.ok(resolveThemeDirectory(root, 'hello-world'));
    } finally {
      rmDir(root);
    }
  });

  it('manifest signature updates when active theme becomes resolvable', () => {
    const root = createStandaloneProject();
    try {
      const runtimeHello = path.join(root, '.reactpress', 'runtime', 'hello-world');
      fs.mkdirSync(path.dirname(runtimeHello), { recursive: true });
      fs.cpSync(HELLO_WORLD, runtimeHello, { recursive: true });

      const manifestPath = path.join(root, '.reactpress', 'active-theme.json');
      fs.writeFileSync(
        manifestPath,
        JSON.stringify({ activeTheme: 'missing-theme' }, null, 2),
      );
      assert.equal(readManifestSignature(root), '');

      fs.writeFileSync(
        manifestPath,
        JSON.stringify(
          {
            activeTheme: 'hello-world',
            themeDir: '.reactpress/runtime/hello-world',
            updatedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      );

      const signature = readManifestSignature(root);
      assert.match(signature, /^hello-world:/);
      assert.equal(readActiveThemeManifest(root).activeTheme, 'hello-world');
      assert.equal(hasResolvableActiveTheme(root), true);
    } finally {
      rmDir(root);
    }
  });
});
