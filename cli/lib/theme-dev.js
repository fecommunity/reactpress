const { spawnSync } = require('child_process');
const { spawnDevChild } = require('./dev-child-io');
const path = require('path');
const fs = require('fs');
const { loadClientSiteUrl, loadServerSiteUrl, getApiPrefix, waitForHttpOk } = require('./http');
const { warmupThemeHomepage } = require('./theme-warmup');
const { nginxEntryUrl } = require('./nginx');
const {
  readActiveThemeManifest,
  readPreviewThemeManifest,
  resolveThemeDirectory,
  readManifestSignature,
  readPreviewManifestSignature,
  getPreviewThemePort,
  isThemePackageDir,
  isAllowedThemePort,
} = require('./theme-runtime');
const { isDevVerbose, logDevDetail, logDevLine } = require('./dev-log');
const { resolveProjectRoot } = require('./paths');
const { t } = require('./i18n');
const {
  ensurePreviewThemeRunning,
  stopAllPreviewPool,
  isPreviewHomepageReady,
  getPreviewSiteUrlForPort,
} = require('./theme-preview-pool');

let themeChild = null;
let themeWatchStop = null;
let runningSignature = null;
let trackedThemePid = null;
let restartChain = Promise.resolve();

let previewRunningSignature = null;
let previewRestartChain = Promise.resolve();

