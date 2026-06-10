const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { upsertNpmThemeLock } = require('./theme-lock');
const { buildThemeEnvOverrides, syncThemeEnvFromProject } = require('./theme-env');
const { ensurePreviewFrameAllowed } = require('./theme-preview-frame');
const { resolveCatalogInstallSpec } = require('./theme-registry');

const THEME_ID_RE = /^[a-z0-9][a-z0-9-]*$/i;
const THEME_RUNTIME_REL = path.join('.reactpress', 'runtime');
const COPY_SKIP_NAMES = new Set([
  'node_modules',
  '.next',
  '.git',
  'dist',
  '.turbo',
  'coverage',
  '.reactpress',
  '.cache',
  'package-lock.json',
]);

function isValidThemeId(id) {
  return typeof id === 'string' && THEME_ID_RE.test(id) && id.length <= 64;
}

function parseNpmSpec(spec) {
  const trimmed = String(spec || '').trim();
  if (!trimmed) {
    return { error: 'EMPTY_SPEC' };
  }
  if (trimmed.endsWith('.tgz') || trimmed.endsWith('.tar.gz')) {
    const resolved = path.resolve(trimmed);
    if (!fs.existsSync(resolved)) {
      return { error: 'TARBALL_NOT_FOUND', path: resolved };
    }
    return { kind: 'tarball', path: resolved };
  }
  if (/^file:/i.test(trimmed)) {
    const filePath = trimmed.replace(/^file:/i, '');
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      return { error: 'TARBALL_NOT_FOUND', path: resolved };
    }
    return { kind: 'tarball', path: resolved };
  }
  return { kind: 'npm', spec: trimmed };
}

function readThemeManifestFromDir(dir) {
  const manifestPath = path.join(dir, 'theme.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (raw && typeof raw.id === 'string' && typeof raw.name === 'string') {
      return raw;
    }
  } catch {
    // ignore
  }
  return null;
}

function inferThemeIdFromPackageName(name) {
  if (typeof name !== 'string' || !name) return null;
  const base = name.includes('/') ? name.split('/').pop() : name;
  const match = base.match(/(?:reactpress-)?(?:template-)?(.+)$/i);
  if (!match) return null;
  const id = match[1].replace(/^template-/, '');
  return isValidThemeId(id) ? id : null;
}

