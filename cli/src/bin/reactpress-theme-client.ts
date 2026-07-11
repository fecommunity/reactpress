#!/usr/bin/env node
// @ts-nocheck

/**
 * Generic ReactPress theme client launcher (for themes without bin/reactpress-client.js).
 * Set REACTPRESS_THEME_DIR to the active theme package root.
 */

const path = require('path');
const fs = require('fs');
const { spawn, spawnSync } = require('child_process');
const { hasUsableProductionBuild } = require('../lib/theme-prod');
const { getPm2ClientMemoryRestart, resolveBuildNodeEnv } = require('../lib/prod-memory');
const { readActiveThemeManifest } = require('../lib/theme-runtime');

const originalCwd = process.env.REACTPRESS_ORIGINAL_CWD || process.cwd();
const args = process.argv.slice(2);
const usePM2 = args.includes('--pm2');

const clientDir = process.env.REACTPRESS_THEME_DIR
  ? path.resolve(process.env.REACTPRESS_THEME_DIR)
  : null;

if (!clientDir || !fs.existsSync(path.join(clientDir, 'package.json'))) {
  console.error('[ReactPress Client] REACTPRESS_THEME_DIR must point to a theme package');
  process.exit(1);
}

const nextDir = path.join(clientDir, '.next');
const startScript = fs.existsSync(path.join(clientDir, 'server.js')) ? 'server.js' : null;

function resolveWebPackageRoot(projectRoot) {
  const candidates = [
    path.join(projectRoot, 'web'),
    path.join(projectRoot, '..', 'web'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
  }
  return null;
}

function ensureAdminStaticForTheme(projectRoot, themeDir) {
  const adminIndex = path.join(themeDir, 'public', 'admin', 'index.html');
  if (fs.existsSync(adminIndex)) return;

  const webRoot = resolveWebPackageRoot(projectRoot);
  if (!webRoot) {
    console.warn('[ReactPress Client] Admin static missing and web package not found');
    return;
  }

  const webDist = path.join(webRoot, 'dist', 'index.html');
  if (!fs.existsSync(webDist)) {
    console.log('[ReactPress Client] Building admin SPA (web/)…');
    const buildWeb = spawnSync('pnpm', ['run', 'build'], { cwd: webRoot, stdio: 'inherit' });
    if (buildWeb.status !== 0) process.exit(buildWeb.status || 1);
  }

  const syncScript = path.join(webRoot, 'bin', 'reactpress-web.js');
  const publicAdmin = path.join(themeDir, 'public', 'admin');
  console.log('[ReactPress Client] Syncing admin static → theme public/admin…');
  const sync = spawnSync(process.execPath, [syncScript, 'sync-public', publicAdmin], {
    stdio: 'inherit',
    cwd: webRoot,
  });
  if (sync.status !== 0) process.exit(sync.status || 1);
}

function runStartCommand() {
  if (startScript) {
    return ['node', [startScript]];
  }
  return ['npm', ['run', 'start']];
}

function ensureBuilt() {
  ensureAdminStaticForTheme(originalCwd, clientDir);
  const { activeTheme } = readActiveThemeManifest(originalCwd);
  const themeId = process.env.REACTPRESS_THEME_ID || activeTheme || path.basename(clientDir);
  if (hasUsableProductionBuild(clientDir, themeId)) return;
  console.log('[ReactPress Client] Client not built yet. Building…');
  const build = spawnSync('pnpm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: clientDir,
    env: resolveBuildNodeEnv({ ...process.env, REACTPRESS_BUILD_ACTIVE: '1' }),
  });
  if (build.status !== 0) process.exit(build.status || 1);
}

