const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  ensurePreviewFrameAllowed,
  stripBakedFrameOptionsFromBuild,
  shouldHonorThemePreviewFrame,
  PATCH_MARKER,
} = require('../out/lib/theme-preview-frame');

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

  it('strips baked X-Frame-Options from routes-manifest.json', () => {
    const themeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reactpress-frame-manifest-'));
    try {
      const distDir = '.next-preview';
      const manifestDir = path.join(themeDir, distDir);
      fs.mkdirSync(manifestDir, { recursive: true });
      fs.writeFileSync(
        path.join(manifestDir, 'routes-manifest.json'),
        `${JSON.stringify(
          {
            headers: [
              {
                source: '/:path*',
                headers: [
                  { key: 'X-Content-Type-Options', value: 'nosniff' },
                  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                ],
              },
            ],
          },
          null,
          2,
        )}\n`,
      );

      assert.equal(stripBakedFrameOptionsFromBuild(themeDir, distDir), true);
      const parsed = JSON.parse(
        fs.readFileSync(path.join(manifestDir, 'routes-manifest.json'), 'utf8'),
      );
      const keys = parsed.headers[0].headers.map((h) => h.key);
      assert.deepEqual(keys, ['X-Content-Type-Options']);
      assert.equal(stripBakedFrameOptionsFromBuild(themeDir, distDir), false);
    } finally {
      fs.rmSync(themeDir, { recursive: true, force: true });
    }
  });

  it('detects desktop local preview frame mode', () => {
    const prev = process.env.REACTPRESS_DESKTOP_LOCAL;
    process.env.REACTPRESS_DESKTOP_LOCAL = '1';
    try {
      assert.equal(shouldHonorThemePreviewFrame(), true);
    } finally {
      if (prev === undefined) delete process.env.REACTPRESS_DESKTOP_LOCAL;
      else process.env.REACTPRESS_DESKTOP_LOCAL = prev;
    }
  });
});
