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

export function getLocalSitePaths(siteRoot: string): LocalSitePaths {
  const dataDir = path.join(siteRoot, "data");
  return {
    siteRoot,
    dataDir,
    uploadsDir: path.join(siteRoot, "uploads"),
    dbPath: path.join(dataDir, "reactpress.db"),
    envPath: path.join(siteRoot, ".env"),
    reactpressDir: path.join(siteRoot, ".reactpress"),
  };
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

  let meta: { reactpress?: { local?: string[] } } = {};
  try {
    meta = JSON.parse(fs.readFileSync(targetPackageJson, "utf8")) as typeof meta;
  } catch {
    return;
  }

  const localThemes = Array.isArray(meta.reactpress?.local) ? meta.reactpress.local : [];
  for (const themeId of localThemes) {
    const sourceThemeDir = path.join(sourceThemesDir, themeId);
    const targetThemeDir = path.join(targetThemesDir, themeId);
    if (!fs.existsSync(sourceThemeDir) || fs.existsSync(targetThemeDir)) continue;
    fs.symlinkSync(sourceThemeDir, targetThemeDir, "dir");
  }
}

export function ensureLocalSite(
  siteRoot: string,
  port: number,
  options?: { monorepoRoot?: string },
): LocalSitePaths {
  const paths = getLocalSitePaths(siteRoot);
  fs.mkdirSync(paths.dataDir, { recursive: true });
  fs.mkdirSync(paths.uploadsDir, { recursive: true });
  fs.mkdirSync(paths.reactpressDir, { recursive: true });

  const siteUrl = `http://127.0.0.1:${port}`;
  const envLines = [
    "DB_TYPE=sqlite",
    `DB_DATABASE=${paths.dbPath}`,
    `SERVER_PORT=${port}`,
    `SERVER_SITE_URL=${siteUrl}`,
    "SERVER_API_PREFIX=/api",
    `REACTPRESS_UPLOAD_DIR=${paths.uploadsDir}`,
    "ADMIN_USER=admin",
    "ADMIN_PASSWD=admin",
    "REACTPRESS_LANG=zh",
    "",
  ];
  fs.writeFileSync(paths.envPath, envLines.join("\n"), "utf8");

  seedBundledThemes(siteRoot, options?.monorepoRoot);

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