/** Drop `.next` only when it does not match the theme package React major (avoids wiping React 17 caches). */
function cleanStaleThemeDevCache(themeDir) {
  if (process.env.REACTPRESS_KEEP_THEME_CACHE === '1') return;

  const nextDir = path.join(themeDir, '.next');
  if (!fs.existsSync(nextDir)) return;

  if (process.env.REACTPRESS_CLEAR_THEME_CACHE === '1') {
    fs.rmSync(nextDir, { recursive: true, force: true });
    logDevDetail('themeDev.cacheCleared');
    return;
  }

  let expectedMajor = '17';
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(themeDir, 'package.json'), 'utf8'));
    const reactDep = pkg.dependencies?.react || pkg.devDependencies?.react || '';
    const match = String(reactDep).match(/(\d+)/);
    if (match) expectedMajor = match[1];
  } catch {
    return;
  }

  try {
    const marker = `react@${expectedMajor}`;
    const result = spawnSync('grep', ['-rl', marker, nextDir], {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
    if (result.stdout?.trim()) return;

    fs.rmSync(nextDir, { recursive: true, force: true });
    logDevDetail('themeDev.cacheStaleCleared', { marker });
  } catch {
    // ignore grep / rm failures
  }
}

function getClientPort(projectRoot) {
  try {
    const url = new URL(loadClientSiteUrl(projectRoot));
    const port = parseInt(url.port || '3001', 10);
    if (isAllowedThemePort(port)) return String(port);
  } catch {
    // fall through
  }
  return '3001';
}

function assertThemePort(port) {
  const n = parseInt(port, 10);
  if (!isAllowedThemePort(n)) {
    throw new Error(`Refusing theme dev on protected port ${port}`);
  }
  return n;
}

function isPortListening(port) {
  const result = spawnSync('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  return result.status === 0 && Boolean(result.stdout?.trim());
}

function getProcessCwd(pid) {
  const n = parseInt(pid, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  const res = spawnSync('lsof', ['-p', String(n)], { encoding: 'utf8' });
  if (res.status !== 0) return null;
  const line = res.stdout.split('\n').find((row) => row.includes(' cwd '));
  if (!line) return null;
  const parts = line.trim().split(/\s+/);
  return parts[parts.length - 1] || null;
}

function isUnderThemesDir(projectRoot, cwd) {
  if (!cwd) return false;
  const themesRoot = path.join(path.resolve(projectRoot), 'themes');
  const resolved = path.resolve(cwd);
  return resolved === themesRoot || resolved.startsWith(`${themesRoot}${path.sep}`);
}

/** Child PIDs of `rootPid` (pnpm → next dev tree). */
function collectDescendantPids(rootPid) {
  const root = parseInt(rootPid, 10);
  if (!Number.isFinite(root) || root <= 0) return [];

  const out = [];
  const queue = [String(root)];
  const seen = new Set();

  while (queue.length) {
    const pid = queue.shift();
    if (!pid || seen.has(pid)) continue;
    seen.add(pid);

    const children = spawnSync('pgrep', ['-P', pid], { encoding: 'utf8' });
    if (children.status !== 0 || !children.stdout?.trim()) continue;

    for (const child of children.stdout.trim().split(/\s+/)) {
      if (!child || seen.has(child)) continue;
      out.push(child);
      queue.push(child);
    }
  }
  return out;
}

function isPidSafeToSignal(pid) {
  const n = parseInt(pid, 10);
  if (!Number.isFinite(n) || n <= 1) return false;
  if (n === process.pid) return false;
  if (process.ppid && n === process.ppid) return false;
  return true;
}

/** LISTEN pids for this theme dev port (package cwd, themes/, or tracked child tree). */
function getThemeListenerPids(projectRoot, port) {
  const result = spawnSync('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  if (result.status !== 0 || !result.stdout?.trim()) return [];

  const allowed = new Set();

  if (trackedThemePid && isPidSafeToSignal(trackedThemePid)) {
    allowed.add(String(trackedThemePid));
    for (const child of collectDescendantPids(trackedThemePid)) {
      if (isPidSafeToSignal(child)) allowed.add(child);
    }
  }

  for (const pid of result.stdout.trim().split(/\s+/)) {
    if (!isPidSafeToSignal(pid)) continue;
    const cwd = getProcessCwd(pid);
    if (
      cwd &&
      (isThemePackageDir(projectRoot, cwd) || isUnderThemesDir(projectRoot, cwd))
    ) {
      allowed.add(pid);
      for (const child of collectDescendantPids(pid)) {
        if (isPidSafeToSignal(child)) allowed.add(child);
      }
    }
  }

  return [...allowed];
}

function signalPids(pids, signal) {
  const flag = signal === 'KILL' ? '-9' : '-TERM';
  for (const pid of pids) {
    if (isPidSafeToSignal(pid)) {
      spawnSync('kill', [flag, pid], { stdio: 'ignore' });
    }
  }
}

function killThemeListenersOnPort(projectRoot, port, signal = 'TERM') {
  signalPids(getThemeListenerPids(projectRoot, port), signal);
}

function waitForPortFree(port, timeoutMs = 10_000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      if (!isPortListening(port)) {
        resolve(true);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(tick, 250);
    };
    tick();
  });
}

async function releaseThemePort(projectRoot, port, { fast = false } = {}) {
  stopActiveThemeProcess();

  const maxAttempts = fast ? 3 : 4;
  const waitSchedule = fast ? [1200, 800, 800] : [12_000, 6000, 6000, 6000];

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const signal = fast ? (attempt === 0 ? 'TERM' : 'KILL') : attempt < 2 ? 'TERM' : 'KILL';
    killThemeListenersOnPort(projectRoot, port, signal);
    if (trackedThemePid && isPidSafeToSignal(trackedThemePid)) {
      const tree = [String(trackedThemePid), ...collectDescendantPids(trackedThemePid)];
      signalPids(tree, signal);
    }
    const waitMs = waitSchedule[attempt] ?? 6000;
    const freed = await waitForPortFree(port, waitMs);
    if (freed) {
      trackedThemePid = null;
      return true;
    }
  }

  trackedThemePid = null;
  return false;
}

/** Optional theme-only API override (admin / Nest API stay on SERVER_SITE_URL). */
function readThemeApiOverride(projectRoot, envKey) {
  const fromShell = process.env[envKey]?.trim();
  if (fromShell) return fromShell.replace(/\/$/, '');

  const envPath = path.join(projectRoot, '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`^${envKey}=(.+)$`, 'm'));
    if (match) {
      const raw = match[1].trim().replace(/^['"]|['"]$/g, '');
      if (raw) return raw.replace(/\/$/, '');
    }
  } catch {
    // ignore
  }
  return null;
}

function useLocalThemeApiInDev() {
  return process.env.REACTPRESS_DEV_FORCE_LOCAL_THEME_API === '1';
}

function buildLocalThemeApiUrl(projectRoot, { forBrowser = false } = {}) {
  if (forBrowser && process.env.REACTPRESS_BEHIND_NGINX === '1') {
    return `${nginxEntryUrl(projectRoot).replace(/\/$/, '')}/api`;
  }
  const server = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
  const prefix = getApiPrefix(projectRoot).replace(/\/$/, '') || '/api';
  return `${server}${prefix.startsWith('/') ? prefix : `/${prefix}`}`;
}

/** Direct Nest API — used for Next.js SSR (runs before nginx is up). */
function buildThemeServerApiUrl(projectRoot) {
  if (useLocalThemeApiInDev()) {
    return buildLocalThemeApiUrl(projectRoot, { forBrowser: false });
  }

  const override = readThemeApiOverride(projectRoot, 'REACTPRESS_THEME_API_URL');
  if (override) return override;

  return buildLocalThemeApiUrl(projectRoot);
}

/** Browser-facing API — nginx unified entry when behind proxy. */
function buildThemePublicApiUrl(projectRoot) {
  if (useLocalThemeApiInDev()) {
    return buildLocalThemeApiUrl(projectRoot, { forBrowser: true });
  }

  const publicOverride = readThemeApiOverride(projectRoot, 'REACTPRESS_THEME_PUBLIC_API_URL');
  if (publicOverride) return publicOverride;

  const themeOverride = readThemeApiOverride(projectRoot, 'REACTPRESS_THEME_API_URL');
  if (themeOverride) return themeOverride;

  return buildLocalThemeApiUrl(projectRoot);
}

/** @deprecated use buildThemeServerApiUrl / buildThemePublicApiUrl */
function buildThemeApiUrl(projectRoot) {
  return buildThemeServerApiUrl(projectRoot);
}

function buildThemeChildEnv(projectRoot, { port, serverApiUrl, publicApiUrl, themeId }) {
  const keys = [
    'PATH',
    'HOME',
    'USER',
    'LANG',
    'LC_ALL',
    'NODE_ENV',
    'PNPM_HOME',
    'npm_config_user_agent',
  ];
  const env = {};
  for (const key of keys) {
    if (process.env[key] !== undefined) env[key] = process.env[key];
  }
  return {
    ...env,
    PORT: String(port),
    // Next inlines SERVER_API_URL from next.config (localhost); override for remote dev SSR.
    SERVER_API_URL: serverApiUrl,
    REACTPRESS_API_URL: serverApiUrl,
    NEXT_PUBLIC_REACTPRESS_API_URL: publicApiUrl,
    REACTPRESS_THEME_ID: themeId || '',
    REACTPRESS_ORIGINAL_CWD: projectRoot,
    REACTPRESS_SKIP_BROWSER_OPEN: '1',
    NEXT_IGNORE_INCORRECT_LOCKFILE: '1',
    NEXT_TELEMETRY_DISABLED: '1',
    ...(process.env.REACTPRESS_NGINX_ENTRY_URL
      ? {
          REACTPRESS_NGINX_ENTRY_URL: process.env.REACTPRESS_NGINX_ENTRY_URL,
          NGINX_ENTRY_URL: process.env.REACTPRESS_NGINX_ENTRY_URL,
          NEXT_PUBLIC_REACTPRESS_ADMIN_URL: `${String(process.env.REACTPRESS_NGINX_ENTRY_URL).replace(/\/$/, '')}/admin`,
        }
      : { REACTPRESS_SKIP_DEV_PORT_REDIRECT: '1' }),
  };
}

function stopThemeProcess(childRef, trackedPidRef) {
  const child = childRef.current;
  if (!child || child.killed) {
    childRef.current = null;
    return;
  }

  const pid = child.pid;
  if (pid && isPidSafeToSignal(pid)) {
    trackedPidRef.current = pid;
  }
  try {
    if (process.platform !== 'win32' && pid && isPidSafeToSignal(pid)) {
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        spawnSync('pkill', ['-TERM', '-P', String(pid)], { stdio: 'ignore' });
        child.kill('SIGTERM');
      }
      for (const descendant of collectDescendantPids(pid)) {
        if (isPidSafeToSignal(descendant)) {
          spawnSync('kill', ['-TERM', descendant], { stdio: 'ignore' });
        }
      }
    } else if (pid && isPidSafeToSignal(pid)) {
      child.kill('SIGTERM');
    }
  } catch {
    // ignore — process may already be gone
  }
  childRef.current = null;
}

const activeChildRef = { get current() { return themeChild; }, set current(v) { themeChild = v; } };
const activeTrackedPidRef = {
  get current() { return trackedThemePid; },
  set current(v) { trackedThemePid = v; },
};

function stopActiveThemeProcess() {
  stopThemeProcess(activeChildRef, activeTrackedPidRef);
}

function stopPreviewThemeProcess() {
  /* Preview pool stays warm — torn down only on full dev shutdown. */
}

function stopThemeSite() {
  if (themeWatchStop) {
    themeWatchStop();
    themeWatchStop = null;
  }
  stopActiveThemeProcess();
  stopAllPreviewPool(resolveProjectRoot());
  runningSignature = null;
  previewRunningSignature = null;
  restartChain = Promise.resolve();
  previewRestartChain = Promise.resolve();
}

function spawnThemeSite(projectRoot, { onClose } = {}) {
  const signature = readManifestSignature(projectRoot);
  if (!signature) {
    console.warn(`[reactpress] ${t('themeDev.invalidManifest')}`);
    runningSignature = null;
    return null;
  }

  const { activeTheme } = readActiveThemeManifest(projectRoot);
  const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
  const port = assertThemePort(getClientPort(projectRoot));
  const serverApiUrl = buildThemeServerApiUrl(projectRoot);
  const publicApiUrl = buildThemePublicApiUrl(projectRoot);
  const siteUrl = loadClientSiteUrl(projectRoot);

  if (!themeDir || !isThemePackageDir(projectRoot, themeDir)) {
    console.warn(
      `[reactpress] ${t('themeDev.notFound', { id: activeTheme })} — ${siteUrl} ${t('themeDev.unavailable')}`,
    );
    runningSignature = null;
    return null;
  }

  const relDir = path.relative(projectRoot, themeDir) || themeDir;
  logDevDetail('themeDev.startingShort', { id: activeTheme, port, dir: relDir });
  if (isDevVerbose()) {
    logDevLine('themeDev.apiSplit', { ssr: serverApiUrl, browser: publicApiUrl });
  }

  cleanStaleThemeDevCache(themeDir);

  themeChild = spawnDevChild('pnpm', ['run', 'dev'], {
    cwd: themeDir,
    detached: process.platform !== 'win32',
    shell: process.platform === 'win32',
    env: buildThemeChildEnv(projectRoot, { port, serverApiUrl, publicApiUrl, themeId: activeTheme }),
  });

  const child = themeChild;
  trackedThemePid = child.pid ?? null;
  runningSignature = signature;

  child.on('close', (code) => {
    if (themeChild === child) {
      themeChild = null;
      trackedThemePid = null;
      if (runningSignature === signature) {
        runningSignature = null;
      }
    }
    if (onClose) onClose(code);
  });

  if (process.env.REACTPRESS_DEV_FORCE_LOCAL_THEME_API !== '1') {
    const homepageUrl = `${siteUrl.replace(/\/$/, '')}/`;
    const pollMs = parseInt(process.env.REACTPRESS_THEME_READY_POLL_MS || '150', 10) || 150;
    waitForHttpOk(homepageUrl, 120_000, pollMs).then((ready) => {
      if (ready && runningSignature === signature) {
        console.log(t('themeDev.ready', { url: siteUrl, id: activeTheme }));
        warmupThemeHomepage(projectRoot, siteUrl).catch(() => {});
      } else if (!ready && runningSignature === signature) {
        console.warn(t('themeDev.slow', { url: siteUrl }));
      }
    });
  }

  return themeChild;
}

async function restartThemeSite(projectRoot, { onClose } = {}) {
  const signature = readManifestSignature(projectRoot);
  if (!signature) return;

  if (signature === runningSignature && themeChild && !themeChild.killed) {
    return;
  }

  const port = assertThemePort(getClientPort(projectRoot));
  let freed = await releaseThemePort(projectRoot, port, { fast: true });
  if (!freed || isPortListening(port)) {
    freed = await releaseThemePort(projectRoot, port, { fast: true });
  }
  if (!freed || isPortListening(port)) {
    console.warn(`[reactpress] ${t('themeDev.portBusy', { port })}`);
    console.warn(
      `[reactpress] ${t('themeDev.portBusyHint', {
        port,
        cmd: `lsof -tiTCP:${port} -sTCP:LISTEN | xargs kill -9`,
      })}`,
    );
    return;
  }

  spawnThemeSite(projectRoot, { onClose });
}

async function restartPreviewThemeSite(projectRoot, { onClose } = {}) {
  const signature = readPreviewManifestSignature(projectRoot);

  if (!signature) {
    previewRunningSignature = null;
    stopAllPreviewPool(projectRoot);
    if (onClose) onClose(0);
    return;
  }

  const previewManifest = readPreviewThemeManifest(projectRoot);
  const themeId = previewManifest?.activeTheme;
  if (!themeId) return;

  if (signature === previewRunningSignature) {
    const { previewPool } = require('./theme-preview-pool');
    const entry = previewPool.get(themeId);
    if (entry?.child && !entry.child.killed) {
      const ready = await isPreviewHomepageReady(projectRoot, entry.port);
      if (ready) return;
    }
  }

  const serverApiUrl = buildThemeServerApiUrl(projectRoot);
  const publicApiUrl = buildThemePublicApiUrl(projectRoot);

  const result = await ensurePreviewThemeRunning(projectRoot, themeId, {
    serverApiUrl,
    publicApiUrl,
  });

  if (!result) {
    previewRunningSignature = null;
    if (onClose) onClose(1);
    return;
  }

  previewRunningSignature = signature;
  if (result.reused) {
    console.log(`[reactpress] Preview ready (reused): ${result.url} (theme: ${themeId})`);
  }
  if (onClose) onClose(0);
}

function watchActiveThemeManifest(projectRoot, onChange) {
  const manifestPath = path.join(projectRoot, '.reactpress', 'active-theme.json');
  const dir = path.dirname(manifestPath);
  fs.mkdirSync(dir, { recursive: true });

  let lastSignature = readManifestSignature(projectRoot);
  let debounce = null;

  const scheduleCheck = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const next = readManifestSignature(projectRoot);
      if (!next || next === lastSignature) return;
      lastSignature = next;
      console.log(`\n[reactpress] ${t('themeDev.restart')}`);
      restartChain = restartChain
        .then(() => onChange())
        .catch((err) => {
          console.warn(`[reactpress] ${t('themeDev.restartFailed', { message: err.message || err })}`);
        });
    }, 200);
  };

  const watcher = fs.watch(dir, scheduleCheck);
  const poller = setInterval(scheduleCheck, 1000);

  return () => {
    clearTimeout(debounce);
    clearInterval(poller);
    watcher.close();
  };
}

