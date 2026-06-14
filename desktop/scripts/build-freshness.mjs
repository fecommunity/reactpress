/**
 * Guardrails so desktop release artifacts cannot silently lag behind source edits.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CACHE_PATHS } from "./cache-dir.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");
const root = path.resolve(desktopDir, "..");

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "out",
  ".cache",
  "release",
  ".git",
  "coverage",
]);

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".json"]);

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
function newestFileMtime(dir, extension = ".js") {
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

/**
 * Fail when compiled output is older than its source tree (common stale-DMG cause).
 * @param {{ label: string, sourceDirs: string[], artifactPath?: string, artifactDir?: string, toleranceMs?: number }} options
 */
export function assertBuildArtifactFresh({
  label,
  sourceDirs,
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
      `[desktop] ${label}: build output missing (${target}). The compile step did not produce artifacts.`,
    );
  }

  const sourceNewest = Math.max(0, ...sourceDirs.map((dir) => newestSourceMtime(dir)));

  if (sourceNewest > artifactMtime + toleranceMs) {
    const target = artifactDir ?? artifactPath;
    throw new Error(
      [
        `[desktop] ${label}: source is newer than build output — refusing to package stale artifacts.`,
        `  newest source : ${new Date(sourceNewest).toISOString()}`,
        `  build output  : ${new Date(artifactMtime).toISOString()} (${target})`,
        "  Fix: save files and re-run pnpm build:desktop (do not reuse an older release/*.dmg).",
      ].join("\n"),
    );
  }
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
      `[desktop] ${label}: staged copy differs from workspace build (${dest}). Re-run pnpm build:desktop.`,
    );
  }
}

/** Ensure Phase 1/2 outputs reflect current desktop + server sources. */
export function assertWorkspaceBuildsFresh() {
  assertBuildArtifactFresh({
    label: "desktop shell",
    sourceDirs: [path.join(desktopDir, "src/main"), path.join(desktopDir, "src/shared")],
    artifactPath: path.join(desktopDir, "out/main/index.js"),
  });
  assertBuildArtifactFresh({
    label: "server API",
    sourceDirs: [path.join(root, "server/src")],
    artifactDir: path.join(root, "server/dist"),
  });
}

/** Ensure staged Resources mirror freshly built workspace artifacts. */
export function verifyStagedAppResources(appResourcesDir = CACHE_PATHS.appResources) {
  assertSameFile(
    path.join(root, "server/dist/logger/index.js"),
    path.join(appResourcesDir, "server/dist/logger/index.js"),
    "staged server logger",
  );
  assertSameFile(
    path.join(root, "server/dist/main.js"),
    path.join(appResourcesDir, "server/dist/main.js"),
    "staged server main",
  );
}

/** @param {string} appResourcesDir */
export function writeBuildManifest(appResourcesDir) {
  const manifest = {
    builtAt: new Date().toISOString(),
    desktop: {
      main: fs.statSync(path.join(desktopDir, "out/main/index.js")).mtime.toISOString(),
    },
    server: {
      main: fs.statSync(path.join(root, "server/dist/main.js")).mtime.toISOString(),
      logger: fs.statSync(path.join(root, "server/dist/logger/index.js")).mtime.toISOString(),
    },
  };
  fs.writeFileSync(
    path.join(appResourcesDir, "build-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

/** Remove previous installer outputs so a failed rebuild cannot be mistaken for success. */
export function pruneStaleReleaseArtifacts(releaseDir = path.join(desktopDir, "release")) {
  if (!fs.existsSync(releaseDir)) return;

  for (const name of fs.readdirSync(releaseDir)) {
    if (/^ReactPress-.*\.(dmg|zip|blockmap)$/i.test(name)) {
      fs.rmSync(path.join(releaseDir, name), { force: true });
    }
  }
}

/**
 * @param {string} [appPath]
 * @returns {{ appPath: string, manifest: Record<string, unknown> | null }}
 */
export function verifyPackagedApp(appPath) {
  const resolved =
    appPath ??
    path.join(desktopDir, "release/mac/ReactPress.app");

  if (!fs.existsSync(resolved)) {
    throw new Error(
      `[desktop] Packaged app missing (${resolved}). electron-builder did not emit ReactPress.app.`,
    );
  }

  const asarPath = path.join(resolved, "Contents/Resources/app.asar");
  const stagedLogger = path.join(
    resolved,
    "Contents/Resources/server/dist/logger/index.js",
  );
  const manifestPath = path.join(resolved, "Contents/Resources/build-manifest.json");

  if (!fs.existsSync(asarPath)) {
    throw new Error(`[desktop] Packaged app.asar missing (${asarPath})`);
  }
  if (!fs.existsSync(stagedLogger)) {
    throw new Error(`[desktop] Packaged server logger missing (${stagedLogger})`);
  }

  assertSameFile(
    path.join(root, "server/dist/logger/index.js"),
    stagedLogger,
    "packaged server logger",
  );

  const asarMtime = fs.statSync(asarPath).mtimeMs;
  const outMtime = fs.statSync(path.join(desktopDir, "out/main/index.js")).mtimeMs;
  if (asarMtime + 1500 < outMtime) {
    throw new Error(
      [
        "[desktop] Packaged app.asar is older than desktop/out — installer may be stale.",
        `  app.asar : ${new Date(asarMtime).toISOString()}`,
        `  out/main : ${new Date(outMtime).toISOString()}`,
      ].join("\n"),
    );
  }

  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }

  return { appPath: resolved, manifest };
}
