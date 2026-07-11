// @ts-nocheck
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { getCliPackageRoot, isUsingMonorepoServer } = require('./paths');
const { t } = require('./i18n');

const SERVER_RUNTIME_MODULES = [
  '@nestjs/core',
  '@nestjs/typeorm',
  'typeorm',
  'express',
  '@fecommunity/reactpress-toolkit',
];

function getBundledServerDir() {
  return path.join(getCliPackageRoot(), 'server');
}

function getBundledToolkitEntry() {
  return path.join(getCliPackageRoot(), 'toolkit', 'dist', 'index.js');
}

function pathExists(target) {
  try {
    return fs.existsSync(target);
  } catch {
    return false;
  }
}

function isBundledServerReady() {
  const serverDir = getBundledServerDir();
  if (!pathExists(path.join(serverDir, 'dist', 'main.js'))) return false;
  if (!pathExists(getBundledToolkitEntry())) return false;

  for (const mod of SERVER_RUNTIME_MODULES) {
    const modPath = mod.startsWith('@')
      ? path.join(serverDir, 'node_modules', ...mod.split('/'))
      : path.join(serverDir, 'node_modules', mod);
    if (!pathExists(modPath)) return false;
  }
  return true;
}

function getNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

async function ensureBundledServerDeps(projectRoot) {
  if (isUsingMonorepoServer(projectRoot)) {
    return { ok: true };
  }
  if (isBundledServerReady()) {
    return { ok: true };
  }

  const serverDir = getBundledServerDir();
  if (!pathExists(path.join(serverDir, 'package.json'))) {
    return { ok: false, message: t('bundle.serverBundle.missing') };
  }
  if (!pathExists(path.join(serverDir, 'dist', 'main.js'))) {
    return { ok: false, message: t('bundle.serverBundle.notBuilt') };
  }
  if (!pathExists(getBundledToolkitEntry())) {
    return { ok: false, message: t('bundle.serverBundle.toolkitMissing') };
  }

  console.log(t('bundle.serverBundle.installing'));

  const result = spawnSync(
    getNpmCommand(),
    ['install', '--omit=dev', '--legacy-peer-deps', '--no-bin-links'],
    {
      cwd: serverDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    },
  );

  if (result.status !== 0) {
    return { ok: false, message: t('bundle.serverBundle.installFailed') };
  }
  if (!isBundledServerReady()) {
    return { ok: false, message: t('bundle.serverBundle.notBuilt') };
  }
  return { ok: true };
}

module.exports = {
  ensureBundledServerDeps,
  isBundledServerReady,
  getBundledServerDir,
};
