const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { loadClientSiteUrl, loadServerSiteUrl, getApiPrefix, waitForHttp } = require('./http');
const { nginxEntryUrl } = require('./nginx');
const {
  readActiveThemeManifest,
  resolveThemeDirectory,
  readManifestSignature,
  isThemePackageDir,
  isAllowedThemePort,
} = require('./theme-runtime');
const { t } = require('./i18n');

let themeChild = null;
let themeWatchStop = null;
let runningSignature = null;
let trackedThemePid = null;
let restartChain = Promise.resolve();

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

function isPidSafeToSignal(pid) {
  const n = parseInt(pid, 10);
  if (!Number.isFinite(n) || n <= 1) return false;
  if (n === process.pid) return false;
  if (process.ppid && n === process.ppid) return false;
  return true;
}

/** Only LISTEN pids whose cwd is a theme package, or the tracked theme child tree. */
function getThemeListenerPids(projectRoot, port) {
  const result = spawnSync('lsof', [`-tiTCP:${port}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  if (result.status !== 0 || !result.stdout?.trim()) return [];

  const allowed = [];
  for (const pid of result.stdout.trim().split(/\s+/)) {
    if (!isPidSafeToSignal(pid)) continue;
    if (trackedThemePid && parseInt(pid, 10) === trackedThemePid) {
      allowed.push(pid);
      continue;
    }
    const cwd = getProcessCwd(pid);
    if (cwd && isThemePackageDir(projectRoot, cwd)) {
      allowed.push(pid);
    }
  }
  return allowed;
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
      setTimeout(tick, 200);
    };
    tick();
  });
}

async function releaseThemePort(projectRoot, port) {
  stopThemeProcess();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    killThemeListenersOnPort(projectRoot, port, attempt < 2 ? 'TERM' : 'KILL');
    const freed = await waitForPortFree(port, attempt === 0 ? 8000 : 5000);
    if (freed) return true;
  }
  return false;
}

/** Direct Nest API — used for Next.js SSR (runs before nginx is up). */
function buildThemeServerApiUrl(projectRoot) {
  const server = loadServerSiteUrl(projectRoot).replace(/\/$/, '');
  const prefix = getApiPrefix(projectRoot).replace(/\/$/, '') || '/api';
  return `${server}${prefix.startsWith('/') ? prefix : `/${prefix}`}`;
}

/** Browser-facing API — nginx unified entry when behind proxy. */
function buildThemePublicApiUrl(projectRoot) {
  if (process.env.REACTPRESS_BEHIND_NGINX === '1') {
    return `${nginxEntryUrl(projectRoot).replace(/\/$/, '')}/api`;
  }
  return buildThemeServerApiUrl(projectRoot);
}

/** @deprecated use buildThemeServerApiUrl / buildThemePublicApiUrl */
function buildThemeApiUrl(projectRoot) {
  return buildThemeServerApiUrl(projectRoot);
}

function buildThemeChildEnv(projectRoot, { port, serverApiUrl, publicApiUrl }) {
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
    REACTPRESS_ORIGINAL_CWD: projectRoot,
    NEXT_IGNORE_INCORRECT_LOCKFILE: '1',
  };
}

function stopThemeProcess() {
  if (!themeChild || themeChild.killed) {
    themeChild = null;
    trackedThemePid = null;
    return;
  }

  const pid = themeChild.pid;
  trackedThemePid = pid;
  try {
    if (process.platform !== 'win32' && pid && isPidSafeToSignal(pid)) {
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        if (isPidSafeToSignal(pid)) {
          spawnSync('pkill', ['-TERM', '-P', String(pid)], { stdio: 'ignore' });
          themeChild.kill('SIGTERM');
        }
      }
    } else if (pid && isPidSafeToSignal(pid)) {
      themeChild.kill('SIGTERM');
    }
  } catch {
    // ignore — process may already be gone
  }
  themeChild = null;
}

function stopThemeSite() {
  if (themeWatchStop) {
    themeWatchStop();
    themeWatchStop = null;
  }
  stopThemeProcess();
  runningSignature = null;
  restartChain = Promise.resolve();
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
  if (serverApiUrl !== publicApiUrl) {
    console.log(t('themeDev.apiSplit', { ssr: serverApiUrl, browser: publicApiUrl }));
  }

  themeChild = spawn('pnpm', ['run', 'dev'], {
    cwd: themeDir,
    detached: process.platform !== 'win32',
    stdio: 'inherit',
    env: buildThemeChildEnv(projectRoot, { port, serverApiUrl, publicApiUrl }),
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

  waitForHttp(siteUrl, 120_000).then((ready) => {
    if (ready && runningSignature === signature) {
      console.log(t('themeDev.ready', { url: siteUrl, id: activeTheme }));
    } else if (!ready && runningSignature === signature) {
      console.warn(t('themeDev.slow', { url: siteUrl }));
    }
  });

  return themeChild;
}

async function restartThemeSite(projectRoot, { onClose } = {}) {
  const signature = readManifestSignature(projectRoot);
  if (!signature) return;

  if (signature === runningSignature && themeChild && !themeChild.killed) {
    return;
  }

  const port = assertThemePort(getClientPort(projectRoot));
  const freed = await releaseThemePort(projectRoot, port);
  if (!freed) {
    console.warn(`[reactpress] ${t('themeDev.portBusy', { port })}`);
    return;
  }

  spawnThemeSite(projectRoot, { onClose });
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

function startThemeSiteWithWatch(projectRoot, { onClose } = {}) {
  const restart = () => restartThemeSite(projectRoot, { onClose });
  restartChain = restartChain.then(() => restartThemeSite(projectRoot, { onClose }));
  themeWatchStop = watchActiveThemeManifest(projectRoot, restart);
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
