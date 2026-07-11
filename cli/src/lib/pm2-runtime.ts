// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { getBundledServerDir, getServerDir } = require('./paths');

/** Internal PM2 app names — not exposed in user-facing CLI copy. */
const PM2_API_APP = 'reactpress-api';
const PM2_CLIENT_APP = 'reactpress-client';

function isPm2Disabled() {
  return process.env.REACTPRESS_DISABLE_PM2 === '1';
}

function resolvePm2Bin(projectRoot) {
  if (isPm2Disabled()) return null;

  const candidates = [
    path.join(getServerDir(projectRoot), 'node_modules', '.bin', 'pm2'),
    path.join(getBundledServerDir(), 'node_modules', '.bin', 'pm2'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  const probe = spawnSync('pm2', ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' });
  return probe.status === 0 ? 'pm2' : null;
}

function isPm2RuntimeAvailable(projectRoot) {
  return Boolean(resolvePm2Bin(projectRoot));
}

function runPm2(projectRoot, args, options = {}) {
  const bin = resolvePm2Bin(projectRoot);
  if (!bin) {
    return { ok: false, error: 'PM2_UNAVAILABLE' };
  }

  const result = spawnSync(bin, args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    encoding: 'utf8',
    stdio: options.stdio ?? 'pipe',
    shell: options.shell ?? false,
  });

  if (result.status !== 0) {
    const message = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
    return { ok: false, error: message || `pm2 exited ${result.status}` };
  }

  return { ok: true, stdout: result.stdout ?? '' };
}

function readPm2Apps(projectRoot) {
  const result = runPm2(projectRoot, ['jlist'], { stdio: 'pipe' });
  if (!result.ok) return [];
  try {
    const apps = JSON.parse(result.stdout);
    return Array.isArray(apps) ? apps : [];
  } catch {
    return [];
  }
}

function getPm2App(projectRoot, name) {
  return readPm2Apps(projectRoot).find((app) => app?.name === name) ?? null;
}

function isPm2AppOnline(projectRoot, name) {
  const app = getPm2App(projectRoot, name);
  return app?.pm2_env?.status === 'online';
}

function getPm2AppPid(projectRoot, name) {
  const app = getPm2App(projectRoot, name);
  return typeof app?.pid === 'number' ? app.pid : null;
}

function stopPm2Apps(projectRoot, names) {
  const bin = resolvePm2Bin(projectRoot);
  if (!bin) return false;

  const targets = names.filter((name) => getPm2App(projectRoot, name));
  if (!targets.length) return false;

  runPm2(projectRoot, ['delete', ...targets], { stdio: 'ignore' });
  return true;
}

module.exports = {
  PM2_API_APP,
  PM2_CLIENT_APP,
  isPm2Disabled,
  resolvePm2Bin,
  isPm2RuntimeAvailable,
  runPm2,
  readPm2Apps,
  getPm2App,
  isPm2AppOnline,
  getPm2AppPid,
  stopPm2Apps,
};