function resolveThemeIdentity(packageDir) {
  const manifest = readThemeManifestFromDir(packageDir);
  if (manifest?.id && isValidThemeId(manifest.id)) {
    return {
      themeId: manifest.id,
      manifest,
    };
  }

  const pkgPath = path.join(packageDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const fromReactpress = pkg.reactpress?.themeId || pkg.reactpress?.id;
      if (typeof fromReactpress === 'string' && isValidThemeId(fromReactpress)) {
        return {
          themeId: fromReactpress,
          manifest: manifest || {
            id: fromReactpress,
            name: typeof pkg.description === 'string' ? pkg.description : fromReactpress,
            version: typeof pkg.version === 'string' ? pkg.version : '1.0.0',
          },
        };
      }
      const inferred = inferThemeIdFromPackageName(pkg.name);
      if (inferred) {
        return {
          themeId: inferred,
          manifest: manifest || {
            id: inferred,
            name: typeof pkg.description === 'string' ? pkg.description : inferred,
            version: typeof pkg.version === 'string' ? pkg.version : '1.0.0',
          },
          packageName: pkg.name,
          packageVersion: pkg.version,
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

function isThemePackageDir(dir) {
  return (
    fs.existsSync(path.join(dir, 'theme.json')) ||
    fs.existsSync(path.join(dir, 'package.json'))
  );
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (COPY_SKIP_NAMES.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isSymbolicLink()) {
      const link = fs.readlinkSync(from);
      fs.symlinkSync(link, to);
    } else if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

function removeDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      fs.unlinkSync(target);
    } else if (entry.isDirectory()) {
      removeDir(target);
    } else {
      fs.unlinkSync(target);
    }
  }
  fs.rmdirSync(dir);
}

function extractTarball(tarballPath, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const result = spawnSync('tar', ['-xzf', tarballPath, '-C', destDir], {
    stdio: 'pipe',
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || result.stdout?.trim() || 'Failed to extract theme tarball');
  }
  const packageDir = path.join(destDir, 'package');
  if (fs.existsSync(packageDir) && fs.statSync(packageDir).isDirectory()) {
    return packageDir;
  }
  const entries = fs.readdirSync(destDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  if (entries.length === 1) {
    return path.join(destDir, entries[0].name);
  }
  if (isThemePackageDir(destDir)) {
    return destDir;
  }
  throw new Error('Theme package root not found after extracting tarball');
}

function npmPack(spec, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  const result = spawnSync('npm', ['pack', spec, '--pack-destination', destDir], {
    stdio: 'pipe',
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    const message = [result.stderr, result.stdout].filter(Boolean).join('\n').trim();
    throw new Error(message || `npm pack failed for "${spec}"`);
  }
  const files = fs
    .readdirSync(destDir)
    .filter((name) => name.endsWith('.tgz') || name.endsWith('.tar.gz'))
    .map((name) => path.join(destDir, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!files.length) {
    throw new Error(`npm pack produced no tarball for "${spec}"`);
  }
  return files[0];
}

function ensureRuntimeThemeTsconfigBase(projectRoot, runtimeDir) {
  const baseSrc = path.join(path.resolve(projectRoot), 'tsconfig.base.json');
  if (!fs.existsSync(baseSrc)) return;
  const runtimeBase = path.join(runtimeDir, 'tsconfig.base.json');
  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.copyFileSync(baseSrc, runtimeBase);
}

function readThemePackageManager(themeDir) {
  const pkgPath = path.join(themeDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return typeof pkg.packageManager === 'string' ? pkg.packageManager : null;
  } catch {
    return null;
  }
}

function themePrefersPnpm(themeDir) {
  if (fs.existsSync(path.join(themeDir, 'pnpm-lock.yaml'))) return true;
  const pm = readThemePackageManager(themeDir);
  return typeof pm === 'string' && pm.startsWith('pnpm@');
}

function installThemeDependencies(themeDir, projectRoot) {
  const envOverrides = buildThemeEnvOverrides(projectRoot);
  const installEnv = {
    ...process.env,
    ...envOverrides,
    npm_config_ignore_scripts: 'false',
  };

  const usePnpm = themePrefersPnpm(themeDir);
  let result;

  if (usePnpm) {
    result = spawnSync('pnpm', ['install', '--ignore-workspace'], {
      cwd: themeDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: installEnv,
    });
  } else {
    result = spawnSync('npm', ['install', '--legacy-peer-deps'], {
      cwd: themeDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: installEnv,
    });
  }

  if (result.status !== 0 && usePnpm) {
    result = spawnSync('npm', ['install', '--legacy-peer-deps'], {
      cwd: themeDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: installEnv,
    });
  }

  if (result.status !== 0 && !usePnpm) {
    result = spawnSync('npm', ['install', '--ignore-scripts', '--legacy-peer-deps'], {
      cwd: themeDir,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: installEnv,
    });
  }

  if (result.status !== 0) {
    throw new Error(`${usePnpm ? 'pnpm' : 'npm'} install failed in theme directory`);
  }

  syncThemeEnvFromProject(projectRoot, themeDir);
}

function readPackageMeta(packageDir) {
  const pkgPath = path.join(packageDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return { name: undefined, version: undefined };
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return {
      name: typeof pkg.name === 'string' ? pkg.name : undefined,
      version: typeof pkg.version === 'string' ? pkg.version : undefined,
    };
  } catch {
    return { name: undefined, version: undefined };
  }
}

/**
 * Install a theme from an npm spec or local .tgz into `.reactpress/runtime/{id}/`.
 * @param {string} projectRoot
 * @param {string} spec npm package spec or path to .tgz
 * @param {{ skipDependencies?: boolean }} [options]
 */
async function installThemeFromNpm(projectRoot, spec, options = {}) {
  const root = path.resolve(projectRoot);
  const resolvedSpec = resolveCatalogInstallSpec(root, spec) || spec;
  const parsed = parseNpmSpec(resolvedSpec);
  if (parsed.error === 'EMPTY_SPEC') {
    throw new Error('Theme npm spec is required');
  }
  if (parsed.error === 'TARBALL_NOT_FOUND') {
    throw new Error(`Theme tarball not found: ${parsed.path}`);
  }

  const tmpRoot = path.join(root, '.reactpress', 'tmp', `theme-npm-${crypto.randomBytes(4).toString('hex')}`);
  fs.mkdirSync(tmpRoot, { recursive: true });

  try {
    const tarballPath =
      parsed.kind === 'tarball' ? parsed.path : npmPack(parsed.spec, tmpRoot);
    const extractDir = path.join(tmpRoot, 'extract');
    const packageDir = extractTarball(tarballPath, extractDir);

    if (!isThemePackageDir(packageDir)) {
      throw new Error('Package is not a ReactPress theme (missing theme.json or package.json)');
    }

    const identity = resolveThemeIdentity(packageDir);
    if (!identity?.themeId) {
      throw new Error('Could not resolve theme id from theme.json or package.json');
    }

    const { themeId, manifest } = identity;
    const runtimeRoot = path.join(root, THEME_RUNTIME_REL);
    const targetDir = path.join(runtimeRoot, themeId);
    const pkgMeta = readPackageMeta(packageDir);

    if (fs.existsSync(targetDir)) {
      removeDir(targetDir);
    }
    fs.mkdirSync(runtimeRoot, { recursive: true });
    copyDir(packageDir, targetDir);
    ensureRuntimeThemeTsconfigBase(root, runtimeRoot);

    if (!options.skipDependencies) {
      installThemeDependencies(targetDir, root);
    } else {
      syncThemeEnvFromProject(root, targetDir);
    }
    ensurePreviewFrameAllowed(targetDir);

    const npmSpec = parsed.kind === 'npm' ? parsed.spec : resolvedSpec;
    upsertNpmThemeLock(root, themeId, {
      spec: npmSpec,
      resolvedVersion: pkgMeta.version || manifest.version || '0.0.0',
      packageName: pkgMeta.name,
    });

    return {
      themeId,
      name: manifest.name,
      version: manifest.version || pkgMeta.version || '0.0.0',
      packageName: pkgMeta.name,
      npmSpec,
      themeDir: targetDir,
      themeDirRel: path.relative(root, targetDir),
    };
  } finally {
    removeDir(tmpRoot);
  }
}

module.exports = {
  THEME_RUNTIME_REL,
  parseNpmSpec,
  resolveThemeIdentity,
  installThemeFromNpm,
  installThemeDependencies,
  isValidThemeId,
};
