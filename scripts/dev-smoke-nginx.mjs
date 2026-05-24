#!/usr/bin/env node
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const timeoutMs = 300_000;
const logPath = '/tmp/reactpress-dev-nginx-smoke.log';

const checks = [
  ['http://localhost/health', 200, 'nginx /health'],
  ['http://localhost/api/health', 200, 'API /api/health via nginx'],
  ['http://localhost/admin/', 200, 'admin /admin/ via nginx'],
  ['http://localhost/', 200, 'public site / via nginx'],
];

function probe(url, expectStatus = 200) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      resolve({ ok: false, status: 0, url });
      return;
    }
    const port = parsed.port || 80;
    const req = http.request(
      {
        hostname: parsed.hostname,
        port,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        timeout: 10000,
      },
      (res) => {
        resolve({
          ok: res.statusCode === expectStatus || (expectStatus === 200 && res.statusCode > 0 && res.statusCode < 500),
          status: res.statusCode,
          url,
        });
      },
    );
    req.on('error', () => resolve({ ok: false, status: 0, url }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, url });
    });
    req.end();
  });
}

const child = spawn('pnpm', ['dev'], {
  cwd: root,
  env: { ...process.env, FORCE_COLOR: '0' },
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

const out = [];
const onData = (c) => {
  const t = c.toString();
  out.push(t);
  process.stdout.write(t);
};
child.stdout.on('data', onData);
child.stderr.on('data', onData);

const readyPattern = /ALL SYSTEMS GO|一切就绪/;
const nginxReadyPattern = /Nginx 已就绪|Nginx ready/;
const failPattern =
  /API 在 \d+s 内未就绪|API not ready within|nginx 启动失败|nginx failed to start|dev\.apiTimeout/;

let done = false;
const deadline = Date.now() + timeoutMs;

async function finish(ok, message) {
  if (done) return;
  done = true;
  child.kill('SIGINT');
  setTimeout(() => child.kill('SIGKILL'), 4000);
  const fs = await import('fs');
  fs.writeFileSync(logPath, out.join(''), 'utf8');
  console.log(`\n[nginx-smoke] log: ${logPath}`);
  if (ok) {
    console.log(`[nginx-smoke] PASS — ${message}`);
    process.exit(0);
  }
  console.error(`[nginx-smoke] FAIL — ${message}`);
  process.exit(1);
}

const interval = setInterval(async () => {
  const text = out.join('');
  if (failPattern.test(text)) {
    clearInterval(interval);
    await finish(false, 'startup error in logs');
    return;
  }
  if (!readyPattern.test(text) || !nginxReadyPattern.test(text)) {
    if (Date.now() > deadline) {
      clearInterval(interval);
      await finish(false, 'timeout waiting for ready banner + nginx');
    }
    return;
  }

  const results = await Promise.all(
    checks.map(([url, status]) => probe(url, status)),
  );
  const failed = results.filter((r) => !r.ok);
  if (failed.length === 0) {
    clearInterval(interval);
    await finish(
      true,
      results.map((r, i) => `${checks[i][2]} (${r.status})`).join('; '),
    );
  } else if (Date.now() > deadline) {
    clearInterval(interval);
    await finish(
      false,
      failed.map((r) => `${r.url} → ${r.status || 'ERR'}`).join(', '),
    );
  }
}, 3000);

child.on('exit', (code) => {
  if (!done) {
    clearInterval(interval);
    void finish(false, `pnpm dev exited with code ${code}`);
  }
});
