/**
 * Guardrails so desktop release artifacts cannot silently lag behind source edits.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CACHE_PATHS } from './cache-dir.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, '..');
const root = path.resolve(desktopDir, '..');

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'out',
  '.cache',
  'release',
  '.git',
  'coverage',
  '.next',
  '.next-preview',
]);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.json']);
const FINGERPRINT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs']);

/** @typedef {{ label: string, sourceDirs: string[], sourceFiles?: string[], dependsOn?: string[], artifactPath?: string, artifactDir?: string, toleranceMs?: number }} BuildArtifactSpec */

/** @param {string} dir */
function newestSourceMtime(dir) {
  if (!fs.existsSync(dir)) return 0;

  let newest = 0;

  /** @param {string} current */
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(fullPath);
        continue;
      }
      if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
      const mtime = fs.statSync(fullPath).mtimeMs;
      if (mtime > newest) newest = mtime;
    }
  }

  walk(dir);
  return newest;
}

/** @param {string} dir @param {string} [extension] */
function newestFileMtime(dir, extension = '.js') {
  if (!fs.existsSync(dir)) return 0;

  let newest = 0;

  /** @param {string} current */
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith(extension)) continue;
      newest = Math.max(newest, fs.statSync(fullPath).mtimeMs);
    }
  }

  walk(dir);
  return newest;
}

/** @param {string[]} sourceDirs */
function collectSourcePaths(sourceDirs) {
  /** @type {string[]} */
  const paths = [];

  /** @param {string} dir */
  function walk(dir) {
    if (!fs.existsSync(dir)) return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(fullPath);
        continue;
      }
      if (!FINGERPRINT_EXTENSIONS.has(path.extname(entry.name))) continue;
      paths.push(fullPath);
    }
  }

  for (const dir of sourceDirs) walk(dir);
  return paths.sort();
}

/** @param {string} filePath */
function fileContentFingerprint(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const hash = crypto.createHash('sha256');
  hash.update(path.relative(root, filePath));
  hash.update('\0');
  hash.update(fs.readFileSync(filePath));
  hash.update('\0');
  return hash.digest('hex');
}

/** @param {string[]} sourceDirs @param {string[]} [sourceFiles] */
function sourceTreeFingerprint(sourceDirs, sourceFiles = []) {
  const hash = crypto.createHash('sha256');
  for (const filePath of collectSourcePaths(sourceDirs)) {
    hash.update(path.relative(root, filePath));
    hash.update('\0');
    hash.update(fs.readFileSync(filePath));
    hash.update('\0');
  }
  for (const filePath of sourceFiles) {
    hash.update(fileContentFingerprint(filePath));
    hash.update('\0');
  }
  return hash.digest('hex');
}

/** @param {BuildArtifactSpec} spec */
function fingerprintFilePath({ label, artifactPath, artifactDir }) {
  const base = artifactDir ?? path.dirname(artifactPath ?? '');
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return path.join(base, `.source-fingerprint-${slug}`);
}

/** @param {BuildArtifactSpec} spec */
function readStoredFingerprint(spec) {
  const fpPath = fingerprintFilePath(spec);
  if (!fs.existsSync(fpPath)) return null;
  return fs.readFileSync(fpPath, 'utf8').trim();
}

/** @param {BuildArtifactSpec} spec @param {string} fingerprint */
export function writeBuildArtifactFingerprint(spec, fingerprint) {
  const fpPath = fingerprintFilePath(spec);
  fs.mkdirSync(path.dirname(fpPath), { recursive: true });
  fs.writeFileSync(fpPath, `${fingerprint}\n`);
}

/** @param {BuildArtifactSpec} spec */
function artifactExists({ artifactPath, artifactDir }) {
  if (artifactDir) return newestFileMtime(artifactDir) > 0;
  return Boolean(artifactPath && fs.existsSync(artifactPath));
}

