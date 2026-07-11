#!/usr/bin/env node
/**
 * Copy core CLI runtime (dist, server, templates) from the legacy npm package
 * so @fecommunity/reactpress-cli can be published as a self-contained package.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.join(__dirname, '..');
const require = createRequire(import.meta.url);

const LEGACY_PKG = '@fecommunity/reactpress-cli-core';

const SKIP_DIRS = new Set(['node_modules', '.git', 'logs', '.reactpress']);
const SKIP_FILES = new Set(['package-lock.json']);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
    if (!entry.isDirectory() && SKIP_FILES.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function main() {
  let legacyRoot;
  try {
    legacyRoot = path.dirname(require.resolve(`${LEGACY_PKG}/package.json`));
  } catch {
    console.warn(
      `[sync-bundled-core] Skip: install devDependency ${LEGACY_PKG} (npm:@fecommunity/reactpress-cli@0.1.0) first`
    );
    process.exit(0);
  }

  const entries = ['dist', 'server', 'templates', 'scripts'];
  for (const name of entries) {
    const src = path.join(legacyRoot, name);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(cliRoot, name);
    copyDir(src, dest);
    console.log(`[sync-bundled-core] ${name}/ -> cli/${name}/`);
  }

  // Copy LICENSE only. Do not sync README.md — legacy @fecommunity/reactpress-cli-core
  // ships a Chinese README that would overwrite the v4 English package docs on every prepare/prepack.
  for (const file of ['LICENSE']) {
    const src = path.join(legacyRoot, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(cliRoot, file));
    }
  }

  const distPkg = path.join(cliRoot, 'dist', 'package.json');
  fs.writeFileSync(distPkg, JSON.stringify({ type: 'module' }, null, 2) + '\n');

  // Keep ESM bridge to CommonJS i18n (not shipped in legacy package)
  const i18nBridge = path.join(cliRoot, 'dist', 'i18n.js');
  if (!fs.existsSync(i18nBridge)) {
    fs.writeFileSync(
      i18nBridge,
      `import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { t, getLocale, setLocale } = require(join(dirname(fileURLToPath(import.meta.url)), '..', 'out', 'lib', 'i18n', 'index.js'));

export { t, getLocale, setLocale };
`
    );
    console.log('[sync-bundled-core] restored dist/i18n.js bridge');
  }
}

main();
