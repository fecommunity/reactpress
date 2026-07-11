const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  adminSourceIsNewerThanTheme,
  ensureAdminStaticForTheme,
} = require('../out/core/services/admin-static');

const CLI_ROOT = path.join(__dirname, '..');

describe('admin-static upgrade sync', () => {
  it('adminSourceIsNewerThanTheme detects stale theme admin bundle', () => {
    const themeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-admin-stale-'));
    const publicAdmin = path.join(themeDir, 'public', 'admin');
    fs.mkdirSync(publicAdmin, { recursive: true });
    fs.writeFileSync(
      path.join(publicAdmin, 'index.html'),
      '<script src="/admin/assets/index-OLDHASH.js"></script>',
      'utf8',
    );

    const bundledIndex = path.join(CLI_ROOT, 'admin-dist', 'index.html');
    if (!fs.existsSync(bundledIndex)) return;

    assert.equal(adminSourceIsNewerThanTheme(CLI_ROOT, themeDir), true);
    fs.rmSync(themeDir, { recursive: true, force: true });
  });

  it('ensureAdminStaticForTheme refreshes stale public/admin from bundled admin-dist', () => {
    const bundledIndex = path.join(CLI_ROOT, 'admin-dist', 'index.html');
    if (!fs.existsSync(bundledIndex)) return;

    const themeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-admin-resync-'));
    const publicAdmin = path.join(themeDir, 'public', 'admin');
    fs.mkdirSync(publicAdmin, { recursive: true });
    fs.writeFileSync(
      path.join(publicAdmin, 'index.html'),
      '<script src="/admin/assets/index-OLDHASH.js"></script>',
      'utf8',
    );

    const synced = ensureAdminStaticForTheme(CLI_ROOT, themeDir);
    assert.equal(synced, true);

    const html = fs.readFileSync(path.join(publicAdmin, 'index.html'), 'utf8');
    const bundledHtml = fs.readFileSync(bundledIndex, 'utf8');
    const themeJs = html.match(/assets\/(index-[^"]+\.js)/)?.[1];
    const bundledJs = bundledHtml.match(/assets\/(index-[^"]+\.js)/)?.[1];
    assert.equal(themeJs, bundledJs);

    fs.rmSync(themeDir, { recursive: true, force: true });
  });
});
