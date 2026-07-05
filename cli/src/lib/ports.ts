// @ts-nocheck
const fs = require('fs');
const path = require('path');
const net = require('net');
const { spawnSync } = require('child_process');

/**
 * Local dev port map (keep in sync with `.env`, README, and `theme.service.ts` defaults).
 *
 * | Port | Service |
 * |------|---------|
 * | 3000 | Admin SPA — Vite (`web/`, `WEB_ADMIN_URL`) |
 * | 3001 | Visitor site — active theme Next.js (`CLIENT_SITE_URL`) |
 * | 3002 | API server (`SERVER_PORT`) |
 * | 3003 | Admin theme preview only (`REACTPRESS_PREVIEW_PORT`, `preview-theme.json`) |
 * | 3306 | MySQL (`DB_PORT`) |
 */
const DEV_PORTS = {
  ADMIN_WEB: 3000,
  VISITOR: 3001,
  API: 3002,
  THEME_PREVIEW: 3003,
  MYSQL: 3306,
};

/** Offset applied per `REACTPRESS_INSTANCE` (instance 1 → admin :3010, api :3012, …). */
const INSTANCE_PORT_STEP = 10;

function readProcessEnvPort(key) {
  const raw = process.env[key]?.trim();
  if (!raw) return null;
  const n = parseInt(raw.replace(/^['"]|['"]$/g, ''), 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function readInstanceIndex() {
  const raw = process.env.REACTPRESS_INSTANCE ?? process.env.REACTPRESS_DEV_INSTANCE ?? '0';
  const n = parseInt(String(raw).trim(), 10);
  if (!Number.isInteger(n) || n < 0 || n > 99) return 0;
  return n;
}

function instancePortOffset() {
  return readInstanceIndex() * INSTANCE_PORT_STEP;
}

/**
 * Resolve a dev-stack port: process.env override → `.env` (instance 0 only) → default + instance offset.
 */
function resolveStackPort(projectRoot, envKey, defaultBase) {
  const fromProcess = readProcessEnvPort(envKey);
  if (fromProcess) return fromProcess;

  const instance = readInstanceIndex();
  const shiftedDefault = defaultBase + instance * INSTANCE_PORT_STEP;

  if (instance === 0) {
    try {
      const content = fs.readFileSync(path.join(projectRoot, '.env'), 'utf8');
      const match = content.match(new RegExp(`^${envKey}=(.+)$`, 'm'));
      if (match) {
        const n = parseInt(match[1].trim().replace(/^['"]|['"]$/g, ''), 10);
        if (Number.isInteger(n) && n > 0) return n;
      }
    } catch {
      // ignore
    }
  }

  return shiftedDefault;
}

function resolveDevStackPorts(projectRoot) {
  const offset = instancePortOffset();
  const visitorFromProcess = readProcessEnvPort('CLIENT_PORT');
  let visitor = DEV_PORTS.VISITOR + offset;
  if (visitorFromProcess) {
    visitor = visitorFromProcess;
  } else if (readInstanceIndex() === 0) {
    visitor = readVisitorPort(projectRoot);
  }

  return {
    admin: resolveStackPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB),
    visitor,
    api: resolveStackPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API),
    preview: resolveStackPort(projectRoot, 'REACTPRESS_PREVIEW_PORT', DEV_PORTS.THEME_PREVIEW),
  };
}

/** Push resolved ports into `process.env` so child processes share one port map. */
function applyDevStackPortsToEnv(ports) {
  process.env.WEB_ADMIN_PORT = String(ports.admin);
  process.env.SERVER_PORT = String(ports.api);
  process.env.REACTPRESS_LOCAL_API_PORT = String(ports.api);
  process.env.CLIENT_PORT = String(ports.visitor);
  process.env.REACTPRESS_PREVIEW_PORT = String(ports.preview);
  process.env.CLIENT_SITE_URL = `http://localhost:${ports.visitor}`;
  process.env.SERVER_SITE_URL = `http://127.0.0.1:${ports.api}`;
  if (!process.env.VITE_DEV_API_PROXY_TARGET?.trim()) {
    process.env.VITE_DEV_API_PROXY_TARGET = `http://127.0.0.1:${ports.api}`;
  }
}

function devSessionSuffix() {
  const instance = readInstanceIndex();
  return instance > 0 ? `-instance-${instance}` : '';
}

/** Ports theme `next dev` must not bind to (reserved for other services). 3003 is allowed — preview theme. */
/** Never kill listeners on DB / infra ports during dev port cleanup. */
const PROTECTED_KILL_PORTS = new Set([3306, 3307, 5432, 6379]);

const BLOCKED_THEME_DEV_PORTS = new Set([
  22,
  80,
  443,
  3000,
  3002,
  5173,
  5432,
  6379,
  8080,
  8443,
  3306,
  3307,
]);

function readEnvPort(projectRoot, key, fallback) {
  const fromProcess = readProcessEnvPort(key);
  if (fromProcess) return fromProcess;
  try {
    const content = fs.readFileSync(path.join(projectRoot, '.env'), 'utf8');
    const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    if (match) {
      const n = parseInt(match[1].trim().replace(/^['"]|['"]$/g, ''), 10);
      if (Number.isInteger(n) && n > 0) return n;
    }
  } catch {
    // ignore
  }
  return fallback;
}

function readVisitorPort(projectRoot) {
  const fromEnv = readEnvPort(projectRoot, 'CLIENT_PORT', null);
  if (fromEnv) return fromEnv;
  try {
    const content = fs.readFileSync(path.join(projectRoot, '.env'), 'utf8');
    const match = content.match(/^CLIENT_SITE_URL=(.+)$/m);
    if (match) {
      const url = new URL(match[1].trim().replace(/^['"]|['"]$/g, ''));
      const n = parseInt(url.port || String(DEV_PORTS.VISITOR), 10);
      if (Number.isInteger(n) && n > 0) return n;
    }
  } catch {
    // ignore
  }
  return DEV_PORTS.VISITOR;
}

function isPortListening(port) {
  const n = parseInt(port, 10);
  if (!Number.isInteger(n) || n < 1) return false;
  const result = spawnSync('lsof', [`-tiTCP:${n}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  return result.status === 0 && Boolean(result.stdout?.trim());
}

/** Kill processes listening on `port`. Returns PIDs signalled. */
function killPortListeners(port, signal = 'KILL') {
  const n = parseInt(port, 10);
  if (!Number.isInteger(n) || n < 1) return [];

  const flag = signal === 'TERM' ? '-TERM' : '-9';
  const result = spawnSync('lsof', [`-tiTCP:${n}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  if (result.status !== 0 || !result.stdout?.trim()) return [];

  const pids = [];
  for (const pid of result.stdout.trim().split(/\s+/)) {
    if (!pid) continue;
    spawnSync('kill', [flag, pid], { stdio: 'ignore' });
    pids.push(pid);
  }
  return pids;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getListenerPids(port) {
  const n = parseInt(port, 10);
  if (!Number.isInteger(n) || n < 1) return [];
  const result = spawnSync('lsof', [`-tiTCP:${n}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  if (result.status !== 0 || !result.stdout?.trim()) return [];
  return result.stdout.trim().split(/\s+/).filter(Boolean);
}

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

function collectAncestorPids(pid, maxDepth = 10) {
  const out = [];
  let current = parseInt(pid, 10);
  for (let i = 0; i < maxDepth; i += 1) {
    if (!Number.isFinite(current) || current <= 1) break;
    const ppidRes = spawnSync('ps', ['-o', 'ppid=', '-p', String(current)], { encoding: 'utf8' });
    const parent = parseInt(ppidRes.stdout?.trim(), 10);
    if (!Number.isFinite(parent) || parent <= 1) break;
    out.push(String(parent));
    current = parent;
  }
  return out;
}

function getProcessCommand(pid) {
  const res = spawnSync('ps', ['-o', 'args=', '-p', String(pid)], { encoding: 'utf8' });
  return (res.stdout || '').trim();
}

function isDockerInfrastructureProcess(pid) {
  const cmd = getProcessCommand(pid).toLowerCase();
  if (!cmd) return false;
  return (
    cmd.includes('com.docker') ||
    cmd.includes('docker desktop') ||
    cmd.includes('dockerd') ||
    cmd.includes('vpnkit') ||
    cmd.includes('containerd') ||
    (cmd.includes('docker') && cmd.includes('proxy'))
  );
}

/** Nest / pnpm API dev parent — killing only the listener leaves watch respawning children. */
function isReactPressApiProcess(pid, projectRoot) {
  if (isDockerInfrastructureProcess(pid)) return false;
  const cmd = getProcessCommand(pid);
  if (!cmd) return false;
  if (
    /nest start|api-dev-runner|server\/dist\/starter|@nestjs\/cli|reactpress\.js/.test(cmd)
  ) {
    return true;
  }
  const serverDir = path.join(path.resolve(projectRoot), 'server');
  const res = spawnSync('lsof', ['-p', String(pid)], { encoding: 'utf8' });
  if (res.status !== 0) return false;
  return res.stdout.split('\n').some((line) => {
    if (!line.includes(' cwd ')) return false;
    const parts = line.trim().split(/\s+/);
    const cwd = parts[parts.length - 1];
    return cwd === serverDir || cwd.startsWith(`${serverDir}${path.sep}`);
  });
}

function signalPidSet(pids, signal) {
  const flag = signal === 'TERM' ? '-TERM' : '-9';
  for (const pid of pids) {
    if (!pid || pid === String(process.pid)) continue;
    spawnSync('kill', [flag, pid], { stdio: 'ignore' });
  }
}

function collectApiPortProcessTree(projectRoot, port) {
  const toSignal = new Set();
  for (const pid of getListenerPids(port)) {
    if (isDockerInfrastructureProcess(pid)) continue;
    toSignal.add(pid);
    for (const child of collectDescendantPids(pid)) {
      if (!isDockerInfrastructureProcess(child)) toSignal.add(child);
    }
    for (const ancestor of collectAncestorPids(pid)) {
      if (isReactPressApiProcess(ancestor, projectRoot)) toSignal.add(ancestor);
    }
  }
  return toSignal;
}

/** Stop Nest / api-dev listeners on `port` (TERM then KILL). */
async function stopApiPortListeners(projectRoot, port, { label = 'API' } = {}) {
  const n = parseInt(port, 10);
  if (!Number.isInteger(n) || n < 1 || !isPortListening(n)) return true;

  console.warn(
    `[reactpress] Port ${n} (${label}) is busy — stopping existing API processes…`,
  );

  const toSignal = collectApiPortProcessTree(projectRoot, n);
  signalPidSet(toSignal, 'TERM');
  await sleep(600);

  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (!isPortListening(n)) return true;
    for (const pid of getListenerPids(n)) {
      toSignal.add(pid);
      for (const child of collectDescendantPids(pid)) toSignal.add(child);
    }
    signalPidSet(toSignal, 'KILL');
    await sleep(500);
  }

  if (isPortListening(n)) {
    console.warn(
      `[reactpress] Port ${n} (${label}) still in use — try: lsof -tiTCP:${n} -sTCP:LISTEN | xargs kill -9`,
    );
    return false;
  }
  return true;
}

/**
 * Free API port: skip when health check passes; otherwise stop listener + nest watch tree.
 * @returns {{ reused: boolean, port: number }}
 */
async function ensureApiPortFree(projectRoot, { allowReuse = true } = {}) {
  const port = readEnvPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API);
  const { getHealthUrl, checkHealth } = require('./http');
  if (allowReuse) {
    const health = await checkHealth(getHealthUrl(projectRoot), 1500);
    if (health.ok) {
      return { reused: true, port };
    }
  }

  if (!isPortListening(port)) {
    return { reused: false, port };
  }

  await stopApiPortListeners(projectRoot, port);
  return { reused: false, port };
}

/** Always stop API listeners — used when replacing a prior `reactpress dev` session. */
async function forceReleaseApiPort(projectRoot) {
  const port = readEnvPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API);
  if (!isPortListening(port)) return port;
  console.warn(`[reactpress] Releasing API port ${port} for new dev session…`);
  await stopApiPortListeners(projectRoot, port);
  return port;
}

/** Stop orphaned dev-stack listeners after session takeover or crash. */
async function forceReleaseDevStackPorts(projectRoot) {
  await forceReleaseApiPort(projectRoot);

  const previewPort = readEnvPort(
    projectRoot,
    'REACTPRESS_PREVIEW_PORT',
    DEV_PORTS.THEME_PREVIEW,
  );
  const adminPort = readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB);
  const visitorPort = readVisitorPort(projectRoot);

  for (const [port, label] of [
    [adminPort, 'admin'],
    [visitorPort, 'visitor site'],
    [previewPort, 'theme preview'],
  ]) {
    await ensurePortFree(port, { label });
  }
}

/**
 * Free only unhealthy or non-API listeners — keeps a healthy API to skip Nest cold compile.
 */
async function releaseStaleDevStackPorts(projectRoot) {
  if (process.env.REACTPRESS_FORCE_PORT_RESET === '1') {
    await forceReleaseDevStackPorts(projectRoot);
    return;
  }

  const { getHealthUrl, checkHealth } = require('./http');
  const apiPort = resolveStackPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API);

  if (isPortListening(apiPort)) {
    const healthUrl = `http://127.0.0.1:${apiPort}/api/health`;
    const health = await checkHealth(healthUrl, 2000);
    if (health.ok) {
      const { logDevDetail } = require('./dev-log');
      logDevDetail('dev.apiKept', { port: apiPort });
    } else {
      await stopApiPortListeners(projectRoot, apiPort);
    }
  }

  const previewPort = readEnvPort(
    projectRoot,
    'REACTPRESS_PREVIEW_PORT',
    DEV_PORTS.THEME_PREVIEW,
  );
  const adminPort = readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB);
  const visitorPort = readVisitorPort(projectRoot);

  for (const [port, label] of [
    [adminPort, 'admin'],
    [visitorPort, 'visitor site'],
    [previewPort, 'theme preview'],
  ]) {
    if (isPortListening(port)) {
      await ensurePortFree(port, { label, maxWaitMs: 5000 });
    }
  }
}

/**
 * If `port` is in use, terminate listeners (TERM then KILL) and wait until free.
 */
async function ensurePortFree(port, { label = 'service', maxWaitMs = 8000 } = {}) {
  const n = parseInt(port, 10);
  if (!Number.isInteger(n) || n < 1) return false;

  if (PROTECTED_KILL_PORTS.has(n)) {
    if (isPortListening(n)) {
      console.warn(`[reactpress] Port ${n} (${label}) is protected — leaving existing listener`);
    }
    return true;
  }

  if (process.env.REACTPRESS_DESKTOP_LOCAL === '1') {
    const desktopApi = process.env.REACTPRESS_DESKTOP_LOCAL_API?.trim();
    if (desktopApi) {
      try {
        const desktopPort = parseInt(new URL(desktopApi).port || String(DEV_PORTS.API), 10);
        if (Number.isInteger(desktopPort) && desktopPort === n) {
          if (isPortListening(n)) {
            console.warn(
              `[reactpress] Port ${n} (${label}) is the embedded local API — leaving listener`,
            );
          }
          return true;
        }
      } catch {
        // ignore malformed REACTPRESS_DESKTOP_LOCAL_API
      }
    }
  }

  if (!isPortListening(n)) return true;

  console.warn(`[reactpress] Port ${n} (${label}) is busy — stopping existing listener…`);
  killPortListeners(n, 'TERM');
  await sleep(500);

  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    if (!isPortListening(n)) return true;
    killPortListeners(n, 'KILL');
    await sleep(500);
  }

  if (isPortListening(n)) {
    console.warn(
      `[reactpress] Port ${n} (${label}) still in use — try: lsof -tiTCP:${n} -sTCP:LISTEN | xargs kill -9`,
    );
    return false;
  }
  return true;
}

function isPortBindable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Pick an API port: reuse healthy listener, else preferred, else next free slot in range.
 * @returns {{ port: number, reused: boolean, shifted?: boolean }}
 */
async function resolveApiPortForBind(projectRoot, { preferred } = {}) {
  const start = preferred ?? resolveStackPort(projectRoot, 'SERVER_PORT', DEV_PORTS.API);
  const healthUrl = `http://127.0.0.1:${start}/api/health`;
  const { checkHealth } = require('./http');

  const health = await checkHealth(healthUrl, 1500);
  if (health.ok) {
    return { port: start, reused: true };
  }

  if (!isPortListening(start)) {
    return { port: start, reused: false };
  }

  for (let port = start; port < start + 20; port += 1) {
    if (!isPortListening(port) && (await isPortBindable(port))) {
      console.warn(`[reactpress] API port ${start} is busy — using :${port}`);
      return { port, reused: false, shifted: true };
    }
  }

  throw new Error(`No available API port near ${start} (set SERVER_PORT or REACTPRESS_INSTANCE)`);
}

/** Free theme/admin ports (API handled in {@link forceReleaseDevStackPorts} / {@link spawnApi}). */
async function ensureDevStackPorts(projectRoot) {
  const previewPort = readEnvPort(
    projectRoot,
    'REACTPRESS_PREVIEW_PORT',
    DEV_PORTS.THEME_PREVIEW,
  );
  const adminPort = readEnvPort(projectRoot, 'WEB_ADMIN_PORT', DEV_PORTS.ADMIN_WEB);
  const visitorPort = readVisitorPort(projectRoot);

  for (const [port, label] of [
    [adminPort, 'admin'],
    [visitorPort, 'visitor site'],
    [previewPort, 'theme preview'],
  ]) {
    await ensurePortFree(port, { label });
  }
}

module.exports = {
  DEV_PORTS,
  INSTANCE_PORT_STEP,
  BLOCKED_THEME_DEV_PORTS,
  readEnvPort,
  readVisitorPort,
  readInstanceIndex,
  instancePortOffset,
  resolveStackPort,
  resolveDevStackPorts,
  applyDevStackPortsToEnv,
  resolveApiPortForBind,
  devSessionSuffix,
  isPortListening,
  killPortListeners,
  ensurePortFree,
  ensureApiPortFree,
  forceReleaseApiPort,
  forceReleaseDevStackPorts,
  releaseStaleDevStackPorts,
  ensureDevStackPorts,
};
