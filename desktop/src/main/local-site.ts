import fs from "node:fs";
import path from "node:path";

import { DEFAULT_LOCAL_API_PORT } from "../shared/constants";

export { DEFAULT_LOCAL_API_PORT };

export interface LocalSitePaths {
  siteRoot: string;
  dataDir: string;
  uploadsDir: string;
  dbPath: string;
  envPath: string;
  reactpressDir: string;
}

const REACTPRESS_DIR = ".reactpress";
const SQLITE_REL_PATH = `${REACTPRESS_DIR}/reactpress.db`;

export function getLocalSitePaths(siteRoot: string): LocalSitePaths {
  const reactpressDir = path.join(siteRoot, REACTPRESS_DIR);
  return {
    siteRoot,
    dataDir: reactpressDir,
    uploadsDir: path.join(siteRoot, "uploads"),
    dbPath: path.join(reactpressDir, "reactpress.db"),
    envPath: path.join(siteRoot, ".env"),
    reactpressDir,
  };
}

function ensureDirSymlink(sourceDir: string, targetDir: string): void {
  if (!fs.existsSync(sourceDir)) return;

  if (fs.existsSync(targetDir)) {
    try {
      if (fs.realpathSync(targetDir) === fs.realpathSync(sourceDir)) return;
    } catch {
      // broken or stale symlink — recreate below
    }
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  fs.symlinkSync(sourceDir, targetDir, "dir");
}

function seedBundledPlugins(siteRoot: string, monorepoRoot?: string): void {
  if (!monorepoRoot) return;

  const sourcePluginsDir = path.join(monorepoRoot, "plugins");
  const targetPluginsDir = path.join(siteRoot, "plugins");
  const sourcePackageJson = path.join(sourcePluginsDir, "package.json");
  const targetPackageJson = path.join(targetPluginsDir, "package.json");

  if (!fs.existsSync(sourcePackageJson)) return;

  fs.mkdirSync(targetPluginsDir, { recursive: true });

  fs.copyFileSync(sourcePackageJson, targetPackageJson);

  let meta: { reactpress?: { local?: string[] } } = {};
  try {
    meta = JSON.parse(fs.readFileSync(targetPackageJson, "utf8")) as typeof meta;
  } catch {
    return;
  }

  const symlinkPluginDir = ensureDirSymlink;

  const localPlugins = Array.isArray(meta.reactpress?.local) ? meta.reactpress.local : [];
  for (const pluginId of localPlugins) {
    symlinkPluginDir(
      path.join(sourcePluginsDir, pluginId),
      path.join(targetPluginsDir, pluginId),
    );
  }
}

function seedBundledThemes(siteRoot: string, monorepoRoot?: string): void {
  if (!monorepoRoot) return;

  const sourceThemesDir = path.join(monorepoRoot, "themes");
  const targetThemesDir = path.join(siteRoot, "themes");
  const sourcePackageJson = path.join(sourceThemesDir, "package.json");
  const targetPackageJson = path.join(targetThemesDir, "package.json");

  if (!fs.existsSync(sourcePackageJson)) return;

  fs.mkdirSync(targetThemesDir, { recursive: true });

  if (!fs.existsSync(targetPackageJson)) {
    fs.copyFileSync(sourcePackageJson, targetPackageJson);
  }

  let meta: { reactpress?: { local?: string[]; npm?: string[] } } = {};
  try {
    meta = JSON.parse(fs.readFileSync(targetPackageJson, "utf8")) as typeof meta;
  } catch {
    return;
  }

  const symlinkThemeDir = ensureDirSymlink;

  const localThemes = Array.isArray(meta.reactpress?.local) ? meta.reactpress.local : [];
  for (const themeId of localThemes) {
    symlinkThemeDir(
      path.join(sourceThemesDir, themeId),
      path.join(targetThemesDir, themeId),
    );
  }

  const npmAnchors = Array.isArray(meta.reactpress?.npm) ? meta.reactpress.npm : [];
  for (const anchor of npmAnchors) {
    if (typeof anchor !== "string" || !anchor.trim()) continue;
    symlinkThemeDir(
      path.join(sourceThemesDir, anchor.trim()),
      path.join(targetThemesDir, anchor.trim()),
    );
  }
}

function seedRuntimeThemes(siteRoot: string, monorepoRoot?: string): void {
  if (!monorepoRoot) return;

  const sourceRuntime = path.join(monorepoRoot, ".reactpress", "runtime");
  const targetRuntime = path.join(siteRoot, ".reactpress", "runtime");
  if (!fs.existsSync(sourceRuntime)) return;

  fs.mkdirSync(path.join(siteRoot, ".reactpress"), { recursive: true });

  for (const entry of fs.readdirSync(sourceRuntime, { withFileTypes: true })) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const sourcePath = path.join(sourceRuntime, entry.name);
    const targetPath = path.join(targetRuntime, entry.name);
    try {
      if (!fs.statSync(sourcePath).isDirectory()) continue;
      fs.mkdirSync(targetRuntime, { recursive: true });
      ensureDirSymlink(sourcePath, targetPath);
    } catch {
      // skip broken entries
    }
  }

  const tsconfigSrc = path.join(sourceRuntime, "tsconfig.base.json");
  const tsconfigDst = path.join(targetRuntime, "tsconfig.base.json");
  if (fs.existsSync(tsconfigSrc) && !fs.existsSync(tsconfigDst)) {
    fs.mkdirSync(targetRuntime, { recursive: true });
    fs.copyFileSync(tsconfigSrc, tsconfigDst);
  }

  const lockSrc = path.join(monorepoRoot, ".reactpress", "themes.lock.json");
  const lockDst = path.join(siteRoot, ".reactpress", "themes.lock.json");
  if (fs.existsSync(lockSrc) && !fs.existsSync(lockDst)) {
    fs.copyFileSync(lockSrc, lockDst);
  }
}

export function ensureLocalSite(
  siteRoot: string,
  port: number,
  options?: { monorepoRoot?: string },
): LocalSitePaths {
  const paths = getLocalSitePaths(siteRoot);
  fs.mkdirSync(paths.reactpressDir, { recursive: true });
  fs.mkdirSync(paths.uploadsDir, { recursive: true });

  const siteUrl = `http://127.0.0.1:${port}`;
  const clientSiteUrl = "http://localhost:3001";
  const envLines = [
    "DB_TYPE=sqlite",
    `DB_DATABASE=${SQLITE_REL_PATH}`,
    `SERVER_PORT=${port}`,
    `SERVER_SITE_URL=${siteUrl}`,
    `CLIENT_SITE_URL=${clientSiteUrl}`,
    "SERVER_API_PREFIX=/api",
    `REACTPRESS_UPLOAD_DIR=${paths.uploadsDir}`,
    "ADMIN_USER=admin",
    "ADMIN_PASSWD=admin",
    "REACTPRESS_LANG=zh",
    "",
  ];
  fs.writeFileSync(paths.envPath, envLines.join("\n"), "utf8");

  seedBundledPlugins(siteRoot, options?.monorepoRoot);
  seedBundledThemes(siteRoot, options?.monorepoRoot);
  seedRuntimeThemes(siteRoot, options?.monorepoRoot);

  const configPath = path.join(paths.reactpressDir, "config.json");
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          database: { mode: "embedded-sqlite" },
          server: { port, apiPrefix: "/api", siteUrl },
        },
        null,
        2,
      ),
      "utf8",
    );
  }

  return paths;
}
