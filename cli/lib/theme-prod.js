const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { runSync, runNodeScript, resolveCliScript } = require('./spawn');
const { getThemeBin, resolveProjectRoot } = require('./paths');
const { readActiveThemeManifest, resolveThemeDirectory } = require('./theme-runtime');
const { t } = require('./i18n');
const { resolveBuildNodeEnv } = require('./prod-memory');

function resolveProductionThemeEnv(projectRoot, themeDir) {
  const nginxEntry = (
    process.env.REACTPRESS_NGINX_ENTRY_URL ||
    process.env.NGINX_ENTRY_URL ||
    'http://localhost'
  ).replace(/\/$/, '');
  const visitorPort =
    process.env.CLIENT_PORT || process.env.PORT || process.env.REACTPRESS_VISITOR_INTERNAL_PORT || '13001';
  const apiPort =
    process.env.SERVER_PORT || process.env.REACTPRESS_API_INTERNAL_PORT || '13002';

  return {
    ...process.env,
    NODE_ENV: 'production',
    REACTPRESS_ORIGINAL_CWD: projectRoot,
    REACTPRESS_THEME_DIR: themeDir,
    PORT: String(visitorPort),
    CLIENT_PORT: String(visitorPort),
    NGINX_ENTRY_URL: nginxEntry,
    REACTPRESS_NGINX_ENTRY_URL: nginxEntry,
    REACTPRESS_API_URL: process.env.REACTPRESS_API_URL || `http://127.0.0.1:${apiPort}/api`,
    SERVER_API_URL: process.env.SERVER_API_URL || `http://127.0.0.1:${apiPort}/api`,
    NEXT_PUBLIC_REACTPRESS_API_URL:
      process.env.NEXT_PUBLIC_REACTPRESS_API_URL || `${nginxEntry}/api`,
    NEXT_PUBLIC_REACTPRESS_ADMIN_URL:
      process.env.NEXT_PUBLIC_REACTPRESS_ADMIN_URL || `${nginxEntry}/admin`,
  };
}

function resolveThemeClientBin(projectRoot, themeDir) {
  const themeBin = path.join(themeDir, 'bin', 'reactpress-client.js');
  if (fs.existsSync(themeBin)) return themeBin;
  const generic = resolveCliScript('bin/reactpress-theme-client.js');
  if (fs.existsSync(generic)) return generic;
  throw new Error(`Theme entry not found under ${themeDir}`);
}

const LAUNCH_FILE_REL_PATHS = [
  'server.js',
  path.join('scripts', 'ensure-typescript-for-next.js'),
];

function syncThemeLaunchFilesFromTemplate(projectRoot, themeId, themeDir) {
  const templateDir = path.join(resolveProjectRoot(projectRoot), 'themes', themeId);
  if (!templateDir || !fs.existsSync(templateDir)) return;
  if (path.resolve(templateDir) === path.resolve(themeDir)) return;

  for (const rel of LAUNCH_FILE_REL_PATHS) {
    const src = path.join(templateDir, rel);
    const dest = path.join(themeDir, rel);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }

  const templatePkg = path.join(templateDir, 'package.json');
  const destPkg = path.join(themeDir, 'package.json');
  if (fs.existsSync(templatePkg) && fs.existsSync(destPkg)) {
    try {
      const srcScripts = JSON.parse(fs.readFileSync(templatePkg, 'utf8')).scripts || {};
      const destPkgJson = JSON.parse(fs.readFileSync(destPkg, 'utf8'));
      destPkgJson.scripts = { ...destPkgJson.scripts, start: srcScripts.start, dev: srcScripts.dev };
      fs.writeFileSync(destPkg, `${JSON.stringify(destPkgJson, null, 2)}\n`, 'utf8');
    } catch {
      // ignore corrupt package.json
    }
  }
}

const BUILD_STAMP_REL = path.join('.next', '.reactpress-theme-id');

function writeThemeBuildStamp(themeDir, themeId) {
  const stampPath = path.join(themeDir, BUILD_STAMP_REL);
  fs.mkdirSync(path.dirname(stampPath), { recursive: true });
  fs.writeFileSync(stampPath, themeId, 'utf8');
}

function newestSourceMtime(rootDir, depth = 0) {
  if (!fs.existsSync(rootDir)) return 0;
  let max = 0;
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue;
    const full = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      if (depth < 10) max = Math.max(max, newestSourceMtime(full, depth + 1));
      continue;
    }
    if (entry.isFile()) max = Math.max(max, fs.statSync(full).mtimeMs);
  }
  return max;
}

