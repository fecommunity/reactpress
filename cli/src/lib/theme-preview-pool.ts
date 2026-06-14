// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { spawnDevChild } = require('./dev-child-io');
const { loadClientSiteUrl, normalizeProbeUrl, probeHttp, waitForHttpOk } = require('./http');
const { isPortListening, killPortListeners } = require('./ports');
const {
  resolveThemeDirectory,
  isThemePackageDir,
  themeWorkspaceRoot,
} = require('./theme-runtime');
const {
  getPreviewBackendPorts,
  getPreviewPoolMaxSize,
  getPreviewProxyPort,
  PREVIEW_POOL_PORTS,
} = require('./theme-paths');
const {
  enqueueThemeBuild,
  resolvePreviewThemeEnv,
  ensureThemeDependenciesInstalled,
  PREVIEW_DIST_DIR,
} = require('./theme-prod');
const { warmupThemeHomepage } = require('./theme-warmup');
const {
  ensurePreviewFrameAllowed,
  ensureBuildAllowsPreviewFrame,
  shouldHonorThemePreviewFrame,
} = require('./theme-preview-frame');
const {
  ensurePreviewProxyRunning,
  setPreviewProxyTarget,
  stopPreviewProxy,
} = require('./theme-preview-proxy');
const { t } = require('./i18n');

const PREVIEW_POOL_MANIFEST = path.join('.reactpress', 'preview-pool.json');
const PREVIEW_READY_POLL_MS = 100;
const PREVIEW_READY_TIMEOUT_MS =
  process.env.REACTPRESS_DESKTOP_LOCAL === '1' ? 15_000 : 120_000;
const PREVIEW_PORT_RELEASE_PAUSE_MS =
  process.env.REACTPRESS_DESKTOP_LOCAL === '1' ? 120 : 400;

/** @type {Map<string, { child: import('child_process').ChildProcess | null, backendPort: number, lastUsed: number }>} */
const previewPool = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPreviewPoolManifestPath(projectRoot) {
  return path.join(themeWorkspaceRoot(projectRoot), PREVIEW_POOL_MANIFEST);
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

function getPreviewPublicUrl(projectRoot) {
  return getPreviewSiteUrlForPort(projectRoot, getPreviewProxyPort());
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
  const proxyPort = getPreviewProxyPort();
  const next = {};
  for (const [themeId, entry] of previewPool) {
    if (!entry?.backendPort) continue;
    next[themeId] = {
      port: String(proxyPort),
      backendPort: String(entry.backendPort),
      url: getPreviewSiteUrlForPort(projectRoot, proxyPort),
      updatedAt: new Date(entry.lastUsed || Date.now()).toISOString(),
    };
  }
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
}

async function isBackendReady(projectRoot, backendPort) {
  const url = `${getPreviewSiteUrlForPort(projectRoot, backendPort).replace(/\/$/, '')}/`;
  const result = await probeHttp(normalizeProbeUrl(url), 1200);
  return result.ok;
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

async function stopAllPreviewPool(projectRoot) {
  for (const themeId of [...previewPool.keys()]) {
    stopPreviewPoolTheme(themeId);
  }
  await stopPreviewProxy();
  const manifestPath = getPreviewPoolManifestPath(projectRoot);
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
  }
}

async function releasePreviewPort(port) {
  if (!isPortListening(port)) return true;
  killPortListeners(port, 'TERM');
  await sleep(PREVIEW_PORT_RELEASE_PAUSE_MS);
  if (!isPortListening(port)) return true;
  killPortListeners(port, 'KILL');
  await sleep(PREVIEW_PORT_RELEASE_PAUSE_MS);
  return !isPortListening(port);
}

/** Serialize preview pool mutations (desktop + CLI). */
let previewPortLock = Promise.resolve();

function withPreviewPortLock(fn) {
  const run = previewPortLock.then(() => fn());
  previewPortLock = run.catch(() => {});
  return run;
}

function allocateBackendPort(themeId) {
  const existing = previewPool.get(themeId);
  if (existing?.backendPort) {
    return existing.backendPort;
  }

  const backendPorts = getPreviewBackendPorts();
  const usedPorts = new Set(
    [...previewPool.values()]
      .map((entry) => entry.backendPort)
      .filter((port) => Number.isInteger(port)),
  );

  for (const port of backendPorts) {
    if (!usedPorts.has(port)) return port;
  }

  let oldestId = null;
  let oldestAt = Infinity;
  for (const [id, entry] of previewPool) {
    if (id === themeId) continue;
    const ts = entry.lastUsed || 0;
    if (ts < oldestAt) {
      oldestAt = ts;
      oldestId = id;
    }
  }

  if (oldestId) {
    const evicted = previewPool.get(oldestId);
    const port = evicted?.backendPort ?? backendPorts[0];
    stopPreviewPoolTheme(oldestId);
    return port;
  }

  return backendPorts[0];
}

function isChildAlive(child) {
  return Boolean(child && !child.killed && child.exitCode == null && child.signalCode == null);
}

function buildPreviewResult(projectRoot, themeId, backendPort, reused) {
  const proxyPort = getPreviewProxyPort();
  return {
    themeId,
    port: proxyPort,
    backendPort,
    url: getPreviewPublicUrl(projectRoot),
    reused,
  };
}

async function activateWarmPreviewEntry(projectRoot, themeId, entry) {
  setPreviewProxyTarget(entry.backendPort);
  entry.lastUsed = Date.now();
  writePreviewPoolManifest(projectRoot);
  const proxyPort = getPreviewProxyPort();
  const ready = await isPreviewHomepageReady(projectRoot, proxyPort);
  if (!ready) {
    const homepageUrl = `${getPreviewPublicUrl(projectRoot).replace(/\/$/, '')}/`;
    await waitForHttpOk(homepageUrl, PREVIEW_READY_TIMEOUT_MS, PREVIEW_READY_POLL_MS);
  }
  return buildPreviewResult(projectRoot, themeId, entry.backendPort, true);
}

/**
 * Spawn a theme server child for desktop visitor/preview roles.
 * Caller owns lifecycle logging and process tracking.
 */
function spawnThemeProcess(projectRoot, options) {
  const { spawn } = require('child_process');
  const {
    themeDir,
    themeId,
    port,
    serverApiUrl,
    publicApiUrl,
    launch,
    role = 'visitor',
    extraEnv = {},
  } = options;
  const distDir = role === 'preview' ? PREVIEW_DIST_DIR : '.next';
  const { cmd, args } = launch;

  if (launch.mode === 'production' && shouldHonorThemePreviewFrame()) {
    ensureBuildAllowsPreviewFrame(themeDir, distDir);
  }

  return spawn(cmd, args, {
    cwd: themeDir,
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...resolvePreviewThemeEnv(projectRoot, themeDir, port, {
        mode: launch.mode,
        distDir,
      }),
      SERVER_API_URL: serverApiUrl,
      REACTPRESS_API_URL: serverApiUrl,
      NEXT_PUBLIC_REACTPRESS_API_URL: publicApiUrl,
      REACTPRESS_THEME_ID: themeId,
      REACTPRESS_HONOR_PREVIEW: role === 'preview' || shouldHonorThemePreviewFrame() ? '1' : '0',
      REACTPRESS_SKIP_DEV_PORT_REDIRECT: '1',
      REACTPRESS_SKIP_BROWSER_OPEN: '1',
      REACTPRESS_DESKTOP_THEME_ROLE: role,
      ...extraEnv,
    },
  });
}

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