/** @returns {BuildArtifactSpec[]} */
export function workspaceBuildSpecs() {
  return [
    {
      label: 'toolkit',
      sourceDirs: [path.join(root, 'toolkit/src')],
      artifactDir: path.join(root, 'toolkit/dist'),
    },
    {
      label: 'cli',
      sourceDirs: [path.join(root, 'cli/src')],
      artifactDir: path.join(root, 'cli/out'),
      dependsOn: ['toolkit'],
    },
    {
      label: 'desktop shell',
      sourceDirs: [
        path.join(desktopDir, 'src/main'),
        path.join(desktopDir, 'src/shared'),
        path.join(desktopDir, 'src/preload'),
      ],
      artifactPath: path.join(desktopDir, 'out/main/index.js'),
    },
    {
      label: 'server API',
      sourceDirs: [path.join(root, 'server/src')],
      artifactDir: path.join(root, 'server/dist'),
      dependsOn: ['toolkit'],
    },
    {
      label: 'web (electron)',
      sourceDirs: [path.join(root, 'web/src')],
      sourceFiles: [path.join(root, 'web/index.html'), path.join(root, 'web/.env.electron')],
      artifactDir: path.join(root, 'web/dist'),
      dependsOn: ['toolkit'],
    },
  ];
}

/** @param {string} label @param {BuildArtifactSpec[]} [specs] */
function findBuildSpec(label, specs = workspaceBuildSpecs()) {
  const spec = specs.find((entry) => entry.label === label);
  if (!spec) throw new Error(`[desktop] Unknown build spec: ${label}`);
  return spec;
}

/** @param {BuildArtifactSpec} spec */
function currentBuildFingerprint(spec) {
  return sourceTreeFingerprint(spec.sourceDirs, spec.sourceFiles);
}

/** @param {BuildArtifactSpec} spec @param {BuildArtifactSpec[]} [specs] */
export function isBuildArtifactStale(spec, specs = workspaceBuildSpecs()) {
  if (!artifactExists(spec)) return true;

  const stored = readStoredFingerprint(spec);
  if (stored !== null && stored !== currentBuildFingerprint(spec)) return true;

  for (const depLabel of spec.dependsOn ?? []) {
    if (isBuildArtifactStale(findBuildSpec(depLabel, specs), specs)) return true;
  }

  return false;
}

/** @param {string} label @param {BuildArtifactSpec[]} [specs] */
export function isWorkspaceTargetStale(label, specs = workspaceBuildSpecs()) {
  return isBuildArtifactStale(findBuildSpec(label, specs), specs);
}

/** @param {string} themeDir @param {string} label */
export function themePackageBuildSpec(themeDir, label) {
  return {
    label,
    sourceDirs: [themeDir],
    artifactPath: path.join(themeDir, '.next', 'BUILD_ID'),
  };
}

/** @param {string} themeDir @param {string} label */
export function isThemePackageBuildFresh(themeDir, label) {
  if (!fs.existsSync(path.join(themeDir, '.next', 'BUILD_ID'))) return false;
  return !isBuildArtifactStale(themePackageBuildSpec(themeDir, label));
}

/** @param {string} themeDir @param {string} label */
export function writeThemePackageBuildFingerprint(themeDir, label) {
  writeBuildArtifactFingerprint(themePackageBuildSpec(themeDir, label), sourceTreeFingerprint([themeDir]));
}

/** @param {BuildArtifactSpec[]} [specs] */
export function writeWorkspaceBuildFingerprints(specs = workspaceBuildSpecs()) {
  for (const spec of specs) {
    writeBuildArtifactFingerprint(spec, currentBuildFingerprint(spec));
  }
}

/**
 * Fail when compiled output is older than its source tree (common stale-DMG cause).
 * @param {BuildArtifactSpec} options
 */
