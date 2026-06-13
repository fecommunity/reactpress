/**
 * Stage bundled server/toolkit/cli/themes into desktop/.cache/app-resources for electron-builder.
 * Assumes toolkit, cli, and server are already built (see build-desktop.mjs).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { formatBytes, pruneBundleNodeModules } from "./prune-bundle.mjs";
import { CACHE_PATHS } from "./cache-dir.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");
const root = path.resolve(desktopDir, "..");
const outDir = CACHE_PATHS.appResources;

/** Theme paths never needed inside the desktop installer. */
const THEME_SKIP_DIRS = new Set(["node_modules", ".git", ".turbo"]);
const THEME_SKIP_UNDER_NEXT = new Set(["cache"]);

function runAsync(label, cmd, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const child = spawn(cmd, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${label} failed (exit ${code ?? "unknown"})`));
        return;
      }
      console.log(`[desktop] ✓ ${label} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
      resolve(undefined);
    });
  });
}

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function copyInto(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function copyThemeTree(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      if (THEME_SKIP_DIRS.has(entry.name)) continue;
      if (entry.name === ".next") {
        copyNextProduction(src, dest);
        continue;
      }
      copyThemeTree(src, dest);
      continue;
    }

    copyInto(src, dest);
  }
}

/** Keep .next/server + static for optional preview; drop webpack/turbopack cache. */
function copyNextProduction(srcNext, destNext) {
  fs.mkdirSync(destNext, { recursive: true });
  for (const entry of fs.readdirSync(srcNext, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      copyInto(path.join(srcNext, entry.name), path.join(destNext, entry.name));
      continue;
    }
    if (THEME_SKIP_UNDER_NEXT.has(entry.name)) continue;
    copyThemeTree(path.join(srcNext, entry.name), path.join(destNext, entry.name));
  }
}

async function stageHelloWorldRuntimeDeps() {
  const themeBundle = CACHE_PATHS.themeBundle;
  rmrf(themeBundle);

  console.log("[desktop] Deploying hello-world theme runtime dependencies…");
  await runAsync(
    "deploy hello-world deps",
    "pnpm",
    ["--filter", "@fecommunity/reactpress-template-hello-world", "deploy", themeBundle],
  );

  const pruneStats = pruneBundleNodeModules(themeBundle);
  if (pruneStats.removed > 0) {
    console.log(
      `[desktop] Pruned ${pruneStats.removed} dev packages from theme deps (~${formatBytes(pruneStats.savedBytes)} saved)`,
    );
  }

  return themeBundle;
}

async function stageThemeStarterRuntime(outDir) {
  const runtimeSrc = path.join(root, ".reactpress", "runtime", "reactpress-theme-starter");
  if (!fs.existsSync(runtimeSrc)) {
    console.warn(
      "[desktop] Skip theme-starter runtime — missing .reactpress/runtime/reactpress-theme-starter (run: pnpm --dir themes theme add reactpress-theme-starter)",
    );
    return;
  }

  const buildId = path.join(runtimeSrc, ".next", "BUILD_ID");
  if (!fs.existsSync(buildId)) {
    console.log("[desktop] Building reactpress-theme-starter for packaged visitor/preview…");
    await runAsync("build theme-starter runtime", "pnpm", ["run", "build"], runtimeSrc);
  }

  const runtimeOut = path.join(outDir, ".reactpress", "runtime", "reactpress-theme-starter");
  copyThemeTree(runtimeSrc, runtimeOut);

  const srcNodeModules = path.join(runtimeSrc, "node_modules");
  if (fs.existsSync(srcNodeModules)) {
    copyInto(srcNodeModules, path.join(runtimeOut, "node_modules"));
    const pruneStats = pruneBundleNodeModules(runtimeOut);
    if (pruneStats.removed > 0) {
      console.log(
        `[desktop] Pruned ${pruneStats.removed} dev packages from theme-starter runtime (~${formatBytes(pruneStats.savedBytes)} saved)`,
      );
    }
  } else {
    console.warn("[desktop] theme-starter runtime has no node_modules — run theme install in dev first");
  }

  const runtimeMetaSrc = path.join(root, ".reactpress", "runtime", "tsconfig.base.json");
  const runtimeMetaDst = path.join(outDir, ".reactpress", "runtime", "tsconfig.base.json");
  if (fs.existsSync(runtimeMetaSrc)) {
    copyInto(runtimeMetaSrc, runtimeMetaDst);
  }

  const lockSrc = path.join(root, ".reactpress", "themes.lock.json");
  const lockDst = path.join(outDir, ".reactpress", "themes.lock.json");
  if (fs.existsSync(lockSrc)) {
    copyInto(lockSrc, lockDst);
  }
}

export async function stageAppResources() {
  const serverBundle = CACHE_PATHS.serverBundle;
  const toolkitDist = path.join(root, "toolkit/dist");

  rmrf(outDir);
  rmrf(serverBundle);

  console.log("[desktop] Deploying server production bundle…");
  await runAsync(
    "deploy server",
    "pnpm",
    ["--filter", "@fecommunity/reactpress-server", "deploy", serverBundle],
  );

  const pruneStats = pruneBundleNodeModules(serverBundle);
  if (pruneStats.removed > 0) {
    console.log(
      `[desktop] Pruned ${pruneStats.removed} dev packages from server (~${formatBytes(pruneStats.savedBytes)} saved)`,
    );
  }

  if (!fs.existsSync(toolkitDist)) {
    throw new Error("toolkit/dist missing — run pnpm run build:toolkit first");
  }

  const helloWorldDir = path.join(root, "themes", "hello-world");
  const helloWorldBuildId = path.join(helloWorldDir, ".next", "BUILD_ID");
  if (fs.existsSync(helloWorldDir) && !fs.existsSync(helloWorldBuildId)) {
    console.log("[desktop] Building hello-world theme for visitor preview…");
    await runAsync("build hello-world theme", "pnpm", ["run", "build"], helloWorldDir);
  }

  console.log("[desktop] Assembling app resources…");
  fs.mkdirSync(outDir, { recursive: true });
  copyInto(serverBundle, path.join(outDir, "server"));
  copyInto(toolkitDist, path.join(outDir, "toolkit", "dist"));
  copyInto(path.join(root, "cli/out/lib"), path.join(outDir, "cli/out/lib"));

  const themesOut = path.join(outDir, "themes");
  fs.mkdirSync(themesOut, { recursive: true });
  for (const name of ["package.json", "hello-world", "theme-starter"]) {
    const src = path.join(root, "themes", name);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(themesOut, name);
    if (fs.statSync(src).isDirectory()) {
      copyThemeTree(src, dest);
    } else {
      copyInto(src, dest);
    }
  }

  const themeBundle = await stageHelloWorldRuntimeDeps();
  const helloOut = path.join(themesOut, "hello-world");
  const themeNodeModules = path.join(themeBundle, "node_modules");
  if (fs.existsSync(helloOut) && fs.existsSync(themeNodeModules)) {
    copyInto(themeNodeModules, path.join(helloOut, "node_modules"));
  }

  rmrf(themeBundle);

  await stageThemeStarterRuntime(outDir);

  const stagedMb = (dirSize(outDir) / (1024 * 1024)).toFixed(1);
  console.log(`[desktop] App resources ready: ${outDir} (~${stagedMb} MB)`);
}

function dirSize(dir) {
  let total = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) {
        try {
          total += fs.statSync(full).size;
        } catch {
          // ignore
        }
      }
    }
  }
  return total;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  stageAppResources().catch((err) => {
    console.error("[desktop]", err.message || err);
    process.exit(1);
  });
}