function themeSourcesNewerThanBuild(themeDir) {
  const buildMarker = path.join(themeDir, '.next', 'BUILD_ID');
  if (!fs.existsSync(buildMarker)) return true;
  const buildMtime = fs.statSync(buildMarker).mtimeMs;
  for (const rel of ['pages', 'src', 'public', 'theme.json', 'package.json', 'next.config.js']) {
    const target = path.join(themeDir, rel);
    if (!fs.existsSync(target)) continue;
    const stat = fs.statSync(target);
    const mtime = stat.isDirectory() ? newestSourceMtime(target) : stat.mtimeMs;
    if (mtime > buildMtime) return true;
  }
  return false;
}

function hasUsableProductionBuild(themeDir, themeId) {
  if (process.env.REACTPRESS_FORCE_THEME_BUILD === '1') return false;
  const nextDir = path.join(themeDir, '.next');
  if (!fs.existsSync(path.join(nextDir, 'BUILD_ID'))) return false;
  if (!fs.existsSync(path.join(nextDir, 'server'))) return false;
  const stampPath = path.join(themeDir, BUILD_STAMP_REL);
  if (!fs.existsSync(stampPath)) return false;
  try {
    if (fs.readFileSync(stampPath, 'utf8').trim() !== themeId) return false;
  } catch {
    return false;
  }
  if (themeSourcesNewerThanBuild(themeDir)) return false;
  return true;
}

function readActiveThemeBuildState(projectRoot) {
  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
  if (!themeDir || !fs.existsSync(path.join(themeDir, 'package.json'))) {
    return null;
  }
  return { activeTheme, themeDir };
}

function buildActiveTheme(projectRoot, { force = false } = {}) {
  const state = readActiveThemeBuildState(projectRoot);
  if (!state) {
    const { activeTheme } = readActiveThemeManifest(projectRoot);
    const err = new Error(`Active theme not found: ${activeTheme}`);
    err.code = 'REACTPRESS_THEME_NOT_FOUND';
    throw err;
  }
  const { activeTheme, themeDir } = state;

  syncThemeLaunchFilesFromTemplate(projectRoot, activeTheme, themeDir);

  if (!force && hasUsableProductionBuild(themeDir, activeTheme)) {
    console.log(`[reactpress] ${t('themeProd.reusingBuild', { id: activeTheme })}`);
    return { activeTheme, themeDir, skippedBuild: true };
  }

  console.log(`[reactpress] ${t('themeProd.building', { id: activeTheme })}`);
  runSync('pnpm', ['run', 'build'], {
    cwd: themeDir,
    env: resolveBuildNodeEnv({
      ...resolveProductionThemeEnv(projectRoot, themeDir),
      REACTPRESS_BUILD_ACTIVE: '1',
    }),
  });
  writeThemeBuildStamp(themeDir, activeTheme);
  return { activeTheme, themeDir, skippedBuild: false };
}

/**
 * Rebuild active theme and restart PM2 visitor process (production deploy).
 */
async function restartProductionVisitorClient(projectRoot = resolveProjectRoot()) {
  const { activeTheme, themeDir } = buildActiveTheme(projectRoot);
  const bin = resolveThemeClientBin(projectRoot, themeDir);
  const env = resolveProductionThemeEnv(projectRoot, themeDir);

  spawnSync('pm2', ['delete', 'reactpress-client'], { stdio: 'ignore' });
  spawnSync('pm2', ['delete', '@fecommunity/reactpress-template-twentytwentyfive'], {
    stdio: 'ignore',
  });
  spawnSync('pm2', ['delete', '@fecommunity/reactpress-template-hello-world'], {
    stdio: 'ignore',
  });

  console.log(`[reactpress] ${t('themeProd.restarting', { id: activeTheme })}`);
  await runNodeScript(bin, ['--pm2'], { cwd: projectRoot, env });
  console.log(`[reactpress] ${t('themeProd.restarted', { id: activeTheme })}`);
}

module.exports = {
  buildActiveTheme,
  restartProductionVisitorClient,
  resolveProductionThemeEnv,
  hasUsableProductionBuild,
  readActiveThemeBuildState,
  writeThemeBuildStamp,
};