export function assertBuildArtifactFresh({
  label,
  sourceDirs,
  sourceFiles = [],
  artifactPath,
  artifactDir,
  toleranceMs = 1500,
}) {
  const artifactMtime = artifactDir
    ? newestFileMtime(artifactDir)
    : artifactPath && fs.existsSync(artifactPath)
      ? fs.statSync(artifactPath).mtimeMs
      : 0;

  if (!artifactMtime) {
    const target = artifactDir ?? artifactPath;
    throw new Error(
      `[desktop] ${label}: build output missing (${target}). The compile step did not produce artifacts.`
    );
  }

  const spec = { label, sourceDirs, sourceFiles, artifactPath, artifactDir, toleranceMs };
  const currentFingerprint = currentBuildFingerprint(spec);
  const storedFingerprint = readStoredFingerprint(spec);

  if (storedFingerprint === currentFingerprint) return;

  if (storedFingerprint === null) {
    writeBuildArtifactFingerprint(spec, currentFingerprint);
    return;
  }

  const sourceNewest = Math.max(0, ...sourceDirs.map((dir) => newestSourceMtime(dir)));
  const target = artifactDir ?? artifactPath;
  throw new Error(
    [
      `[desktop] ${label}: source is newer than build output — refusing to package stale artifacts.`,
      '  reason        : source content changed since the last recorded build',
      `  newest source : ${new Date(sourceNewest).toISOString()}`,
      `  build output  : ${new Date(artifactMtime).toISOString()} (${target})`,
      '  Fix: save files and re-run pnpm build:desktop (do not reuse an older release/*.dmg).',
    ].join('\n')
  );
}

/** @param {string} src @param {string} dest */
function assertSameFile(src, dest, label) {
  if (!fs.existsSync(dest)) {
    throw new Error(`[desktop] ${label}: staged file missing (${dest})`);
  }
  const a = fs.readFileSync(src);
  const b = fs.readFileSync(dest);
  if (!a.equals(b)) {
    throw new Error(
      `[desktop] ${label}: staged copy differs from workspace build (${dest}). Re-run pnpm build:desktop.`
    );
  }
}

/** Ensure Phase 1/2 outputs reflect current workspace sources. */
export function assertWorkspaceBuildsFresh() {
  for (const spec of workspaceBuildSpecs()) {
    assertBuildArtifactFresh(spec);
  }
}

/** Ensure staged Resources mirror freshly built workspace artifacts. */
export function verifyStagedAppResources(appResourcesDir = CACHE_PATHS.appResources) {
  assertSameFile(
    path.join(root, 'server/dist/logger/index.js'),
    path.join(appResourcesDir, 'server/dist/logger/index.js'),
    'staged server logger'
  );
  assertSameFile(
    path.join(root, 'server/dist/main.js'),
    path.join(appResourcesDir, 'server/dist/main.js'),
    'staged server main'
  );
}

