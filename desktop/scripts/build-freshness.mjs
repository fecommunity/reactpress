/**
 * Guardrails so desktop release artifacts cannot silently lag behind source edits.
 */
import crypto from "node:crypto";
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
const FINGERPRINT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs"]);

/** @typedef {{ label: string, sourceDirs: string[], artifactPath?: string, artifactDir?: string, toleranceMs?: number }} BuildArtifactSpec */

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

/** @param {string[]} sourceDirs */
function sourceTreeFingerprint(sourceDirs) {
  const hash = crypto.createHash("sha256");
  for (const filePath of collectSourcePaths(sourceDirs)) {
    hash.update(path.relative(root, filePath));
    hash.update("\0");
    hash.update(fs.readFileSync(filePath));
    hash.update("\0");
  }
  return hash.digest("hex");
}

/** @param {BuildArtifactSpec} spec */
function fingerprintFilePath({ label, artifactPath, artifactDir }) {
  const base = artifactDir ?? path.dirname(artifactPath ?? "");
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return path.join(base, `.source-fingerprint-${slug}`);
}

/** @param {BuildArtifactSpec} spec */
function readStoredFingerprint(spec) {
  const fpPath = fingerprintFilePath(spec);
  if (!fs.existsSync(fpPath)) return null;
  return fs.readFileSync(fpPath, "utf8").trim();
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
      label: "desktop shell",
      sourceDirs: [path.join(desktopDir, "src/main"), path.join(desktopDir, "src/shared")],
      artifactPath: path.join(desktopDir, "out/main/index.js"),
    },
    {
      label: "server API",
      sourceDirs: [path.join(root, "server/src")],
      artifactDir: path.join(root, "server/dist"),
    },
  ];
}

/** @param {BuildArtifactSpec} spec */
export function isBuildArtifactStale(spec) {
  if (!artifactExists(spec)) return true;

  const stored = readStoredFingerprint(spec);
  if (stored === null) return false;

  return stored !== sourceTreeFingerprint(spec.sourceDirs);
}

/** @param {BuildArtifactSpec[]} [specs] */
export function writeWorkspaceBuildFingerprints(specs = workspaceBuildSpecs()) {
  for (const spec of specs) {
    writeBuildArtifactFingerprint(spec, sourceTreeFingerprint(spec.sourceDirs));
  }
}

/**
 * Fail when compiled output is older than its source tree (common stale-DMG cause).
 * @param {BuildArtifactSpec} options
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

  const spec = { label, sourceDirs, artifactPath, artifactDir, toleranceMs };
  const currentFingerprint = sourceTreeFingerprint(sourceDirs);
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
      "  reason        : source content changed since the last recorded build",
      `  newest source : ${new Date(sourceNewest).toISOString()}`,
      `  build output  : ${new Date(artifactMtime).toISOString()} (${target})`,
      "  Fix: save files and re-run pnpm build:desktop (do not reuse an older release/*.dmg).",
    ].join("\n"),
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
      `[desktop] ${label}: staged copy differs from workspace build (${dest}). Re-run pnpm build:desktop.`,
    );
  }
}

/** Ensure Phase 1/2 outputs reflect current desktop + server sources. */
export function assertWorkspaceBuildsFresh() {
  for (const spec of workspaceBuildSpecs()) {
    assertBuildArtifactFresh(spec);
  }
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