function watchPreviewThemeManifest(projectRoot, onChange) {
  const manifestPath = path.join(projectRoot, '.reactpress', 'preview-theme.json');
  const dir = path.dirname(manifestPath);
  fs.mkdirSync(dir, { recursive: true });

  let lastSignature = readPreviewManifestSignature(projectRoot);
  let debounce = null;
  /** Delay teardown when manifest is deleted — admin preview session may remount immediately. */
  let clearDebounce = null;
  const PREVIEW_CLEAR_GRACE_MS = 500;

  const enqueueRestart = (nextSignature) => {
    if (nextSignature === lastSignature) return;
    lastSignature = nextSignature;
    if (nextSignature) {
      console.log('\n[reactpress] preview-theme.json changed — restarting preview theme…');
    }
    previewRestartChain = previewRestartChain
      .then(() => onChange())
      .catch((err) => {
        console.warn(
          `[reactpress] ${t('themeDev.restartFailed', { message: err.message || err })}`,
        );
      });
  };

  const scheduleCheck = () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const next = readPreviewManifestSignature(projectRoot);
      if (next === lastSignature) return;

      if (!next && lastSignature) {
        if (clearDebounce) clearTimeout(clearDebounce);
        clearDebounce = setTimeout(() => {
          clearDebounce = null;
          const still = readPreviewManifestSignature(projectRoot);
          if (still) {
            if (still !== lastSignature) enqueueRestart(still);
            return;
          }
          enqueueRestart('');
        }, PREVIEW_CLEAR_GRACE_MS);
        return;
      }

      if (clearDebounce) {
        clearTimeout(clearDebounce);
        clearDebounce = null;
      }
      enqueueRestart(next);
    }, 200);
  };

  const watcher = fs.watch(dir, (event, filename) => {
    if (filename && filename !== 'preview-theme.json') return;
    scheduleCheck();
  });
  const poller = setInterval(scheduleCheck, 1000);

  return () => {
    clearTimeout(debounce);
    if (clearDebounce) clearTimeout(clearDebounce);
    clearInterval(poller);
    watcher.close();
  };
}

