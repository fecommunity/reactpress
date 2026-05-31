const fs = require('fs');
const path = require('path');
const { spawnDevChild } = require('./dev-child-io');
const { loadClientSiteUrl, normalizeProbeUrl, probeHttp, waitForHttpOk } = require('./http');
const { isPortListening, killPortListeners } = require('./ports');
const { resolveThemeDirectory, isThemePackageDir } = require('./theme-runtime');
const { warmupThemeHomepage } = require('./theme-warmup');
const { t } = require('./i18n');

/** Preview dev servers — one port per warmed theme (3003–3008). */
const PREVIEW_POOL_PORTS = [3003, 3004, 3005, 3006, 3007, 3008];
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

function allocatePreviewPort(themeId) {
  const existing = previewPool.get(themeId);
  if (existing?.port) return existing.port;

  const used = new Set([...previewPool.values()].map((entry) => entry.port));
  for (const port of PREVIEW_POOL_PORTS) {
    if (used.has(port)) continue;
    if (!isPortListening(port)) return port;
  }

  let oldestThemeId = null;
  let oldestUsed = Infinity;
  for (const [id, entry] of previewPool) {
    if (id === themeId) continue;
    if ((entry.lastUsed ?? 0) < oldestUsed) {
      oldestUsed = entry.lastUsed ?? 0;
      oldestThemeId = id;
    }
  }
  if (oldestThemeId) {
    const evicted = previewPool.get(oldestThemeId);
    stopPreviewPoolChild(evicted);
    previewPool.delete(oldestThemeId);
    return evicted.port;
  }

  return PREVIEW_POOL_PORTS[0];
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

/**
 * Reuse a warmed preview dev server or spawn a new one on a dedicated port.
 * @returns {Promise<{ themeId: string, port: number, url: string, reused: boolean } | null>}
 */
function resolvePreviewPortForTheme(projectRoot, themeId) {
  const pool = readPreviewPoolManifest(projectRoot);
  const fromManifest = parseInt(String(pool[themeId]?.port ?? ''), 10);
  if (Number.isInteger(fromManifest) && PREVIEW_POOL_PORTS.includes(fromManifest)) {
    return fromManifest;
  }
  return allocatePreviewPort(themeId);
}

async function ensurePreviewThemeRunning(
  projectRoot,
  themeId,
  { buildThemeChildEnv, cleanStaleThemeDevCache, serverApiUrl, publicApiUrl },
) {
  const themeDir = resolveThemeDirectory(projectRoot, themeId);
  if (!themeDir || !isThemePackageDir(projectRoot, themeDir)) {
    return null;
  }

  const pooled = previewPool.get(themeId);
  if (pooled?.child && !pooled.child.killed) {
    const ready = await isPreviewHomepageReady(projectRoot, pooled.port);
    if (ready) {
      pooled.lastUsed = Date.now();
      writePreviewPoolManifest(projectRoot);
      return {
        themeId,
        port: pooled.port,
        url: getPreviewSiteUrlForPort(projectRoot, pooled.port),
        reused: true,
      };
    }
    stopPreviewPoolChild(pooled);
  }

  const port = resolvePreviewPortForTheme(projectRoot, themeId);
  await releasePreviewPort(port);

  cleanStaleThemeDevCache(themeDir);

  const relDir = path.relative(projectRoot, themeDir) || themeDir;
  const previewUrl = getPreviewSiteUrlForPort(projectRoot, port);
  console.log(`[reactpress] Preview theme "${themeId}" → ${previewUrl} (port ${port}, ${relDir})`);

  const child = spawnDevChild('pnpm', ['run', 'dev'], {
    cwd: themeDir,
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
    env: {
      ...buildThemeChildEnv(projectRoot, { port, serverApiUrl, publicApiUrl, themeId }),
      REACTPRESS_HONOR_PREVIEW: '1',
    },
  });

  previewPool.set(themeId, { child, port, lastUsed: Date.now() });
  writePreviewPoolManifest(projectRoot);

  const homepageUrl = `${previewUrl.replace(/\/$/, '')}/`;
  const ready = await waitForHttpOk(homepageUrl, 120_000, PREVIEW_READY_POLL_MS);
  if (ready) {
    console.log(`[reactpress] Preview ready: ${homepageUrl} (theme: ${themeId})`);
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
};
