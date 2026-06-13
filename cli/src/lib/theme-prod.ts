// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { runSync, runNodeScript, resolveCliScript } = require('./spawn');
const { getThemeBin, resolveProjectRoot } = require('./paths');
const {
  readActiveThemeManifest,
  resolveThemeDirectory,
  listAvailableThemeIds,
} = require('./theme-runtime');
const { t } = require('./i18n');
const { resolveBuildNodeEnv } = require('./prod-memory');
const { shouldHonorThemePreviewFrame } = require('./theme-preview-frame');

function resolveProductionThemeEnv(projectRoot, themeDir) {
  const nginxEntry = (
    process.env.REACTPRESS_NGINX_ENTRY_URL ||
    process.env.NGINX_ENTRY_URL ||
    'http://localhost'
  ).replace(/\/$/, '');
  const visitorPort =
    process.env.CLIENT_PORT || process.env.PORT || '3001';
  const serverApiUrl =
    process.env.REACTPRESS_THEME_API_URL ||
    process.env.SERVER_API_URL ||
    process.env.REACTPRESS_API_URL ||
    `${nginxEntry}/api`;
  const publicApiUrl =
    process.env.REACTPRESS_THEME_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_REACTPRESS_API_URL ||
    `${nginxEntry}/api`;

  const clientSiteUrl =
    process.env.CLIENT_SITE_URL?.trim() || `http://127.0.0.1:${visitorPort}`;

  return {
    ...process.env,
    NODE_ENV: 'production',
    REACTPRESS_ORIGINAL_CWD: projectRoot,
    REACTPRESS_THEME_DIR: themeDir,
    PORT: String(visitorPort),
    CLIENT_PORT: String(visitorPort),
    CLIENT_SITE_URL: clientSiteUrl,
    NGINX_ENTRY_URL: nginxEntry,
    REACTPRESS_NGINX_ENTRY_URL: nginxEntry,
    REACTPRESS_API_URL: serverApiUrl,
    SERVER_API_URL: serverApiUrl,
    NEXT_PUBLIC_REACTPRESS_API_URL: publicApiUrl,
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

const PREVIEW_DIST_DIR = '.next-preview';
const BUILD_STAMP_REL = path.join('.next', '.reactpress-theme-id');

function resolveBuildDistDir(options = {}) {
  return options.distDir || '.next';
}

function buildStampRel(distDir) {
  return path.join(distDir, '.reactpress-theme-id');
}

function writeThemeBuildStamp(themeDir, themeId, options = {}) {
  const distDir = resolveBuildDistDir(options);
  const stampPath = path.join(themeDir, buildStampRel(distDir));
  fs.mkdirSync(path.dirname(stampPath), { recursive: true });
  fs.writeFileSync(stampPath, themeId, 'utf8');
}

function newestSourceMtime(rootDir, depth = 0) {
  if (!fs.existsSync(rootDir)) return 0;
  let max = 0;
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === PREVIEW_DIST_DIR) {
      continue;
    }
    const full = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      if (depth < 10) max = Math.max(max, newestSourceMtime(full, depth + 1));
      continue;
    }
    if (entry.isFile()) max = Math.max(max, fs.statSync(full).mtimeMs);
  }
  return max;
}

/** Post-build artifacts — not source changes; ignored when comparing freshness. */
const GENERATED_PUBLIC_FILES = new Set([
  'robots.txt',
  'sitemap.xml',
  'sitemap-0.xml',
  'sitemap-1.xml',
]);

function themeSourcesNewerThanBuild(themeDir, distDir = '.next') {
  const stampPath = path.join(themeDir, buildStampRel(distDir));
  if (!fs.existsSync(stampPath)) return true;
  const buildMtime = fs.statSync(stampPath).mtimeMs;

  for (const rel of [
    'app',
    'pages',
    'src',
    'public',
    'theme.json',
    'package.json',
    'next.config.js',
  ]) {
    const target = path.join(themeDir, rel);
    if (!fs.existsSync(target)) continue;
    const stat = fs.statSync(target);
    if (stat.isDirectory()) {
      if (rel === 'public') {
        for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
          if (!entry.isFile() || GENERATED_PUBLIC_FILES.has(entry.name)) continue;
          if (fs.statSync(path.join(target, entry.name)).mtimeMs > buildMtime) return true;
        }
        continue;
      }
      if (newestSourceMtime(target) > buildMtime) return true;
      continue;
    }
    if (stat.mtimeMs > buildMtime) return true;
  }
  return false;
}

function hasProductionBuildArtifacts(nextDir) {
  if (fs.existsSync(path.join(nextDir, 'BUILD_ID'))) return true;
  // Next 12 Pages Router — no BUILD_ID at dist root
  return fs.existsSync(path.join(nextDir, 'server', 'pages-manifest.json'));
}