function themeUsesAppRouter(themeDir) {
  return fs.existsSync(path.join(themeDir, 'app'));
}

function isThemeOnlyDevMode() {
  return process.env.REACTPRESS_THEME_DEV_ONLY === '1';
}

function isIntegratedDesktopDev() {
  if (isThemeOnlyDevMode()) return false;
  if (process.env.REACTPRESS_DESKTOP_LOCAL === '1') return true;
  if (process.env.REACTPRESS_DESKTOP_SITE_ROOT?.trim()) return true;
  return false;
}

function shouldPreferProductionLaunch(themeDir) {
  if (isThemeOnlyDevMode()) return false;
  if (themeUsesAppRouter(themeDir)) return true;
  if (isIntegratedDesktopDev() && themeHasCustomServer(themeDir)) return true;
  return false;
}

function resolvePreviewThemeLaunchPlan(themeDir, port, options = {}) {
  const preferProduction =
    options.preferProduction ?? shouldPreferProductionLaunch(themeDir);

  if (!preferProduction && themeHasDevScript(themeDir)) {
    return { mode: 'dev', cmd: 'pnpm', args: ['run', 'dev', '--', '--port', String(port)] };
  }

  const nextBin = path.join(themeDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  // Prefer `next start -p` — hello-world server.js uses Next CLI internals that ignore `-p` on Next 15.
  if (preferProduction && fs.existsSync(nextBin)) {
    return { mode: 'production', cmd: process.execPath, args: [nextBin, 'start', '-p', String(port)] };
  }

  if (themeHasCustomServer(themeDir)) {
    return { mode: 'production', cmd: 'node', args: ['server.js'] };
  }

  if (fs.existsSync(nextBin)) {
    return { mode: 'production', cmd: process.execPath, args: [nextBin, 'start', '-p', String(port)] };
  }

  return { mode: 'production', cmd: 'pnpm', args: ['run', 'start'] };
}

/** @type {Map<string, Promise<{ themeId: string, port: number, backendPort: number, url: string, reused: boolean } | null>>} */
const previewEnsureInflight = new Map();

async function ensurePreviewThemeRunning(
  projectRoot,
  themeId,
  { serverApiUrl, publicApiUrl, spawnOptions = {} } = {},
) {
  const inflight = previewEnsureInflight.get(themeId);
  if (inflight) return inflight;

  const job = startPreviewThemeRunning(projectRoot, themeId, {
    serverApiUrl,
    publicApiUrl,
    spawnOptions,
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
  { serverApiUrl, publicApiUrl, spawnOptions = {} } = {},
) {
  let themeDir = resolveThemeDirectory(projectRoot, themeId);
  if (spawnOptions.resolveThemeDir) {
    themeDir = spawnOptions.resolveThemeDir(projectRoot, themeId) || themeDir;
  }
  if (!themeDir || !isThemePackageDir(projectRoot, themeDir)) {
    return null;
  }

  await ensurePreviewProxyRunning(getPreviewProxyPort());

  const pooled = previewPool.get(themeId);
  if (pooled && isChildAlive(pooled.child)) {
    const backendReady = await isBackendReady(projectRoot, pooled.backendPort);
    if (backendReady) {
      return activateWarmPreviewEntry(projectRoot, themeId, pooled);
    }
    stopPreviewPoolChild(pooled);
  }

  const backendPort = allocateBackendPort(themeId);
  await releasePreviewPort(backendPort);

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

  let launch = resolvePreviewThemeLaunchPlan(themeDir, backendPort);
  if (typeof spawnOptions.normalizeLaunch === 'function') {
    launch = spawnOptions.normalizeLaunch(launch, {
      themeDir,
      port: backendPort,
      projectRoot,
      themeId,
    });
  }

  if (launch.mode === 'production') {
    try {
      await enqueueThemeBuild(projectRoot, themeId, {
        logPrefix: 'themePreview',
        distDir: PREVIEW_DIST_DIR,
      });
      ensureBuildAllowsPreviewFrame(themeDir, PREVIEW_DIST_DIR);
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
  const modeLabel = launch.mode === 'dev' ? 'dev' : 'production';
  console.log(
    `[reactpress] ${t('themePreview.starting', {
      id: themeId,
      url: getPreviewPublicUrl(projectRoot),
      port: backendPort,
      dir: relDir,
      mode: modeLabel,
    })}`,
  );

  const { cmd, args } = launch;
  const child = spawnOptions.useThemeProcessSpawn
    ? spawnThemeProcess(projectRoot, {
        themeDir,
        themeId,
        port: backendPort,
        serverApiUrl,
        publicApiUrl,
        launch,
        role: 'preview',
        extraEnv: spawnOptions.extraEnv || {},
      })
    : spawnDevChild(cmd, args, {
        cwd: themeDir,
        detached: process.platform !== 'win32',
        shell: process.platform === 'win32',
        env: {
          ...resolvePreviewThemeEnv(projectRoot, themeDir, backendPort, {
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
          ...(spawnOptions.extraEnv || {}),
        },
      });

  previewPool.set(themeId, { child, backendPort, lastUsed: Date.now() });
  writePreviewPoolManifest(projectRoot);

  child.on('exit', () => {
    const current = previewPool.get(themeId);
    if (current?.child === child) {
      previewPool.delete(themeId);
      writePreviewPoolManifest(projectRoot);
    }
  });

  const backendUrl = `${getPreviewSiteUrlForPort(projectRoot, backendPort).replace(/\/$/, '')}/`;
  const backendReady = await waitForHttpOk(
    backendUrl,
    PREVIEW_READY_TIMEOUT_MS,
    PREVIEW_READY_POLL_MS,
  );
  if (!backendReady) {
    console.warn(t('themeDev.slow', { url: backendUrl }));
  }

  setPreviewProxyTarget(backendPort);
  writePreviewPoolManifest(projectRoot);

  const homepageUrl = `${getPreviewPublicUrl(projectRoot).replace(/\/$/, '')}/`;
  const proxyReady = await waitForHttpOk(homepageUrl, PREVIEW_READY_TIMEOUT_MS, PREVIEW_READY_POLL_MS);
  if (proxyReady) {
    console.log(`[reactpress] ${t('themePreview.ready', { url: homepageUrl, id: themeId })}`);
    warmupThemeHomepage(projectRoot, homepageUrl).catch(() => {});
  } else {
    console.warn(t('themeDev.slow', { url: homepageUrl }));
  }

  return buildPreviewResult(projectRoot, themeId, backendPort, false);
}

module.exports = {
  PREVIEW_POOL_PORTS,
  PREVIEW_POOL_MANIFEST,
  previewPool,
  getPreviewProxyPort,
  getPreviewBackendPorts,
  getPreviewPoolMaxSize,
  getPreviewSiteUrlForPort,
  getPreviewPublicUrl,
  readPreviewPoolManifest,
  writePreviewPoolManifest,
  ensurePreviewThemeRunning,
  ensurePreviewProxyRunning,
  stopPreviewPoolTheme,
  stopAllPreviewPool,
  isPreviewHomepageReady,
  isBackendReady,
  resolvePreviewThemeLaunchPlan,
  themeUsesAppRouter,
  shouldPreferProductionLaunch,
  isIntegratedDesktopDev,
  shouldHonorThemePreviewFrame,
  releasePreviewPort,
  withPreviewPortLock,
  spawnThemeProcess,
  allocateBackendPort,
  setPreviewProxyTarget,
};
