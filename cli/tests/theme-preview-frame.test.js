const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { ensurePreviewFrameAllowed, PATCH_MARKER } = require('../out/lib/theme-preview-frame');

describe('lib/theme-preview-frame', () => {
  it('patches next.config.js to skip X-Frame-Options during admin preview', () => {
    const themeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-frame-'));
    try {
      fs.writeFileSync(
        path.join(themeDir, 'next.config.js'),
        `module.exports = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    }];
  },
};`,
      );

      assert.equal(ensurePreviewFrameAllowed(themeDir), true);
      assert.ok(fs.existsSync(path.join(themeDir, PATCH_MARKER)));

      const patched = fs.readFileSync(path.join(themeDir, 'next.config.js'), 'utf8');
      assert.match(patched, /REACTPRESS_HONOR_PREVIEW === '1'/);
      assert.match(patched, /\?\s*\[\]\s*:\s*\[\{ key: 'X-Frame-Options'/);

      assert.equal(ensurePreviewFrameAllowed(themeDir), true);
    } finally {
      fs.rmSync(themeDir, { recursive: true, force: true });
    }
  });
});
