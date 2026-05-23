#!/usr/bin/env node
/**
 * 3.0 验收：二次冷启动耗时（需已执行过 reactpress init，且 Docker/MySQL 可用）。
 * 用法: node scripts/benchmark-cold-start.mjs
 * 环境: BENCHMARK_MAX_MS=60000（默认 60s）
 */
import { spawn } from 'node:child_process';
import http from 'node:http';

const MAX_MS = Number(process.env.BENCHMARK_MAX_MS || 60_000);
const CLIENT_URL = process.env.CLIENT_SITE_URL || 'http://127.0.0.1:3001';
const HEALTH_URL =
  process.env.HEALTH_URL || 'http://127.0.0.1:3002/api/health';

function probe(url, timeoutMs = 2000) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve(false);
      return;
    }
    const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port,
        path: parsed.pathname + (parsed.search || ''),
        method: 'GET',
        timeout: timeoutMs,
      },
      (res) => resolve(res.statusCode > 0)
    );
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function waitReady(url, deadline) {
  while (Date.now() < deadline) {
    if (await probe(url)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const t0 = Date.now();
const child = spawn('node', ['./cli/bin/reactpress.js', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, REACTPRESS_SUPPRESS_DEPRECATION: '1' },
});

const deadline = t0 + MAX_MS;
let clientOk = false;
let healthOk = false;

const poll = setInterval(async () => {
  if (!healthOk) healthOk = await waitReady(HEALTH_URL, Date.now() + 500);
  if (!clientOk) clientOk = await probe(CLIENT_URL);
  if (healthOk && clientOk) {
    clearInterval(poll);
    const elapsed = Date.now() - t0;
    console.log(`\n[benchmark] Ready in ${(elapsed / 1000).toFixed(1)}s (limit ${MAX_MS / 1000}s)`);
    child.kill('SIGINT');
    process.exit(elapsed <= MAX_MS ? 0 : 1);
  }
  if (Date.now() >= deadline) {
    clearInterval(poll);
    console.error(`\n[benchmark] Timeout ${MAX_MS / 1000}s (health=${healthOk} client=${clientOk})`);
    child.kill('SIGINT');
    process.exit(1);
  }
}, 1000);

child.on('close', (code) => {
  if (!healthOk || !clientOk) process.exit(code ?? 1);
});
