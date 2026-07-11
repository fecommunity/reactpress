import fs from 'fs-extra';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const ADMIN_REWRITES_MARKER = 'reactpress-admin-rewrites';

function getCliPackageRoot(): string {
  return path.join(__dirname, '..', '..', '..');
}

export function resolveBundledAdminDistDir(): string | null {
  const bundled = path.join(getCliPackageRoot(), 'admin-dist', 'index.html');
  return fs.existsSync(bundled) ? path.dirname(bundled) : null;
}

export function resolveWebPackageRoot(projectRoot: string): string | null {
  for (const candidate of [path.join(projectRoot, 'web'), path.join(projectRoot, '..', 'web')]) {
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
  }
  return null;
}

function readAdminMainAssetId(indexHtmlPath: string): string | null {
  try {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    return html.match(/assets\/(index-[^"]+\.js)/)?.[1] ?? null;
  } catch {
    return null;
  }
}

function resolveAdminDistSource(projectRoot: string): string | null {
  const bundled = resolveBundledAdminDistDir();
  const webRoot = resolveWebPackageRoot(projectRoot);
  const webDist = webRoot ? path.join(webRoot, 'dist') : null;
  const webIndex = webDist ? path.join(webDist, 'index.html') : null;

  if (webIndex && fs.existsSync(webIndex)) {
    if (!bundled) return webDist;
    const bundledIndex = path.join(bundled, 'index.html');
    const webMtime = fs.statSync(webIndex).mtimeMs;
    const bundledMtime = fs.statSync(bundledIndex).mtimeMs;
    return webMtime >= bundledMtime ? webDist : bundled;
  }

  return bundled;
}

/** True when CLI/web admin-dist is newer than the theme's copied public/admin bundle. */
export function adminSourceIsNewerThanTheme(projectRoot: string, themeDir: string): boolean {
  const source = resolveAdminDistSource(projectRoot);
  const sourceIndex = source ? path.join(source, 'index.html') : null;
  const themeAdminIndex = path.join(themeDir, 'public', 'admin', 'index.html');
  if (!sourceIndex || !fs.existsSync(sourceIndex)) return false;
  if (!fs.existsSync(themeAdminIndex)) return true;

  const sourceId = readAdminMainAssetId(sourceIndex);
  const themeId = readAdminMainAssetId(themeAdminIndex);
  if (sourceId && themeId) return sourceId !== themeId;

  return fs.statSync(sourceIndex).mtimeMs > fs.statSync(themeAdminIndex).mtimeMs;
}

function syncDirToPublicAdmin(sourceDist: string, themeDir: string): string {
  const target = path.join(themeDir, 'public', 'admin');
  fs.removeSync(target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copySync(sourceDist, target);
  return target;
}

function removeReactpressAdminMiddleware(themeDir: string): void {
  for (const name of ['middleware.js', 'middleware.mjs']) {
    const filePath = path.join(themeDir, name);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('reactpress-admin-middleware')) {
      fs.removeSync(filePath);
    }
  }
}

/** Patch theme next.config.js with afterFiles admin SPA rewrites. */
export function ensureAdminRewritesInNextConfig(themeDir: string): boolean {
  const configCandidates = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
  const configPath = configCandidates
    .map((name) => path.join(themeDir, name))
    .find((candidate) => fs.existsSync(candidate));
  if (!configPath) return false;

  let src = fs.readFileSync(configPath, 'utf8');
  if (src.includes(ADMIN_REWRITES_MARKER)) return false;

  const arrayReturn = /async rewrites\(\)\s*\{\s*return (\[[\s\S]*?\])\s*\}/m.exec(src);
  if (!arrayReturn) {
    console.warn('[ReactPress Client] Could not patch next.config rewrites() for admin SPA');
    return false;
  }

  const replacement = `async rewrites() {
    // ${ADMIN_REWRITES_MARKER}
    return {
      beforeFiles: ${arrayReturn[1]},
      afterFiles: [
        { source: '/admin', destination: '/admin/index.html' },
        { source: '/admin/:path*', destination: '/admin/index.html' },
      ],
    };
  }`;

  src = src.replace(arrayReturn[0], replacement);
  fs.writeFileSync(configPath, src, 'utf8');
  removeReactpressAdminMiddleware(themeDir);
  return true;
}

function finalizeAdminThemeSetup(themeDir: string): boolean {
  return ensureAdminRewritesInNextConfig(themeDir);
}

function syncAdminFromWeb(projectRoot: string, themeDir: string): boolean {
  const webRoot = resolveWebPackageRoot(projectRoot);
  if (!webRoot) return false;

  const webDist = path.join(webRoot, 'dist', 'index.html');
  if (!fs.existsSync(webDist)) {
    console.log('[ReactPress Client] Building admin SPA (web/)…');
    const buildWeb = spawnSync('pnpm', ['run', 'build'], { cwd: webRoot, stdio: 'inherit' });
    if (buildWeb.status !== 0) process.exit(buildWeb.status || 1);
  }

  const syncScript = path.join(webRoot, 'bin', 'reactpress-web.js');
  const publicAdmin = path.join(themeDir, 'public', 'admin');
  console.log('[ReactPress Client] Syncing admin static → theme public/admin…');
  const sync = spawnSync(process.execPath, [syncScript, 'sync-public', publicAdmin], {
    stdio: 'inherit',
    cwd: webRoot,
  });
  if (sync.status !== 0) process.exit(sync.status || 1);
  return finalizeAdminThemeSetup(themeDir) || true;
}

function syncAdminFromSource(sourceDist: string, themeDir: string): boolean {
  console.log('[ReactPress Client] Syncing bundled admin static → theme public/admin…');
  syncDirToPublicAdmin(sourceDist, themeDir);
  return finalizeAdminThemeSetup(themeDir) || true;
}

/** Returns true when admin static or rewrites were newly applied (theme rebuild recommended). */
export function ensureAdminStaticForTheme(projectRoot: string, themeDir: string): boolean {
  const adminIndex = path.join(themeDir, 'public', 'admin', 'index.html');
  const needsResync = !fs.existsSync(adminIndex) || adminSourceIsNewerThanTheme(projectRoot, themeDir);

  if (!needsResync) {
    return finalizeAdminThemeSetup(themeDir);
  }

  const source = resolveAdminDistSource(projectRoot);
  if (source && fs.existsSync(path.join(source, 'index.html'))) {
    const webRoot = resolveWebPackageRoot(projectRoot);
    if (webRoot && path.resolve(source) === path.resolve(path.join(webRoot, 'dist'))) {
      return syncAdminFromWeb(projectRoot, themeDir);
    }
    return syncAdminFromSource(source, themeDir);
  }

  if (syncAdminFromWeb(projectRoot, themeDir)) {
    return true;
  }

  console.warn('[ReactPress Client] Admin static missing and bundled admin-dist not found');
  return false;
}

export function shouldRebuildThemeAfterAdminSync(themeDir: string): boolean {
  const adminIndex = path.join(themeDir, 'public', 'admin', 'index.html');
  const nextDir = path.join(themeDir, '.next');
  const configPath = path.join(themeDir, 'next.config.js');
  if (!fs.existsSync(adminIndex)) return false;
  if (!fs.existsSync(nextDir)) return true;

  const adminMtime = fs.statSync(adminIndex).mtimeMs;
  const nextMtime = fs.statSync(nextDir).mtimeMs;
  if (adminMtime > nextMtime) return true;

  if (fs.existsSync(configPath)) {
    const configMtime = fs.statSync(configPath).mtimeMs;
    if (configMtime > nextMtime && fs.readFileSync(configPath, 'utf8').includes(ADMIN_REWRITES_MARKER)) {
      return true;
    }
  }
  return false;
}