function startWithPm2() {
  ensureBuilt();
  const [cmd, cmdArgs] = runStartCommand();
  const visitorPort = process.env.CLIENT_PORT || process.env.PORT || '3001';
  const apiPort = process.env.SERVER_PORT || '3002';
  const nginxEntry = (process.env.REACTPRESS_NGINX_ENTRY_URL || process.env.NGINX_ENTRY_URL || '')
    .replace(/\/$/, '');
  const pm2Env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(visitorPort),
    CLIENT_PORT: String(visitorPort),
    REACTPRESS_ORIGINAL_CWD: originalCwd,
    REACTPRESS_THEME_DIR: clientDir,
    REACTPRESS_API_URL: process.env.REACTPRESS_API_URL || `http://127.0.0.1:${apiPort}/api`,
    SERVER_API_URL: process.env.SERVER_API_URL || `http://127.0.0.1:${apiPort}/api`,
    NEXT_PUBLIC_REACTPRESS_API_URL:
      process.env.NEXT_PUBLIC_REACTPRESS_API_URL ||
      (nginxEntry ? `${nginxEntry}/api` : `http://127.0.0.1:${apiPort}/api`),
    ...(nginxEntry
      ? { REACTPRESS_NGINX_ENTRY_URL: nginxEntry, NGINX_ENTRY_URL: nginxEntry }
      : { REACTPRESS_SKIP_DEV_PORT_REDIRECT: '1' }),
  };

  const pm2Mem = getPm2ClientMemoryRestart();
  const pm2Args =
    cmd === 'node'
      ? [
          'start',
          cmd,
          '--name',
          'reactpress-client',
          '--update-env',
          '--max-memory-restart',
          pm2Mem,
          '--',
          ...cmdArgs,
        ]
      : [
          'start',
          cmd,
          '--name',
          'reactpress-client',
          '--update-env',
          '--max-memory-restart',
          pm2Mem,
          '--',
          ...cmdArgs,
        ];

  const child = spawn('pm2', pm2Args, { stdio: 'inherit', cwd: clientDir, env: pm2Env });
  child.on('close', (code) => process.exit(code ?? 0));
  child.on('error', (err) => {
    console.error('[ReactPress Client] PM2 failed:', err);
    process.exit(1);
  });
}

function productionThemeEnv() {
  const visitorPort = process.env.CLIENT_PORT || process.env.PORT || '3001';
  const apiPort = process.env.SERVER_PORT || '3002';
  const clientSiteUrl =
    process.env.CLIENT_SITE_URL || process.env.NEXT_PUBLIC_CLIENT_SITE_URL || `http://127.0.0.1:${visitorPort}`;
  const adminUrl = `${clientSiteUrl.replace(/\/$/, '')}/admin/`;
  return {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(visitorPort),
    CLIENT_PORT: String(visitorPort),
    CLIENT_SITE_URL: clientSiteUrl,
    NEXT_PUBLIC_CLIENT_SITE_URL: clientSiteUrl,
    REACTPRESS_ORIGINAL_CWD: originalCwd,
    REACTPRESS_THEME_DIR: clientDir,
    REACTPRESS_API_URL: process.env.REACTPRESS_API_URL || `http://127.0.0.1:${apiPort}/api`,
    SERVER_API_URL: process.env.SERVER_API_URL || `http://127.0.0.1:${apiPort}/api`,
    NEXT_PUBLIC_REACTPRESS_API_URL:
      process.env.NEXT_PUBLIC_REACTPRESS_API_URL || `http://127.0.0.1:${apiPort}/api`,
    NEXT_PUBLIC_REACTPRESS_ADMIN_URL: process.env.NEXT_PUBLIC_REACTPRESS_ADMIN_URL || adminUrl,
    REACTPRESS_SKIP_DEV_PORT_REDIRECT: '1',
  };
}

function startWithNode() {
  ensureBuilt();
  process.chdir(clientDir);
  const [cmd, cmdArgs] = runStartCommand();
  const child = spawn(cmd, cmdArgs, {
    stdio: 'inherit',
    cwd: clientDir,
    env: productionThemeEnv(),
  });
  child.on('close', (code) => process.exit(code ?? 0));
}

if (usePM2) {
  startWithPm2();
} else {
  startWithNode();
}
