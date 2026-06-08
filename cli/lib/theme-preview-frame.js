const fs = require('fs');
const path = require('path');

const PATCH_MARKER = '.reactpress-preview-frame-patched';
const X_FRAME_OPTIONS_RE =
  /\{\s*key:\s*['"]X-Frame-Options['"],\s*value:\s*['"]SAMEORIGIN['"]\s*\},?\s*\n?/g;

const X_FRAME_OPTIONS_PATCH = `...(process.env.REACTPRESS_HONOR_PREVIEW === '1'
            ? []
            : [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }]),
          `;

/**
 * Admin preview iframes load :3003 from a different origin than /admin/.
 * Drop X-Frame-Options for preview dev only (REACTPRESS_HONOR_PREVIEW=1).
 */
function ensurePreviewFrameAllowed(themeDir) {
  if (!themeDir || !fs.existsSync(themeDir)) return false;

  const markerPath = path.join(themeDir, PATCH_MARKER);
  const configPath = path.join(themeDir, 'next.config.js');
  const configMjsPath = path.join(themeDir, 'next.config.mjs');

  const target = fs.existsSync(configPath)
    ? configPath
    : fs.existsSync(configMjsPath)
      ? configMjsPath
      : null;

  if (!target) return false;
  if (fs.existsSync(markerPath)) return true;

  let src = fs.readFileSync(target, 'utf8');
  if (!X_FRAME_OPTIONS_RE.test(src)) {
    fs.writeFileSync(markerPath, `${new Date().toISOString()}\n`, 'utf8');
    return false;
  }

  X_FRAME_OPTIONS_RE.lastIndex = 0;
  if (src.includes('REACTPRESS_HONOR_PREVIEW')) {
    fs.writeFileSync(markerPath, `${new Date().toISOString()}\n`, 'utf8');
    return true;
  }

  const next = src.replace(X_FRAME_OPTIONS_RE, X_FRAME_OPTIONS_PATCH);
  if (next === src) return false;

  fs.writeFileSync(target, next, 'utf8');
  fs.writeFileSync(markerPath, `${new Date().toISOString()}\n`, 'utf8');
  return true;
}

module.exports = {
  PATCH_MARKER,
  ensurePreviewFrameAllowed,
};
