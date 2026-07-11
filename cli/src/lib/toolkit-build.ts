// @ts-nocheck
const fs = require('fs');
const path = require('path');

const SOURCE_EXT = /\.(ts|tsx|js|json)$/;

function newestSourceMtime(dir, depth = 0) {
  if (!fs.existsSync(dir)) return 0;
  let max = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (depth < 12) max = Math.max(max, newestSourceMtime(full, depth + 1));
      continue;
    }
    if (!SOURCE_EXT.test(entry.name)) continue;
    max = Math.max(max, fs.statSync(full).mtimeMs);
  }
  return max;
}

/**
 * Whether `pnpm run build` in toolkit/ is needed before dev.
 * Skips when dist is newer than all toolkit/src sources (unless forced).
 */
function shouldBuildToolkit(projectRoot) {
  if (process.env.REACTPRESS_FORCE_TOOLKIT_BUILD === '1') return true;
  if (process.env.REACTPRESS_SKIP_TOOLKIT_BUILD === '1') return false;

  const toolkitDir = path.join(path.resolve(projectRoot), 'toolkit');
  const distEntry = path.join(toolkitDir, 'dist', 'index.js');
  if (!fs.existsSync(distEntry)) return true;

  const srcDir = path.join(toolkitDir, 'src');
  if (!fs.existsSync(srcDir)) return false;

  const distMtime = fs.statSync(distEntry).mtimeMs;
  const localesDir = path.join(toolkitDir, 'src', 'config', 'locales');
  const localesDist = path.join(toolkitDir, 'dist', 'config', 'locales');
  if (fs.existsSync(localesDir)) {
    const localesMtime = newestSourceMtime(localesDir);
    if (!fs.existsSync(localesDist) || localesMtime > fs.statSync(localesDist).mtimeMs) {
      return true;
    }
  }

  return newestSourceMtime(srcDir) > distMtime;
}

module.exports = {
  shouldBuildToolkit,
  newestSourceMtime,
};
