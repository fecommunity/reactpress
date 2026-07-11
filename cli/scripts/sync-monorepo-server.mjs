#!/usr/bin/env node
/**
 * Copy built API from monorepo `server/` into `cli/server/` for publish.
 * Runs after sync-bundled-core so security fixes in server/ ship with @fecommunity/reactpress.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.join(__dirname, '..');
const repoRoot = path.join(cliRoot, '..');
const monorepoServer = path.join(repoRoot, 'server');
const bundledServer = path.join(cliRoot, 'server');

const SKIP_DIRS = new Set(['node_modules', 'logs', 'uploads', '.reactpress']);
const SKIP_FILES = new Set(['tsconfig.build.tsbuildinfo', 'tsconfig.tsbuildinfo']);

function copyDir(src, dest, options = {}) {
  const skipDirs = options.skipDirs ?? SKIP_DIRS;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    if (!entry.isDirectory() && SKIP_FILES.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to, options);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

function replaceDir(src, dest, options = {}) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  copyDir(src, dest, options);
}

function main() {
  const distMain = path.join(monorepoServer, 'dist', 'main.js');
  if (!fs.existsSync(distMain)) {
    console.warn('[sync-monorepo-server] Skip: build server first (pnpm run build --dir server)');
    process.exit(0);
  }

  replaceDir(path.join(monorepoServer, 'dist'), path.join(bundledServer, 'dist'), {
    skipDirs: new Set([...SKIP_DIRS, 'public']),
  });
  replaceDir(path.join(monorepoServer, 'public'), path.join(bundledServer, 'public'));
  replaceDir(path.join(monorepoServer, 'bin'), path.join(bundledServer, 'bin'));

  const serverPkg = path.join(monorepoServer, 'package.json');
  if (fs.existsSync(serverPkg)) {
    const pkg = JSON.parse(fs.readFileSync(serverPkg, 'utf8'));
    if (pkg.dependencies?.['@fecommunity/reactpress-toolkit']?.startsWith('workspace:')) {
      pkg.dependencies['@fecommunity/reactpress-toolkit'] = 'file:../toolkit';
    }
    fs.writeFileSync(
      path.join(bundledServer, 'package.json'),
      `${JSON.stringify(pkg, null, 2)}\n`,
    );
  }

  console.log('[sync-monorepo-server] server/dist|public|bin|package.json -> cli/server/');
}

main();
