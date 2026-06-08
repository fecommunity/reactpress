const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  parseNpmSpec,
  resolveThemeIdentity,
  installThemeFromNpm,
} = require('../lib/theme-install');
const { readThemeLock } = require('../lib/theme-lock');
const { createStandaloneProject, rmDir } = require('./helpers/tmp-project');

const HELLO_WORLD_THEME = path.join(__dirname, '../../themes/hello-world');

describe('lib/theme-install', () => {
  it('parseNpmSpec accepts npm specs and tarball paths', () => {
    assert.deepEqual(parseNpmSpec('@fecommunity/reactpress-template-hello-world@3.0.4'), {
      kind: 'npm',
      spec: '@fecommunity/reactpress-template-hello-world@3.0.4',
    });
    assert.equal(parseNpmSpec('').error, 'EMPTY_SPEC');
  });

  it('resolveThemeIdentity reads theme.json id', () => {
    const identity = resolveThemeIdentity(HELLO_WORLD_THEME);
    assert.equal(identity?.themeId, 'hello-world');
    assert.equal(identity?.manifest?.name, 'Hello World');
  });

  it('installThemeFromNpm materializes a local npm pack into runtime', async () => {
    const root = createStandaloneProject();
    const packDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-pack-'));
    try {
      const packResult = spawnSync(
        'npm',
        ['pack', HELLO_WORLD_THEME, '--pack-destination', packDir],
        { encoding: 'utf8', shell: process.platform === 'win32' },
      );
      assert.equal(packResult.status, 0, packResult.stderr || packResult.stdout);

      const tarball = fs
        .readdirSync(packDir)
        .find((name) => name.endsWith('.tgz'));
      assert.ok(tarball, 'npm pack should produce a tarball');

      const result = await installThemeFromNpm(root, path.join(packDir, tarball), {
        skipDependencies: true,
      });
      assert.equal(result.themeId, 'hello-world');
      assert.ok(fs.existsSync(path.join(root, '.reactpress', 'runtime', 'hello-world', 'theme.json')));

      const lock = readThemeLock(root);
      assert.equal(lock.themes['hello-world']?.source, 'npm');
      assert.match(lock.themes['hello-world']?.spec ?? '', /\.tgz$/);
    } finally {
      rmDir(root);
      rmDir(packDir);
    }
  });
});