function hasUsableProductionBuild(themeDir, themeId, options = {}) {
  if (process.env.REACTPRESS_FORCE_THEME_BUILD === '1') return false;
  const distDir = resolveBuildDistDir(options);
  const nextDir = path.join(themeDir, distDir);
  if (!hasProductionBuildArtifacts(nextDir)) return false;
  if (!fs.existsSync(path.join(nextDir, 'server'))) return false;
  const stampPath = path.join(themeDir, buildStampRel(distDir));
  if (!fs.existsSync(stampPath)) return false;
  try {
    if (fs.readFileSync(stampPath, 'utf8').trim() !== themeId) return false;
  } catch {
    return false;
  }
  if (themeSourcesNewerThanBuild(themeDir, distDir)) return false;
  return true;
}

function resolvePreviewThemeEnv(projectRoot, themeDir, port, options = {}) {
  const distDir = resolveBuildDistDir(options);
  const base = resolveProductionThemeEnv(projectRoot, themeDir);
  let clientSiteUrl = base.CLIENT_SITE_URL;
  try {
    const url = new URL(clientSiteUrl || 'http://127.0.0.1:3001');
    url.port = String(port);
    clientSiteUrl = url.origin;
  } catch {
    clientSiteUrl = `http://127.0.0.1:${port}`;
  }
  return {
    ...base,
    NODE_ENV: options.mode === 'dev' ? 'development' : 'production',
    INIT_CWD: themeDir,
    NEXT_DIST_DIR: distDir,
    PORT: String(port),
    CLIENT_PORT: String(port),
    CLIENT_SITE_URL: clientSiteUrl,
  };
}

function ensureThemeDependenciesInstalled(projectRoot, themeDir, themeId, logPrefix = 'themePreview') {
  const nextModule = path.join(themeDir, 'node_modules', 'next');
  if (fs.existsSync(nextModule)) return;

  const { installThemeDependencies } = require('./theme-install');
  const installingKey =
    logPrefix === 'themePreview' ? 'themePreview.installingDeps' : 'themeProd.installingDeps';
  console.log(`[reactpress] ${t(installingKey, { id: themeId })}`);
  installThemeDependencies(themeDir, projectRoot);
}

function resolveThemeBuildState(projectRoot, themeId) {
  const themeDir = resolveThemeDirectory(projectRoot, themeId);
  if (!themeDir || !fs.existsSync(path.join(themeDir, 'package.json'))) {
    return null;
  }
  return { themeId, themeDir };
}

function readActiveThemeBuildState(projectRoot) {
  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const state = resolveThemeBuildState(projectRoot, activeTheme);
  if (!state) return null;
  return { activeTheme, themeDir: state.themeDir };
}

/** @type {Promise<unknown>} */
let themeBuildChain = Promise.resolve();

function doBuildThemeSync(
  projectRoot,
  themeId,
  { force = false, logPrefix = 'themeProd', distDir } = {},
) {
  const state = resolveThemeBuildState(projectRoot, themeId);
  if (!state) {
    const err = new Error(`Theme not found: ${themeId}`);
    err.code = 'REACTPRESS_THEME_NOT_FOUND';
    throw err;
  }
  const { themeDir } = state;
  const buildDistDir =
    distDir || (logPrefix === 'themePreview' ? PREVIEW_DIST_DIR : '.next');

  if (!force && hasUsableProductionBuild(themeDir, themeId, { distDir: buildDistDir })) {
    if (logPrefix === 'themePreview') {
      console.log(`[reactpress] ${t('themePreview.reusingBuild', { id: themeId })}`);
    } else {
      console.log(`[reactpress] ${t('themeProd.reusingBuild', { id: themeId })}`);
    }
    return { themeId, themeDir, skippedBuild: true };
  }

  syncThemeLaunchFilesFromTemplate(projectRoot, themeId, themeDir);
  ensureThemeDependenciesInstalled(projectRoot, themeDir, themeId, logPrefix);

  const buildingKey =
    logPrefix === 'themePreview' ? 'themePreview.building' : 'themeProd.building';
  console.log(`[reactpress] ${t(buildingKey, { id: themeId })}`);
  runSync('pnpm', ['run', 'build'], {
    cwd: themeDir,
    env: resolveBuildNodeEnv({
      ...resolveProductionThemeEnv(projectRoot, themeDir),
      NEXT_DIST_DIR: buildDistDir,
      ...(logPrefix === 'themeProd' ? { REACTPRESS_BUILD_ACTIVE: '1' } : {}),
      ...(shouldHonorThemePreviewFrame() || logPrefix === 'themePreview'
        ? { REACTPRESS_HONOR_PREVIEW: '1' }
        : {}),
    }),
  });
  if (shouldHonorThemePreviewFrame() || logPrefix === 'themePreview') {
    const { stripBakedFrameOptionsFromBuild } = require('./theme-preview-frame');
    stripBakedFrameOptionsFromBuild(themeDir, buildDistDir);
  }
  writeThemeBuildStamp(themeDir, themeId, { distDir: buildDistDir });
  return { themeId, themeDir, skippedBuild: false };
}

