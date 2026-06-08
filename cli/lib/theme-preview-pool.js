const fs = require('fs');
const path = require('path');
const { spawnDevChild } = require('./dev-child-io');
const { loadClientSiteUrl, normalizeProbeUrl, probeHttp, waitForHttpOk } = require('./http');
const { isPortListening, killPortListeners } = require('./ports');
const {
  resolveThemeDirectory,
  isThemePackageDir,
  getPreviewThemePort,
} = require('./theme-runtime');
const {
  enqueueThemeBuild,
  resolvePreviewThemeEnv,
  ensureThemeDependenciesInstalled,
  PREVIEW_DIST_DIR,
} = require('./theme-prod');
const { warmupThemeHomepage } = require('./theme-warmup');
const { ensurePreviewFrameAllowed } = require('./theme-preview-frame');
const { t } = require('./i18n');

/** Single preview slot — production `next start` on demand (low memory). */
const PREVIEW_POOL_PORTS = [parseInt(getPreviewThemePort(), 10)];
const PREVIEW_POOL_MANIFEST = path.join('.reactpress', 'preview-pool.json');
const PREVIEW_READY_POLL_MS = 150;

/** @type {Map<string, { child: import('child_process').ChildProcess | null, port: number, lastUsed: number }>} */
const previewPool = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPreviewPoolManifestPath(projectRoot) {
  return path.join(projectRoot, PREVIEW_POOL_MANIFEST);
}

function getPreviewSiteUrlForPort(projectRoot, port) {
  try {
    const url = new URL(loadClientSiteUrl(projectRoot));
    url.port = String(port);
    return `${url.origin}/`;
  } catch {
    return `http://127.0.0.1:${port}/`;
  }
}

function readPreviewPoolManifest(projectRoot) {
  const manifestPath = getPreviewPoolManifestPath(projectRoot);
  if (!fs.existsSync(manifestPath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function writePreviewPoolManifest(projectRoot) {
  const manifestPath = getPreviewPoolManifestPath(projectRoot);
  const next = {};
  for (const [themeId, entry] of previewPool) {
    if (!entry?.port) continue;
    next[themeId] = {
      port: String(entry.port),
      url: getPreviewSiteUrlForPort(projectRoot, entry.port),
      updatedAt: new Date(entry.lastUsed || Date.now()).toISOString(),
    };
  }
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

async function isPreviewHomepageReady(projectRoot, port) {
  const url = `${getPreviewSiteUrlForPort(projectRoot, port).replace(/\/$/, '')}/`;
  const result = await probeHttp(normalizeProbeUrl(url), 1200);
  return result.ok;
}

function stopPreviewPoolChild(entry) {
  const child = entry?.child;
  if (!child || child.killed) {
    if (entry) entry.child = null;
    return;
  }
  const pid = child.pid;
  try {
    if (process.platform !== 'win32' && pid) {
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        child.kill('SIGTERM');
      }
    } else if (pid) {
      child.kill('SIGTERM');
    }
  } catch {
    // ignore
  }
  entry.child = null;
}

function stopPreviewPoolTheme(themeId) {
  const entry = previewPool.get(themeId);
  if (!entry) return;
  stopPreviewPoolChild(entry);
  previewPool.delete(themeId);
}

function stopAllPreviewPool(projectRoot) {
  for (const themeId of [...previewPool.keys()]) {
    stopPreviewPoolTheme(themeId);
  }
  const manifestPath = getPreviewPoolManifestPath(projectRoot);
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
  }
}

function getPreviewPort() {
  return PREVIEW_POOL_PORTS[0];
}

function stopOtherPreviewThemes(themeId) {
  for (const [otherId, entry] of [...previewPool.entries()]) {
    if (otherId === themeId) continue;
    stopPreviewPoolChild(entry);
    previewPool.delete(otherId);
  }
}

async function releasePreviewPort(port) {
  if (!isPortListening(port)) return true;
  killPortListeners(port, 'TERM');
  await sleep(400);
  if (!isPortListening(port)) return true;
  killPortListeners(port, 'KILL');
  await sleep(400);
  return !isPortListening(port);
}

/** Themes with custom `server.js` vs Next.js dev / start (npm themes often omit server.js). */
function themeHasCustomServer(themeDir) {
  return fs.existsSync(path.join(themeDir, 'server.js'));
}

function themeHasDevScript(themeDir) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(themeDir, 'package.json'), 'utf8'));
    return typeof pkg.scripts?.dev === 'string';
  } catch {
    return false;
  }
}

