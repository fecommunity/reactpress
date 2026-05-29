const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { loadClientSiteUrl, loadServerSiteUrl, getApiPrefix, waitForHttp } = require('./http');
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
const { warmupThemeDevRoutes } = require('./theme-warmup');
const { t } = require('./i18n');

let themeChild = null;
let themeWatchStop = null;
let runningSignature = null;
let trackedThemePid = null;
let restartChain = Promise.resolve();

let previewThemeChild = null;
let previewWatchStop = null;
let previewRunningSignature = null;
let trackedPreviewThemePid = null;
let previewRestartChain = Promise.resolve();

/** Remove `.next` when it still contains Next 12 / React 17 chunks after a theme upgrade. */
function cleanStaleThemeDevCache(themeDir) {
  const nextDir = path.join(themeDir, '.next');
  if (!fs.existsSync(nextDir)) return;
  try {
    const result = spawnSync('grep', ['-rl', 'react@17.0.2', nextDir], { encoding: 'utf8' });
    if (result.stdout?.trim()) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('[reactpress] Cleared stale theme .next cache (react@17 chunks).');
    }
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

async function releaseThemePort(projectRoot, port, { preview = false } = {}) {
  if (preview) {
    stopPreviewThemeProcess();
  } else {
    stopActiveThemeProcess();
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const signal = attempt < 2 ? 'TERM' : 'KILL';
    killThemeListenersOnPort(projectRoot, port, signal);
    const trackedPid = preview ? trackedPreviewThemePid : trackedThemePid;
    if (trackedPid && isPidSafeToSignal(trackedPid)) {
      const tree = [String(trackedPid), ...collectDescendantPids(trackedPid)];
      signalPids(tree, signal);
    }
    const waitMs = attempt === 0 ? 12_000 : 6000;
    const freed = await waitForPortFree(port, waitMs);
    if (freed) {
      if (preview) trackedPreviewThemePid = null;
      else trackedThemePid = null;
      return true;
    }
  }

  if (preview) trackedPreviewThemePid = null;
  else trackedThemePid = null;
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

/** Direct Nest API — used for Next.js SSR (runs before nginx is up). */
function buildThemeServerApiUrl(projectRoot) {
  const override = readThemeApiOverride(projectRoot, 'REACTPRESS_THEME_API_URL');
  if (override) return override;

  const server = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
  const prefix = getApiPrefix(projectRoot).replace(/\/$/, '') || '/api';
  return `${server}${prefix.startsWith('/') ? prefix : `/${prefix}`}`;
}

/** Browser-facing API — nginx unified entry when behind proxy. */
function buildThemePublicApiUrl(projectRoot) {
  const publicOverride = readThemeApiOverride(projectRoot, 'REACTPRESS_THEME_PUBLIC_API_URL');
  if (publicOverride) return publicOverride;

  const themeOverride = readThemeApiOverride(projectRoot, 'REACTPRESS_THEME_API_URL');
  if (themeOverride) return themeOverride;

  if (process.env.REACTPRESS_BEHIND_NGINX === '1') {
    return `${nginxEntryUrl(projectRoot).replace(/\/$/, '')}/api`;
  }
  return buildThemeServerApiUrl(projectRoot);
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
    REACTPRESS_API_URL: serverApiUrl,
    NEXT_PUBLIC_REACTPRESS_API_URL: publicApiUrl,
    REACTPRESS_THEME_ID: themeId || '',
    REACTPRESS_ORIGINAL_CWD: projectRoot,
    NEXT_IGNORE_INCORRECT_LOCKFILE: '1',
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
const previewChildRef = {
  get current() { return previewThemeChild; },
  set current(v) { previewThemeChild = v; },
};
const previewTrackedPidRef = {
  get current() { return trackedPreviewThemePid; },
  set current(v) { trackedPreviewThemePid = v; },
};

function stopActiveThemeProcess() {
  stopThemeProcess(activeChildRef, activeTrackedPidRef);
}

function stopPreviewThemeProcess() {
  stopThemeProcess(previewChildRef, previewTrackedPidRef);
}

function stopThemeSite() {
  if (themeWatchStop) {
    themeWatchStop();
    themeWatchStop = null;
  }
  if (previewWatchStop) {
    previewWatchStop();
    previewWatchStop = null;
  }
  stopActiveThemeProcess();
  stopPreviewThemeProcess();
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
  console.log(t('themeDev.starting', { id: activeTheme, port, url: siteUrl, dir: relDir }));
  console.log(t('themeDev.apiSplit', { ssr: serverApiUrl, browser: publicApiUrl }));

  cleanStaleThemeDevCache(themeDir);

  themeChild = spawn('pnpm', ['run', 'dev'], {
    cwd: themeDir,
    detached: process.platform !== 'win32',
    stdio: 'inherit',
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

  waitForHttp(siteUrl, 120_000).then(async (ready) => {
    if (ready && runningSignature === signature) {
      await warmupThemeDevRoutes(projectRoot);
      console.log(t('themeDev.ready', { url: siteUrl, id: activeTheme }));
    } else if (!ready && runningSignature === signature) {
      console.warn(t('themeDev.slow', { url: siteUrl }));
    }
  });

  return themeChild;
}

function getPreviewSiteUrl(projectRoot) {
  const port = getPreviewThemePort();
  try {
    const url = new URL(loadClientSiteUrl(projectRoot));
    url.port = port;
    return url.toString().replace(/\/$/, '');
  } catch {
    return `http://localhost:${port}`;
  }
}

function spawnPreviewThemeSite(projectRoot, { onClose } = {}) {
  const signature = readPreviewManifestSignature(projectRoot);
  if (!signature) {
    previewRunningSignature = null;
    return null;
  }

  const previewManifest = readPreviewThemeManifest(projectRoot);
  if (!previewManifest) {
    previewRunningSignature = null;
    return null;
  }

  const { activeTheme } = previewManifest;
  const themeDir = resolveThemeDirectory(projectRoot, activeTheme);
  const port = assertThemePort(getPreviewThemePort());
  const serverApiUrl = buildThemeServerApiUrl(projectRoot);
  const publicApiUrl = buildThemePublicApiUrl(projectRoot);
  const previewUrl = getPreviewSiteUrl(projectRoot);

  if (!themeDir || !isThemePackageDir(projectRoot, themeDir)) {
    console.warn(
      `[reactpress] ${t('themeDev.notFound', { id: activeTheme })} — ${previewUrl} ${t('themeDev.unavailable')}`,
    );
    previewRunningSignature = null;
    return null;
  }

  const relDir = path.relative(projectRoot, themeDir) || themeDir;
  console.log(
    `[reactpress] Preview theme "${activeTheme}" → ${previewUrl} (port ${port}, ${relDir})`,
  );

  cleanStaleThemeDevCache(themeDir);

  previewThemeChild = spawn('pnpm', ['run', 'dev'], {
    cwd: themeDir,
    detached: process.platform !== 'win32',
    stdio: 'inherit',
    env: {
      ...buildThemeChildEnv(projectRoot, {
        port,
        serverApiUrl,
        publicApiUrl,
        themeId: activeTheme,
      }),
      REACTPRESS_HONOR_PREVIEW: '1',
    },
  });

  const child = previewThemeChild;
  trackedPreviewThemePid = child.pid ?? null;
  previewRunningSignature = signature;

  child.on('close', (code) => {
    if (previewThemeChild === child) {
      previewThemeChild = null;
      trackedPreviewThemePid = null;
      if (previewRunningSignature === signature) {
        previewRunningSignature = null;
      }
    }
    if (onClose) onClose(code);
  });

  waitForHttp(previewUrl, 120_000).then((ready) => {
    if (ready && previewRunningSignature === signature) {
      console.log(`[reactpress] Preview ready: ${previewUrl} (theme: ${activeTheme})`);
    } else if (!ready && previewRunningSignature === signature) {
      console.warn(t('themeDev.slow', { url: previewUrl }));
    }
  });

  return previewThemeChild;
}

async function restartThemeSite(projectRoot, { onClose } = {}) {
  const signature = readManifestSignature(projectRoot);
  if (!signature) return;

  if (signature === runningSignature && themeChild && !themeChild.killed) {
    return;
  }

  const port = assertThemePort(getClientPort(projectRoot));
  let freed = await releaseThemePort(projectRoot, port);
  if (!freed || isPortListening(port)) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    freed = await releaseThemePort(projectRoot, port);
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
  const port = assertThemePort(getPreviewThemePort());

  if (!signature) {
    stopPreviewThemeProcess();
    await releaseThemePort(projectRoot, port, { preview: true });
    previewRunningSignature = null;
    return;
  }

  if (signature === previewRunningSignature && previewThemeChild && !previewThemeChild.killed) {
    return;
  }

  let freed = await releaseThemePort(projectRoot, port, { preview: true });
  if (!freed || isPortListening(port)) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    freed = await releaseThemePort(projectRoot, port, { preview: true });
  }
  if (!freed || isPortListening(port)) {
    console.warn(`[reactpress] ${t('themeDev.portBusy', { port })}`);
    return;
  }

  spawnPreviewThemeSite(projectRoot, { onClose });
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
    }, 400);
  };

  const watcher = fs.watch(dir, scheduleCheck);
  const poller = setInterval(scheduleCheck, 2000);

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
    }, 400);
  };

  const watcher = fs.watch(dir, scheduleCheck);
  const poller = setInterval(scheduleCheck, 2000);

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

async function prepareThemeDevBoot(projectRoot) {
  clearPreviewThemeManifestFile(projectRoot);
  stopPreviewThemeProcess();
  stopActiveThemeProcess();
  previewRunningSignature = null;
  runningSignature = null;
  trackedPreviewThemePid = null;
  trackedThemePid = null;

  const visitorPort = assertThemePort(getClientPort(projectRoot));
  const previewPort = assertThemePort(getPreviewThemePort());
  await releaseThemePort(projectRoot, previewPort, { preview: true });
  await releaseThemePort(projectRoot, visitorPort);
}

async function startThemeSiteWithWatch(projectRoot, { onClose } = {}) {
  await prepareThemeDevBoot(projectRoot);

  const restartActive = () => restartThemeSite(projectRoot, { onClose });
  const restartPreview = () => restartPreviewThemeSite(projectRoot, { onClose });

  restartChain = restartChain.then(() => restartThemeSite(projectRoot, { onClose }));

  const stopActiveWatch = watchActiveThemeManifest(projectRoot, restartActive);
  const stopPreviewWatch = watchPreviewThemeManifest(projectRoot, restartPreview);

  themeWatchStop = () => {
    stopActiveWatch();
    stopPreviewWatch();
  };
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