function enqueueThemeBuild(projectRoot, themeId, options = {}) {
  const task = themeBuildChain.then(() => doBuildThemeSync(projectRoot, themeId, options));
  themeBuildChain = task.catch(() => {});
  return task;
}

function buildTheme(projectRoot, themeId, options = {}) {
  return doBuildThemeSync(projectRoot, themeId, options);
}

function buildActiveTheme(projectRoot, { force = false } = {}) {
  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const result = doBuildThemeSync(projectRoot, activeTheme, { force, logPrefix: 'themeProd' });
  return { activeTheme, themeDir: result.themeDir, skippedBuild: result.skippedBuild };
}

function scheduleBackgroundThemeBuilds(projectRoot, { excludeThemeId } = {}) {
  if (process.env.REACTPRESS_SKIP_PREVIEW_BUILD === '1') return;

  const activeTheme =
    excludeThemeId || readActiveThemeManifest(projectRoot).activeTheme;
  const themeIds = listAvailableThemeIds(projectRoot).filter((id) => id !== activeTheme);
  if (themeIds.length === 0) return;

  console.log(
    `[reactpress] ${t('themePreview.backgroundBuildScheduled', { count: themeIds.length })}`,
  );

  setImmediate(() => {
    void warmupAllPreviewThemeBuilds(projectRoot, { themeIds }).catch(() => {});
  });
}

/**
 * Pre-build `.next-preview` for catalog themes so admin preview switches stay under ~10s.
 * Runs builds in parallel (local/desktop dev only — awaited before the ready banner).
 */
async function warmupAllPreviewThemeBuilds(
  projectRoot,
  { themeIds, concurrency = 2 } = {},
) {
  if (process.env.REACTPRESS_SKIP_PREVIEW_BUILD === '1') return { built: 0, skipped: 0 };

  const ids = themeIds || listAvailableThemeIds(projectRoot);
  if (ids.length === 0) return { built: 0, skipped: 0 };

  const { mapWithConcurrency } = require('./theme-warmup');
  const limit = Math.max(
    1,
    parseInt(process.env.REACTPRESS_PREVIEW_BUILD_CONCURRENCY || String(concurrency), 10) ||
      concurrency,
  );

  console.log(`[reactpress] ${t('themePreview.warmingAll', { count: ids.length })}`);

  let built = 0;
  let skipped = 0;

  await mapWithConcurrency(ids, limit, async (themeId) => {
    const state = resolveThemeBuildState(projectRoot, themeId);
    if (!state) return;
    if (hasUsableProductionBuild(state.themeDir, themeId, { distDir: PREVIEW_DIST_DIR })) {
      skipped += 1;
      return;
    }
    try {
      const result = buildTheme(projectRoot, themeId, {
        logPrefix: 'themePreview',
        distDir: PREVIEW_DIST_DIR,
      });
      if (result.skippedBuild) skipped += 1;
      else {
        built += 1;
        console.log(`[reactpress] ${t('themePreview.buildDone', { id: themeId })}`);
      }
    } catch (err) {
      console.warn(
        `[reactpress] ${t('themePreview.buildFailed', {
          id: themeId,
          message: err.message || err,
        })}`,
      );
    }
  });

  if (skipped > 0) {
    console.log(`[reactpress] ${t('themePreview.warmingAllSkipped', { count: skipped })}`);
  }
  return { built, skipped };
}

/**
 * Rebuild active theme and restart PM2 visitor process (production deploy).
 */
async function restartProductionVisitorClient(projectRoot = resolveProjectRoot()) {
  const { activeTheme, themeDir } = buildActiveTheme(projectRoot);
  const bin = resolveThemeClientBin(projectRoot, themeDir);
  const env = resolveProductionThemeEnv(projectRoot, themeDir);

  spawnSync('pm2', ['delete', 'reactpress-client'], { stdio: 'ignore' });
  spawnSync('pm2', ['delete', '@fecommunity/reactpress-template-hello-world'], {
    stdio: 'ignore',
  });

  console.log(`[reactpress] ${t('themeProd.restarting', { id: activeTheme })}`);
  await runNodeScript(bin, ['--pm2'], { cwd: projectRoot, env });
  console.log(`[reactpress] ${t('themeProd.restarted', { id: activeTheme })}`);
}

module.exports = {
  PREVIEW_DIST_DIR,
  buildActiveTheme,
  buildTheme,
  enqueueThemeBuild,
  scheduleBackgroundThemeBuilds,
  warmupAllPreviewThemeBuilds,
  restartProductionVisitorClient,
  resolveProductionThemeEnv,
  resolvePreviewThemeEnv,
  ensureThemeDependenciesInstalled,
  hasUsableProductionBuild,
  readActiveThemeBuildState,
  resolveThemeBuildState,
  writeThemeBuildStamp,
};