/** Prefer dev script (matches visitor :3001) — faster preview without next build. */
function resolvePreviewThemeLaunchPlan(themeDir, port) {
  if (themeHasDevScript(themeDir)) {
    return { mode: 'dev', cmd: 'pnpm', args: ['run', 'dev', '--', '--port', String(port)] };
  }

  if (themeHasCustomServer(themeDir)) {
    return { mode: 'production', cmd: 'node', args: ['server.js'] };
  }

  const nextBin = path.join(themeDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (fs.existsSync(nextBin)) {
    return { mode: 'production', cmd: process.execPath, args: [nextBin, 'start', '-p', String(port)] };
  }

  return { mode: 'production', cmd: 'pnpm', args: ['run', 'start'] };
}

/** @type {Map<string, Promise<{ themeId: string, port: number, url: string, reused: boolean } | null>>} */
const previewEnsureInflight = new Map();

/**
 * Ensure a production build exists, then start `next start` on the preview port.
 * @returns {Promise<{ themeId: string, port: number, url: string, reused: boolean } | null>}
 */
async function ensurePreviewThemeRunning(
  projectRoot,
  themeId,
  { serverApiUrl, publicApiUrl },
) {
  const inflight = previewEnsureInflight.get(themeId);
  if (inflight) return inflight;

  const job = startPreviewThemeRunning(projectRoot, themeId, {
    serverApiUrl,
    publicApiUrl,
  }).finally(() => {
    if (previewEnsureInflight.get(themeId) === job) {
      previewEnsureInflight.delete(themeId);
    }
  });
  previewEnsureInflight.set(themeId, job);
  return job;
}

async function startPreviewThemeRunning(
  projectRoot,
  themeId,
  { serverApiUrl, publicApiUrl },
) {
  const themeDir = resolveThemeDirectory(projectRoot, themeId);
  if (!themeDir || !isThemePackageDir(projectRoot, themeDir)) {
    return null;
  }

  const port = getPreviewPort();
  const pooled = previewPool.get(themeId);
  if (pooled?.child && !pooled.child.killed && pooled.port === port) {
    const ready = await isPreviewHomepageReady(projectRoot, port);
    if (ready) {
      pooled.lastUsed = Date.now();
      writePreviewPoolManifest(projectRoot);
      return {
        themeId,
        port,
        url: getPreviewSiteUrlForPort(projectRoot, port),
        reused: true,
      };
    }
    stopPreviewPoolChild(pooled);
  }

  stopOtherPreviewThemes(themeId);
  await releasePreviewPort(port);

  try {
    ensureThemeDependenciesInstalled(projectRoot, themeDir, themeId, 'themePreview');
    ensurePreviewFrameAllowed(themeDir);
  } catch (err) {
    console.warn(
      `[reactpress] ${t('themePreview.buildFailed', {
        id: themeId,
        message: err.message || err,
      })}`,
    );
    return null;
  }

  const launch = resolvePreviewThemeLaunchPlan(themeDir, port);

  if (launch.mode === 'production') {
    try {
      await enqueueThemeBuild(projectRoot, themeId, {
        logPrefix: 'themePreview',
        distDir: PREVIEW_DIST_DIR,
      });
    } catch (err) {
      console.warn(
        `[reactpress] ${t('themePreview.buildFailed', {
          id: themeId,
          message: err.message || err,
        })}`,
      );
      return null;
    }
  }

  const relDir = path.relative(projectRoot, themeDir) || themeDir;
  const previewUrl = getPreviewSiteUrlForPort(projectRoot, port);
  const modeLabel = launch.mode === 'dev' ? 'dev' : 'production';
  console.log(
    `[reactpress] ${t('themePreview.starting', {
      id: themeId,
      url: previewUrl,
      port,
      dir: relDir,
      mode: modeLabel,
    })}`,
  );

  const { cmd, args } = launch;
  const child = spawnDevChild(cmd, args, {
    cwd: themeDir,
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
    env: {
      ...resolvePreviewThemeEnv(projectRoot, themeDir, port, {
        mode: launch.mode,
        distDir: PREVIEW_DIST_DIR,
      }),
      SERVER_API_URL: serverApiUrl,
      REACTPRESS_API_URL: serverApiUrl,
      NEXT_PUBLIC_REACTPRESS_API_URL: publicApiUrl,
      REACTPRESS_THEME_ID: themeId,
      REACTPRESS_HONOR_PREVIEW: '1',
      REACTPRESS_SKIP_DEV_PORT_REDIRECT: '1',
      REACTPRESS_SKIP_BROWSER_OPEN: '1',
    },
  });

  previewPool.set(themeId, { child, port, lastUsed: Date.now() });
  writePreviewPoolManifest(projectRoot);

  child.on('exit', () => {
    const current = previewPool.get(themeId);
    if (current?.child === child) {
      previewPool.delete(themeId);
      writePreviewPoolManifest(projectRoot);
    }
  });

  const homepageUrl = `${previewUrl.replace(/\/$/, '')}/`;
  const ready = await waitForHttpOk(homepageUrl, 120_000, PREVIEW_READY_POLL_MS);
  if (ready) {
    console.log(`[reactpress] ${t('themePreview.ready', { url: homepageUrl, id: themeId })}`);
    warmupThemeHomepage(projectRoot, homepageUrl).catch(() => {});
  } else {
    console.warn(t('themeDev.slow', { url: homepageUrl }));
  }

  return {
    themeId,
    port,
    url: previewUrl,
    reused: false,
  };
}

module.exports = {
  PREVIEW_POOL_PORTS,
  PREVIEW_POOL_MANIFEST,
  previewPool,
  getPreviewSiteUrlForPort,
  readPreviewPoolManifest,
  writePreviewPoolManifest,
  ensurePreviewThemeRunning,
  stopPreviewPoolTheme,
  stopAllPreviewPool,
  isPreviewHomepageReady,
  resolvePreviewThemeLaunchPlan,
};
