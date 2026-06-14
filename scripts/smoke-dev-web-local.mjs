#!/usr/bin/env node
/**
 * Smoke test: start/stop `pnpm dev:web:local` N times and verify core endpoints.
 * Usage: node scripts/smoke-dev-web-local.mjs [--rounds=3]
 */
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const ROUNDS = parseInt(process.argv.find((a) => a.startsWith('--rounds='))?.split('=')[1] || '3', 10);
const PORTS = [3000, 3001, 3003, 3004, 13102];
const STARTUP_TIMEOUT_MS = 120_000;
const POLL_MS = 500;

function log(msg) {
  console.log(`[smoke] ${msg}`);
}

function killPorts() {
  const ports = PORTS.join(',');
  spawnSync('sh', ['-c', `lsof -tiTCP:${ports} -sTCP:LISTEN 2>/dev/null | xargs kill -9 2>/dev/null || true`], {
    stdio: 'ignore',
  });
}

async function fetchStatus(url, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow' });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function waitForReady(label) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const [health, admin, preview, site] = await Promise.all([
      fetchStatus('http://127.0.0.1:13102/api/health'),
      fetchStatus('http://127.0.0.1:3000/'),
      fetchStatus('http://127.0.0.1:3003/'),
      fetchStatus('http://127.0.0.1:3001/'),
    ]);
    if (health.ok && admin.ok && preview.ok && site.ok) {
      return { health, admin, preview, site };
    }
    await sleep(POLL_MS);
  }
  throw new Error(`${label}: timed out waiting for services (${STARTUP_TIMEOUT_MS}ms)`);
}

async function testApiLogin() {
  const res = await fetch('http://127.0.0.1:13102/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'admin', password: 'admin' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.data?.token) {
    throw new Error(`login failed: HTTP ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
  }
  return data.data.token;
}

async function testSettingGet(token) {
  const res = await fetch('http://127.0.0.1:13102/api/setting/get', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  if (!res.ok) throw new Error(`setting/get failed: HTTP ${res.status}`);
}

function stopDev(child, round) {
  return new Promise((resolve) => {
    if (!child || child.killed) {
      resolve('already-dead');
      return;
    }
    const timer = setTimeout(() => {
      log(`round ${round}: SIGINT timeout — sending SIGKILL`);
      try {
        child.kill('SIGKILL');
      } catch {
        // ignore
      }
      resolve('sigkill');
    }, 15_000);

    child.once('exit', (code, signal) => {
      clearTimeout(timer);
      resolve(`exit code=${code ?? 'null'} signal=${signal ?? 'none'}`);
    });

    try {
      child.kill('SIGINT');
    } catch {
      clearTimeout(timer);
      resolve('kill-failed');
    }
  });
}

async function runRound(round) {
  log(`── round ${round}/${ROUNDS} ──`);
  killPorts();
  await sleep(800);

  const child = spawn('pnpm', ['dev:web:local'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '0' },
  });

  let stdout = '';
  let sawSigtermDuringBoot = false;
  let sawEconnrefused = false;
  child.stdout.on('data', (buf) => {
    const s = buf.toString();
    stdout += s;
    if (s.includes('Received SIGTERM') && !stdout.includes('LOCAL MODE READY')) {
      sawSigtermDuringBoot = true;
    }
    if (s.includes('ECONNREFUSED 127.0.0.1:13102')) {
      sawEconnrefused = true;
    }
  });
  child.stderr.on('data', (buf) => {
    const s = buf.toString();
    stdout += s;
    if (s.includes('ECONNREFUSED 127.0.0.1:13102')) {
      sawEconnrefused = true;
    }
  });

  const ready = await waitForReady(`round ${round}`);
  log(
    `round ${round}: endpoints OK — health=${ready.health.status} admin=${ready.admin.status} preview=${ready.preview.status} site=${ready.site.status}`,
  );

  if (sawSigtermDuringBoot) {
    throw new Error(`round ${round}: API received SIGTERM during startup`);
  }
  if (sawEconnrefused) {
    throw new Error(`round ${round}: Vite proxy ECONNREFUSED on :13102 after ready`);
  }

  const token = await testApiLogin();
  await testSettingGet(token);
  log(`round ${round}: API login + setting/get OK`);

  const previewHtml = await fetch('http://127.0.0.1:3003/').then((r) => r.text());
  if (!previewHtml || previewHtml.length < 100) {
    throw new Error(`round ${round}: preview :3003 returned empty/short body`);
  }
  log(`round ${round}: preview proxy body OK (${previewHtml.length} bytes)`);

  // Mid-run health check (API should stay up while dev parent runs)
  const midHealth = await fetchStatus('http://127.0.0.1:13102/api/health');
  if (!midHealth.ok) {
    throw new Error(`round ${round}: API unhealthy mid-run`);
  }

  const stopResult = await stopDev(child, round);
  log(`round ${round}: stopped (${stopResult})`);
  await sleep(1500);

  // After graceful stop, ports should be mostly free (allow brief drain)
  await sleep(1000);
  const postHealth = await fetchStatus('http://127.0.0.1:13102/api/health', 2000);
  if (postHealth.ok) {
    log(`round ${round}: warning — API still up after SIGINT (will clean ports)`);
  }

  killPorts();
  await sleep(500);
  log(`round ${round}: PASS`);
  return true;
}

async function main() {
  log(`project root: ${ROOT}`);
  log(`building CLI…`);
  const build = spawnSync('pnpm', ['run', '--dir', 'cli', 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (build.status !== 0) process.exit(build.status ?? 1);

  const results = [];
  for (let i = 1; i <= ROUNDS; i += 1) {
    try {
      await runRound(i);
      results.push({ round: i, ok: true });
    } catch (err) {
      console.error(`[smoke] round ${i} FAIL: ${err.message}`);
      results.push({ round: i, ok: false, error: err.message });
      killPorts();
    }
  }

  const passed = results.filter((r) => r.ok).length;
  console.log('');
  log(`summary: ${passed}/${ROUNDS} rounds passed`);
  for (const r of results) {
    log(`  round ${r.round}: ${r.ok ? 'PASS' : `FAIL — ${r.error}`}`);
  }

  if (passed < ROUNDS) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  killPorts();
  process.exit(1);
});
