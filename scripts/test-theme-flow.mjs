#!/usr/bin/env node
/**
 * End-to-end theme install / activate / preview flow for hello-world and starter.
 * Requires `pnpm dev` (API :3002 + theme watchers).
 *
 * Usage: node scripts/test-theme-flow.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = `${process.env.REACTPRESS_TEST_API || 'http://localhost:3002/api'}`;

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'admin', password: 'admin' }),
  });
  const data = await res.json();
  if (!data?.data?.token) throw new Error(`Login failed: ${JSON.stringify(data)}`);
  return data.data.token;
}

async function api(token, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

async function waitForUrl(url, maxMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function readJson(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const results = [];
function pass(name) {
  results.push({ name, ok: true });
  console.log('✓', name);
}
function fail(name, err) {
  results.push({ name, ok: false, err });
  console.error('✗', name, err);
}

async function main() {
  const health = await fetch(`${API}/health`).catch(() => null);
  if (!health?.ok) {
    console.error('API not reachable — start `pnpm dev` first.');
    process.exit(1);
  }

  const token = await login();
  console.log('Logged in');

  const themes = await api(token, 'GET', '/extension/themes');
  if (themes.status !== 200) fail('list themes', themes.json);
  else pass('list themes');

  const helloWorld = themes.json?.data?.find?.((t) => t.id === 'hello-world');
  const starter = themes.json?.data?.find?.((t) => t.id === 'reactpress-theme-starter');
  if (!helloWorld) fail('hello-world in catalog', 'missing');
  else pass('hello-world in catalog');
  if (!starter) fail('starter in catalog', 'missing');
  else pass('starter in catalog');

  if (!helloWorld.installed) {
    const r = await api(token, 'POST', '/extension/themes/hello-world/install');
    if (r.status >= 400) fail('install hello-world', r.json);
    else pass('install hello-world');
  } else pass('hello-world already installed');

  if (!starter.installed) {
    console.log('Installing starter from npm…');
    const r = await api(token, 'POST', '/extension/themes/install-npm', {
      spec: '@fecommunity/reactpress-theme-starter@1.0.0-beta.0',
    });
    if (r.status >= 400) fail('install starter', r.json);
    else pass('install starter');
  } else pass('starter already installed');

  let r = await api(token, 'POST', '/extension/themes/hello-world/activate');
  if (r.status >= 400) fail('activate hello-world', r.json);
  else pass('activate hello-world');

  await new Promise((resolve) => setTimeout(resolve, 2000));
  let active = readJson('.reactpress/active-theme.json');
  if (active?.activeTheme !== 'hello-world' || !active?.themeDir) {
    fail('active-theme.json after hello-world activate', active);
  } else pass('active-theme.json correct for hello-world');

  if (!(await waitForUrl('http://localhost:3001/'))) fail('hello-world site :3001 ready', 'timeout');
  else pass('hello-world site :3001 ready');

  r = await api(token, 'POST', '/extension/themes/reactpress-theme-starter/preview-session');
  if (r.status >= 400) fail('preview-session starter', r.json);
  else {
    const previewUrl = r.json?.data?.previewSiteUrl;
    if (!previewUrl) fail('preview-session starter previewSiteUrl', r.json);
    else {
      pass('preview-session starter returns previewSiteUrl');
      const preview = readJson('.reactpress/preview-theme.json');
      if (preview?.activeTheme !== 'reactpress-theme-starter') fail('preview-theme.json', preview);
      else pass('preview-theme.json set for starter');
      if (!(await waitForUrl(previewUrl, 180_000))) fail('starter preview :3003 ready', 'timeout');
      else pass('starter preview :3003 ready');
    }
  }

  r = await api(token, 'POST', '/extension/themes/preview-session/end');
  if (r.status >= 400) fail('end preview session', r.json);
  else pass('end preview session');

  r = await api(token, 'POST', '/extension/themes/reactpress-theme-starter/activate');
  if (r.status >= 400) fail('activate starter', r.json);
  else pass('activate starter');

  await new Promise((resolve) => setTimeout(resolve, 3000));
  active = readJson('.reactpress/active-theme.json');
  if (active?.activeTheme !== 'reactpress-theme-starter' || !active?.themeDir) {
    fail('active-theme.json after starter activate', active);
  } else pass('active-theme.json correct for starter');

  if (!(await waitForUrl('http://localhost:3001/', 120_000))) fail('starter site :3001 ready', 'timeout');
  else pass('starter site :3001 ready');

  r = await api(token, 'POST', '/extension/themes/hello-world/preview-session');
  if (r.status >= 400) fail('preview-session hello-world', r.json);
  else {
    const previewUrl = r.json?.data?.previewSiteUrl;
    if (!previewUrl) fail('preview-session hello-world previewSiteUrl', r.json);
    else {
      pass('preview-session hello-world returns previewSiteUrl');
      if (!(await waitForUrl(previewUrl, 120_000))) fail('hello-world preview :3003 ready', 'timeout');
      else pass('hello-world preview :3003 ready');
    }
  }

  r = await api(token, 'POST', '/extension/themes/hello-world/activate');
  if (r.status >= 400) fail('re-activate hello-world', r.json);
  else pass('re-activate hello-world');

  await new Promise((resolve) => setTimeout(resolve, 3000));
  if (!(await waitForUrl('http://localhost:3001/', 90_000))) fail('hello-world site after re-activate', 'timeout');
  else pass('hello-world site after re-activate');

  const failed = results.filter((item) => !item.ok);
  console.log('\n=== SUMMARY ===');
  console.log(`Passed: ${results.filter((item) => item.ok).length}/${results.length}`);
  if (failed.length) {
    console.error('Failed:', failed);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
