/**
 * Ensure dist/starter.js exists before `nest start --watch`.
 * If dist was wiped while watch was running, incremental build may emit .d.ts only.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const starterJs = path.join(root, 'dist/starter.js');

if (fs.existsSync(starterJs)) {
  process.exit(0);
}

const tsbuildinfo = path.join(root, 'dist/tsconfig.build.tsbuildinfo');
if (fs.existsSync(tsbuildinfo)) {
  fs.unlinkSync(tsbuildinfo);
}

console.log('[reactpress-server] dist/starter.js missing — running nest build…');
execSync('npm run build', { cwd: root, stdio: 'inherit' });

if (!fs.existsSync(starterJs)) {
  console.error('[reactpress-server] build finished but dist/starter.js is still missing');
  process.exit(1);
}
