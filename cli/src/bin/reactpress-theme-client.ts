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
const { resolvePm2Bin } = require('../lib/pm2-runtime');
const { readActiveThemeManifest } = require('../lib/theme-runtime');
const {
  ensureAdminStaticForTheme,
  shouldRebuildThemeAfterAdminSync,
} = require('../core/services/admin-static');
const { patchThemeApiProxyRoute } = require('../lib/theme-api-proxy-patch');

const originalCwd = process.env.REACTPRESS_ORIGINAL_CWD || process.cwd();
const args = process.argv.slice(2);
const usePM2 = args.includes('--pm2');
const useBackground = args.includes('--bg');
const usePm2Background = args.includes('--pm2-bg');

const clientDir = process.env.REACTPRESS_THEME_DIR
  ? path.resolve(process.env.REACTPRESS_THEME_DIR)
  : null;

if (!clientDir || !fs.existsSync(path.join(clientDir, 'package.json'))) {
  console.error('[ReactPress Client] REACTPRESS_THEME_DIR must point to a theme package');
  process.exit(1);
}

const nextDir = path.join(clientDir, '.next');
const startScript = fs.existsSync(path.join(clientDir, 'server.js')) ? 'server.js' : null;

function runStartCommand() {
  if (startScript) {
    return ['node', [startScript]];
  }
  return ['npm', ['run', 'start']];
}

function ensureBuilt() {
  const adminSynced = ensureAdminStaticForTheme(originalCwd, clientDir);
  const apiProxyPatched = patchThemeApiProxyRoute(clientDir);
  const { activeTheme } = readActiveThemeManifest(originalCwd);
  const themeId = process.env.REACTPRESS_THEME_ID || activeTheme || path.basename(clientDir);
  const needsRebuild =
    adminSynced ||
    apiProxyPatched ||
    shouldRebuildThemeAfterAdminSync(clientDir) ||
    !hasUsableProductionBuild(clientDir, themeId);
  if (!needsRebuild) return;
  console.log('[ReactPress Client] Client not built yet. Building…');
  const build = spawnSync('pnpm', ['run', 'build'], {
    stdio: 'inherit',
    cwd: clientDir,
    env: resolveBuildNodeEnv({ ...process.env, REACTPRESS_BUILD_ACTIVE: '1' }),
  });
  if (build.status !== 0) process.exit(build.status || 1);
}

function buildPm2ClientArgs(cmd, cmdArgs) {
  const pm2Mem = getPm2ClientMemoryRestart();
  return cmd === 'node'
    ? [
        'start',
        cmd,
        '--name',
        'reactpress-client',
        '--update-env',
        '--max-memory-restart',
        pm2Mem,
        '-f',
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
        '-f',
        '--',
        ...cmdArgs,
      ];
}

function startWithPm2() {
  ensureBuilt();
  const [cmd, cmdArgs] = runStartCommand();
  const pm2Env = productionThemeEnv();
  const pm2Bin = resolvePm2Bin(originalCwd) || 'pm2';
  const pm2Args = buildPm2ClientArgs(cmd, cmdArgs);

  const child = spawn(pm2Bin, pm2Args, { stdio: 'inherit', cwd: clientDir, env: pm2Env, shell: cmd !== 'node' });
  child.on('close', (code) => process.exit(code ?? 0));
  child.on('error', (err) => {
    console.error('[ReactPress Client] Failed to start site:', err);
    process.exit(1);
  });
}

function startWithPm2Background() {
  ensureBuilt();
  const [cmd, cmdArgs] = runStartCommand();
  const pm2Env = productionThemeEnv();
  const pm2Bin = resolvePm2Bin(originalCwd);
  if (!pm2Bin) {
    startWithNodeBackground();
    return;
  }

  const result = spawnSync(
    pm2Bin,
    buildPm2ClientArgs(cmd, cmdArgs),
    {
      cwd: clientDir,
      env: pm2Env,
      stdio: 'inherit',
      shell: cmd !== 'node' && process.platform === 'win32',
    },
  );
  if (result.status !== 0) {
    console.warn('[ReactPress Client] Falling back to background node start');
    startWithNodeBackground();
    return;
  }
  console.log('[ReactPress Client] Site started in background');
  process.exit(0);
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

function resolveBackgroundStartCommand() {
  if (startScript) {
    return { cmd: 'node', args: [startScript], env: {} };
  }

  const env = productionThemeEnv();
  const port = String(env.PORT || '3001');
  const nextBin = path.join(clientDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (fs.existsSync(nextBin)) {
    return {
      cmd: process.execPath,
      args: [nextBin, 'start', '-p', port],
      env: { INIT_CWD: clientDir },
    };
  }

  return { cmd: 'npm', args: ['run', 'start'], env: {}, shell: process.platform === 'win32' };
}

function startWithNodeBackground() {
  ensureBuilt();
  const { cmd, args: cmdArgs, env: envExtra = {}, shell = false } = resolveBackgroundStartCommand();
  const logDir = path.join(originalCwd, '.reactpress', 'logs', 'client');
  fs.mkdirSync(logDir, { recursive: true });
  const outPath = path.join(logDir, 'stdout.log');
  const errPath = path.join(logDir, 'stderr.log');
  const outFd = fs.openSync(outPath, 'a');
  const errFd = fs.openSync(errPath, 'a');

  const child = spawn(cmd, cmdArgs, {
    detached: true,
    stdio: ['ignore', outFd, errFd],
    cwd: clientDir,
    shell,
    env: {
      ...productionThemeEnv(),
      ...envExtra,
    },
  });

  child.unref();
  fs.closeSync(outFd);
  fs.closeSync(errFd);

  const { writeClientPid } = require('../lib/process');
  writeClientPid(originalCwd, child.pid);
  console.log(`[ReactPress Client] Started in background (pid ${child.pid})`);
  process.exit(0);
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
} else if (usePm2Background) {
  startWithPm2Background();
} else if (useBackground) {
  startWithNodeBackground();
} else {
  startWithNode();
}