/** Drop stale preview manifest so `pnpm dev` does not auto-start :3003 from a prior admin session. */
function clearPreviewThemeManifestFile(projectRoot) {
  const manifestPath = path.join(projectRoot, '.reactpress', 'preview-theme.json');
  if (fs.existsSync(manifestPath)) {
    fs.unlinkSync(manifestPath);
  }
}

async function releaseThemePortIfBusy(projectRoot, port, options) {
  if (!isPortListening(port)) return true;
  return releaseThemePort(projectRoot, port, options);
}

async function prepareThemeDevBoot(projectRoot) {
  clearPreviewThemeManifestFile(projectRoot);
  stopActiveThemeProcess();
  previewRunningSignature = null;
  runningSignature = null;
  trackedThemePid = null;

  const visitorPort = assertThemePort(getClientPort(projectRoot));
  await releaseThemePortIfBusy(projectRoot, visitorPort);
}

async function startThemeSiteWithWatch(projectRoot, { onClose } = {}) {
  await prepareThemeDevBoot(projectRoot);

  const restartActive = () => restartThemeSite(projectRoot, { onClose });
  const restartPreview = () => restartPreviewThemeSite(projectRoot, { onClose });

  restartChain = restartChain.then(() => restartThemeSite(projectRoot, { onClose }));
  await restartChain;

  const stopActiveWatch = watchActiveThemeManifest(projectRoot, restartActive);
  const stopPreviewWatch = watchPreviewThemeManifest(projectRoot, restartPreview);

  themeWatchStop = () => {
    stopActiveWatch();
    stopPreviewWatch();
  };

  return Boolean(runningSignature && themeChild && !themeChild.killed);
}

module.exports = {
  spawnThemeSite,
  restartThemeSite,
  startThemeSiteWithWatch,
  stopThemeSite,
  getClientPort,
  buildThemeApiUrl,
  buildThemeServerApiUrl,
  buildThemePublicApiUrl,
  readManifestSignature,
  isPortListening,
  getThemeListenerPids,
};
