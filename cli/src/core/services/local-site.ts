import fs from 'fs-extra';
import path from 'node:path';

import type { ReactPressConfig } from '../../types/config';
import { CONFIG_DIR, getPackageRoot, getProjectPaths, getTemplatesDir, SQLITE_REL_PATH } from '../utils/paths';
import { saveConfig, syncEnvFromConfig } from '../services/config';

export interface LocalSitePaths {
  siteRoot: string;
  dataDir: string;
  uploadsDir: string;
  dbPath: string;
  envPath: string;
  reactpressDir: string;
}

export function getLocalSitePaths(siteRoot: string): LocalSitePaths {
  const reactpressDir = path.join(siteRoot, CONFIG_DIR);
  return {
    siteRoot,
    dataDir: reactpressDir,
    uploadsDir: path.join(siteRoot, 'uploads'),
    dbPath: path.join(reactpressDir, 'reactpress.db'),
    envPath: path.join(siteRoot, '.env'),
    reactpressDir,
  };
}

export interface EnsureLocalSiteOptions {
  monorepoRoot?: string;
  adminUser?: string;
  adminPassword?: string;
}

export function ensureLocalSite(
  siteRoot: string,
  port: number,
  options: EnsureLocalSiteOptions = {},
): LocalSitePaths {
  const paths = getLocalSitePaths(siteRoot);
  fs.mkdirSync(paths.reactpressDir, { recursive: true });
  fs.mkdirSync(paths.uploadsDir, { recursive: true });

  const siteUrl = `http://127.0.0.1:${port}`;
  const clientSiteUrl = 'http://localhost:3001';
  const envLines = [
    'DB_TYPE=sqlite',
    `DB_DATABASE=${SQLITE_REL_PATH}`,
    `SERVER_PORT=${port}`,
    `SERVER_SITE_URL=${siteUrl}`,
    `CLIENT_SITE_URL=${clientSiteUrl}`,
    'SERVER_API_PREFIX=/api',
    `REACTPRESS_UPLOAD_DIR=${paths.uploadsDir}`,
    `ADMIN_USER=${options.adminUser ?? 'admin'}`,
    `ADMIN_PASSWD=${options.adminPassword ?? 'admin'}`,
    `REACTPRESS_LANG=${process.env.REACTPRESS_LANG ?? 'zh'}`,
    '',
  ];
  fs.writeFileSync(paths.envPath, envLines.join('\n'), 'utf8');

  if (options.monorepoRoot) {
    seedBundledAssets(siteRoot, options.monorepoRoot);
  }
  ensureBundledPlugins(siteRoot);

  const configPath = path.join(paths.reactpressDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    const config: ReactPressConfig = {
      version: 1,
      database: { mode: 'embedded-sqlite', sqlitePath: SQLITE_REL_PATH },
      server: {
        port,
        apiPrefix: '/api',
        siteUrl,
        clientUrl: clientSiteUrl,
        serverUrl: siteUrl,
      },
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }

  return paths;
}

function seedBundledAssets(siteRoot: string, monorepoRoot: string): void {
  seedSymlinkRegistry(
    path.join(monorepoRoot, 'plugins'),
    path.join(siteRoot, 'plugins'),
    'local',
  );
  seedSymlinkRegistry(
    path.join(monorepoRoot, 'themes'),
    path.join(siteRoot, 'themes'),
    'local',
    'npm',
  );
  seedRuntimeThemes(siteRoot, monorepoRoot);
}

function seedSymlinkRegistry(
  sourceDir: string,
  targetDir: string,
  ...registryKeys: string[]
): void {
  const sourcePackageJson = path.join(sourceDir, 'package.json');
  const targetPackageJson = path.join(targetDir, 'package.json');
  if (!fs.existsSync(sourcePackageJson)) return;

  fs.mkdirSync(targetDir, { recursive: true });
  if (!fs.existsSync(targetPackageJson)) {
    fs.copyFileSync(sourcePackageJson, targetPackageJson);
  }

  let meta: { reactpress?: Record<string, string[]> } = {};
  try {
    meta = JSON.parse(fs.readFileSync(targetPackageJson, 'utf8')) as typeof meta;
  } catch {
    return;
  }

  for (const key of registryKeys) {
    const ids = Array.isArray(meta.reactpress?.[key]) ? meta.reactpress[key] : [];
    for (const id of ids) {
      if (typeof id !== 'string' || !id.trim()) continue;
      const sourcePath = path.join(sourceDir, id.trim());
      const targetPath = path.join(targetDir, id.trim());
      if (!fs.existsSync(sourcePath) || fs.existsSync(targetPath)) continue;
      fs.symlinkSync(sourcePath, targetPath, 'dir');
    }
  }
}

function seedRuntimeThemes(siteRoot: string, monorepoRoot: string): void {
  const sourceRuntime = path.join(monorepoRoot, '.reactpress', 'runtime');
  const targetRuntime = path.join(siteRoot, '.reactpress', 'runtime');
  if (!fs.existsSync(sourceRuntime)) return;

  fs.mkdirSync(path.join(siteRoot, '.reactpress'), { recursive: true });

  for (const entry of fs.readdirSync(sourceRuntime, { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const sourcePath = path.join(sourceRuntime, entry.name);
    const targetPath = path.join(targetRuntime, entry.name);
    if (fs.existsSync(targetPath)) continue;
    try {
      if (!fs.statSync(sourcePath).isDirectory()) continue;
      fs.mkdirSync(targetRuntime, { recursive: true });
      fs.symlinkSync(sourcePath, targetPath, 'dir');
    } catch {
      // skip broken entries
    }
  }
}

const PLUGIN_COPY_SKIP_DIRS = new Set(['node_modules', '.git', '.turbo', 'src', 'coverage']);

function hasUsablePluginsRegistry(pluginsDir: string): boolean {
  const pkgPath = path.join(pluginsDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return false;

  try {
    const meta = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
      reactpress?: { local?: string[] };
    };
    const local = Array.isArray(meta.reactpress?.local) ? meta.reactpress.local : [];
    return local.some(
      (id) =>
        typeof id === 'string' &&
        id.trim() &&
        fs.existsSync(path.join(pluginsDir, id.trim(), 'plugin.json')),
    );
  } catch {
    return false;
  }
}

function copyPluginTree(sourceDir: string, targetDir: string): void {
  fs.mkdirSync(targetDir, { recursive: true });
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      if (PLUGIN_COPY_SKIP_DIRS.has(entry.name)) continue;
      copyPluginTree(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function copyBundledPlugins(sourceDir: string, targetDir: string): void {
  const sourcePackageJson = path.join(sourceDir, 'package.json');
  if (!fs.existsSync(sourcePackageJson)) return;

  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(sourcePackageJson, path.join(targetDir, 'package.json'));

  let meta: { reactpress?: { local?: string[] } } = {};
  try {
    meta = JSON.parse(fs.readFileSync(sourcePackageJson, 'utf8')) as typeof meta;
  } catch {
    return;
  }

  const local = Array.isArray(meta.reactpress?.local) ? meta.reactpress.local : [];
  for (const id of local) {
    if (typeof id !== 'string' || !id.trim()) continue;
    const sourcePath = path.join(sourceDir, id.trim());
    const targetPath = path.join(targetDir, id.trim());
    if (!fs.existsSync(path.join(sourcePath, 'plugin.json')) || fs.existsSync(targetPath)) continue;
    copyPluginTree(sourcePath, targetPath);
  }
}

/** Seed default plugins from the CLI bundle when the site has no plugins registry yet. */
export function ensureBundledPlugins(siteRoot: string): boolean {
  const targetDir = path.join(siteRoot, 'plugins');
  if (hasUsablePluginsRegistry(targetDir)) return false;

  const bundledDir = path.join(getPackageRoot(), 'plugins');
  if (fs.existsSync(path.join(bundledDir, 'package.json'))) {
    copyBundledPlugins(bundledDir, targetDir);
    return hasUsablePluginsRegistry(targetDir);
  }

  return false;
}

export async function initLocalProject(
  projectRoot: string,
  options: { force?: boolean; port?: number } = {},
): Promise<{ ok: boolean; projectRoot: string; message: string }> {
  const paths = getProjectPaths(projectRoot);
  const port = options.port ?? 3002;

  if ((await fs.pathExists(paths.configPath)) && !options.force) {
    const { t } = require('../../lib/i18n');
    return {
      ok: true,
      projectRoot,
      message: t('init.alreadyInitialized'),
    };
  }

  await fs.ensureDir(projectRoot);
  ensureLocalSite(projectRoot, port);

  const templatesDir = getTemplatesDir();
  const pkgTemplate = path.join(templatesDir, 'package.json');
  const pkgDest = path.join(projectRoot, 'package.json');
  if ((await fs.pathExists(pkgTemplate)) && (!(await fs.pathExists(pkgDest)) || options.force)) {
    await fs.copy(pkgTemplate, pkgDest, { overwrite: true });
  }

  const config = (await fs.readJson(paths.configPath)) as ReactPressConfig;
  await saveConfig(projectRoot, config);
  await syncEnvFromConfig(projectRoot, config);

  return {
    ok: true,
    projectRoot,
    message: 'ReactPress 项目初始化完成。',
  };
}