/** @param {string} appResourcesDir */
export function writeBuildManifest(appResourcesDir) {
  const manifest = {
    builtAt: new Date().toISOString(),
    desktop: {
      main: fs.statSync(path.join(desktopDir, 'out/main/index.js')).mtime.toISOString(),
    },
    server: {
      main: fs.statSync(path.join(root, 'server/dist/main.js')).mtime.toISOString(),
      logger: fs.statSync(path.join(root, 'server/dist/logger/index.js')).mtime.toISOString(),
    },
  };
  fs.writeFileSync(path.join(appResourcesDir, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/** Remove previous installer outputs so a failed rebuild cannot be mistaken for success. */
export function pruneStaleReleaseArtifacts(releaseDir = path.join(desktopDir, 'release')) {
  if (!fs.existsSync(releaseDir)) return;

  for (const name of fs.readdirSync(releaseDir)) {
    if (/^ReactPress-.*\.(dmg|zip|blockmap)$/i.test(name)) {
      fs.rmSync(path.join(releaseDir, name), { force: true });
    }
  }
}

/** @returns {string} */
function defaultPackagedAppPath() {
  switch (process.platform) {
    case 'win32':
      return path.join(desktopDir, 'release/win-unpacked');
    case 'linux':
      return path.join(desktopDir, 'release/linux-unpacked');
    default:
      return path.join(desktopDir, 'release/mac-arm64/ReactPress.app');
  }
}

/** @returns {string} */
export function resolvePackagedAppPath() {
  const platformCandidates = {
    darwin: [
      path.join(desktopDir, 'release/mac-arm64/ReactPress.app'),
      path.join(desktopDir, 'release/mac/ReactPress.app'),
    ],
    win32: [path.join(desktopDir, 'release/win-unpacked')],
    linux: [path.join(desktopDir, 'release/linux-unpacked')],
  };

  const candidates = [
    ...(platformCandidates[process.platform] ?? []),
    path.join(desktopDir, 'release/mac-arm64/ReactPress.app'),
    path.join(desktopDir, 'release/mac/ReactPress.app'),
    path.join(desktopDir, 'release/win-unpacked'),
    path.join(desktopDir, 'release/linux-unpacked'),
  ];

  const seen = new Set();
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    if (fs.existsSync(candidate)) return candidate;
  }
  return defaultPackagedAppPath();
}

/** @param {string} appRoot */
function packagedResourcePaths(appRoot) {
  const resourcesDir = appRoot.endsWith('.app')
    ? path.join(appRoot, 'Contents/Resources')
    : path.join(appRoot, 'resources');
  return {
    resourcesDir,
    asarPath: path.join(resourcesDir, 'app.asar'),
    stagedLogger: path.join(resourcesDir, 'server/dist/logger/index.js'),
    manifestPath: path.join(resourcesDir, 'build-manifest.json'),
  };
}

/**
 * @param {string} [appPath]
 * @returns {{ appPath: string, manifest: Record<string, unknown> | null }}
 */
export function verifyPackagedApp(appPath) {
  const resolved = appPath ?? resolvePackagedAppPath();

  if (!fs.existsSync(resolved)) {
    throw new Error(`[desktop] Packaged app missing (${resolved}). electron-builder did not emit a ReactPress bundle.`);
  }

  const { asarPath, stagedLogger, manifestPath } = packagedResourcePaths(resolved);

  if (!fs.existsSync(asarPath)) {
    throw new Error(`[desktop] Packaged app.asar missing (${asarPath})`);
  }
  if (!fs.existsSync(stagedLogger)) {
    throw new Error(`[desktop] Packaged server logger missing (${stagedLogger})`);
  }

  assertSameFile(path.join(root, 'server/dist/logger/index.js'), stagedLogger, 'packaged server logger');

  const asarMtime = fs.statSync(asarPath).mtimeMs;
  const outMtime = fs.statSync(path.join(desktopDir, 'out/main/index.js')).mtimeMs;
  if (asarMtime + 1500 < outMtime) {
    throw new Error(
      [
        '[desktop] Packaged app.asar is older than desktop/out — installer may be stale.',
        `  app.asar : ${new Date(asarMtime).toISOString()}`,
        `  out/main : ${new Date(outMtime).toISOString()}`,
      ].join('\n')
    );
  }

  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  }

  return { appPath: resolved, manifest };
}

const STAGING_FINGERPRINT_PATH = path.join(desktopDir, '.cache', 'staging-fingerprint');

/** @param {Record<string, string>} sharedRuntimeVersions */
export function computeAppResourcesStagingFingerprint(sharedRuntimeVersions) {
  const hash = crypto.createHash('sha256');

  const add = (key, value) => {
    hash.update(key);
    hash.update('\0');
    hash.update(value);
    hash.update('\0');
  };

  for (const spec of workspaceBuildSpecs()) {
    add(`build:${spec.label}`, currentBuildFingerprint(spec));
  }

  add('web-dist', fileContentFingerprint(path.join(root, 'web/dist/index.html')));

  for (const name of ['hello-world', 'theme-starter']) {
    const themeDir = path.join(root, 'themes', name);
    if (!fs.existsSync(themeDir)) continue;
    add(`theme:${name}`, sourceTreeFingerprint([themeDir]));
    add(`theme:${name}:next`, fileContentFingerprint(path.join(themeDir, '.next', 'BUILD_ID')));
    add(`theme:${name}:preview`, fileContentFingerprint(path.join(themeDir, '.next-preview', 'BUILD_ID')));
  }

  const starterRuntime = path.join(root, '.reactpress', 'runtime', 'reactpress-theme-starter');
  if (fs.existsSync(starterRuntime)) {
    add('runtime-starter', sourceTreeFingerprint([starterRuntime]));
    add('runtime-starter:next', fileContentFingerprint(path.join(starterRuntime, '.next', 'BUILD_ID')));
    add('runtime-starter:preview', fileContentFingerprint(path.join(starterRuntime, '.next-preview', 'BUILD_ID')));
  }

  add('shared-runtime-versions', JSON.stringify(sharedRuntimeVersions));
  add('themes-lock', fileContentFingerprint(path.join(root, '.reactpress', 'themes.lock.json')));
  add('plugins-registry', fileContentFingerprint(path.join(root, 'plugins', 'package.json')));

  const pluginsRoot = path.join(root, 'plugins');
  if (fs.existsSync(pluginsRoot)) {
    for (const entry of fs.readdirSync(pluginsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pluginDir = path.join(pluginsRoot, entry.name);
      if (!fs.existsSync(path.join(pluginDir, 'plugin.json'))) continue;
      add(`plugin:${entry.name}`, sourceTreeFingerprint([pluginDir]));
      add(`plugin:${entry.name}:dist`, fileContentFingerprint(path.join(pluginDir, 'dist', 'index.js')));
    }
  }

  add('pnpm-lock', fileContentFingerprint(path.join(root, 'pnpm-lock.yaml')));

  return hash.digest('hex');
}

/** @param {string} fingerprint */
export function writeStagingFingerprint(fingerprint) {
  fs.mkdirSync(path.dirname(STAGING_FINGERPRINT_PATH), { recursive: true });
  fs.writeFileSync(STAGING_FINGERPRINT_PATH, `${fingerprint}\n`);
}

export function readStagingFingerprint() {
  if (!fs.existsSync(STAGING_FINGERPRINT_PATH)) return null;
  return fs.readFileSync(STAGING_FINGERPRINT_PATH, 'utf8').trim();
}

/** @param {string} fingerprint */
export function isAppResourcesStagingFresh(fingerprint) {
  return (
    readStagingFingerprint() === fingerprint &&
    fs.existsSync(CACHE_PATHS.appResources) &&
    fs.existsSync(path.join(CACHE_PATHS.appResources, 'server/dist/main.js'))
  );
}

const PACKAGING_FINGERPRINT_PATH = path.join(desktopDir, '.cache', 'packaging-fingerprint');

/** @param {Record<string, string>} sharedRuntimeVersions */
export function computePackagingFingerprint(sharedRuntimeVersions) {
  const hash = crypto.createHash('sha256');
  hash.update(computeAppResourcesStagingFingerprint(sharedRuntimeVersions));
  hash.update('\0');
  hash.update(fileContentFingerprint(path.join(desktopDir, 'out/main/index.js')));
  hash.update('\0');
  hash.update(fileContentFingerprint(path.join(root, 'web/dist/index.html')));
  return hash.digest('hex');
}

export function readPackagingFingerprint() {
  if (!fs.existsSync(PACKAGING_FINGERPRINT_PATH)) return null;
  return fs.readFileSync(PACKAGING_FINGERPRINT_PATH, 'utf8').trim();
}

/** @param {string} fingerprint */
export function writePackagingFingerprint(fingerprint) {
  fs.mkdirSync(path.dirname(PACKAGING_FINGERPRINT_PATH), { recursive: true });
  fs.writeFileSync(PACKAGING_FINGERPRINT_PATH, `${fingerprint}\n`);
}

/**
 * @param {string} fingerprint
 * @param {string} [appPath]
 */
export function isElectronPackagingFresh(fingerprint, appPath) {
  const resolved = appPath ?? resolvePackagedAppPath();
  if (readPackagingFingerprint() !== fingerprint) return false;
  if (!fs.existsSync(resolved)) return false;

  const { asarPath, stagedLogger } = packagedResourcePaths(resolved);
  return fs.existsSync(asarPath) && fs.existsSync(stagedLogger);
}
