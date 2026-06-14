/**
 * Stage bundled server/toolkit/cli/themes into desktop/.cache/app-resources for electron-builder.
 * Assumes toolkit, cli, and server are already built (see build-desktop.mjs).
 *
 * Runtime deps: one hoisted server deploy — themes resolve via NODE_PATH (no per-theme deploy).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyStagedAppResources, writeBuildManifest } from "./build-freshness.mjs";
import { formatBytes, pruneBundleNodeModules } from "./prune-bundle.mjs";
import { CACHE_PATHS } from "./cache-dir.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");
const root = path.resolve(desktopDir, "..");
const outDir = CACHE_PATHS.appResources;

/** Theme paths never needed inside the desktop installer. */
const THEME_SKIP_DIRS = new Set(["node_modules", ".git", ".turbo"]);
const THEME_SKIP_UNDER_NEXT = new Set(["cache"]);

/** Packages themes expect via shared server NODE_PATH. */
const SHARED_RUNTIME_PACKAGES = ["next", "react", "react-dom"];

/** Hoisted deploy avoids duplicate .pnpm virtual store copies in the installer. */
const PNPM_DEPLOY_FLAGS = ["--config.node-linker=hoisted"];

function runAsync(label, cmd, args, cwd = root, options = {}) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const child = spawn(cmd, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: options.env ? { ...process.env, ...options.env } : process.env,
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
      if (entry.name === ".next" || entry.name === ".next-preview") {
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

/** Canonical Next/React versions for all packaged themes (from theme-starter when present). */
function resolveSharedRuntimeVersions() {
  const runtimeSrc = path.join(root, ".reactpress", "runtime", "reactpress-theme-starter");
  const runtimePkgPath = path.join(runtimeSrc, "package.json");
  if (fs.existsSync(runtimePkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(runtimePkgPath, "utf8"));
    return {
      next: pkg.dependencies?.next,
      react: pkg.dependencies?.react,
      "react-dom": pkg.dependencies?.["react-dom"],
    };
  }

  return {
    next: "15.5.12",
    react: "19.2.4",
    "react-dom": "19.2.4",
  };
}

function assertSharedRuntimeDeps(bundleDir) {
  const nodeModules = path.join(bundleDir, "node_modules");
  const missing = SHARED_RUNTIME_PACKAGES.filter(
    (pkg) => !fs.existsSync(path.join(nodeModules, pkg)),
  );
  if (missing.length === 0) return;

  throw new Error(
    `Shared runtime bundle missing packages: ${missing.join(", ")}. ` +
      "Adjust SHARED_RUNTIME_PACKAGES or resolveSharedRuntimeVersions().",
  );
}

function assertSharedNextVersion(bundleDir) {
  const nextPkg = path.join(bundleDir, "node_modules", "next", "package.json");
  if (!fs.existsSync(nextPkg)) {
    throw new Error("Shared runtime deps missing next — themes cannot start");
  }

  const nextVersion = JSON.parse(fs.readFileSync(nextPkg, "utf8")).version || "unknown";
  if (!String(nextVersion).startsWith("15.")) {
    throw new Error(
      `Shared runtime resolved next@${nextVersion}, expected Next 15.x for packaged themes`,
    );
  }
}

async function stageSharedRuntimeDeps(outDir) {
  const sharedBundle = CACHE_PATHS.sharedRuntime;
  rmrf(sharedBundle);
  fs.mkdirSync(sharedBundle, { recursive: true });

  const versions = resolveSharedRuntimeVersions();
  const minimalPkg = {
    name: "reactpress-shared-theme-runtime",
    private: true,
    dependencies: versions,
  };
  fs.writeFileSync(
    path.join(sharedBundle, "package.json"),
    `${JSON.stringify(minimalPkg, null, 2)}\n`,
  );

  console.log(
    `[desktop] Installing shared theme runtime (Next ${versions.next}, hoisted, single copy)…`,
  );
  await runAsync(
    "install shared runtime",
    "pnpm",
    ["install", "--prod", "--ignore-workspace", ...PNPM_DEPLOY_FLAGS, "--no-frozen-lockfile"],
    sharedBundle,
  );

  const pruneStats = pruneBundleNodeModules(sharedBundle);
  if (pruneStats.removed > 0) {
    console.log(
      `[desktop] Pruned ${pruneStats.removed} dev packages from shared runtime (~${formatBytes(pruneStats.savedBytes)} saved)`,
    );
  }

  assertSharedRuntimeDeps(sharedBundle);
  assertSharedNextVersion(sharedBundle);

  const runtimeOut = path.join(outDir, "runtime-deps", "node_modules");
  copyInto(path.join(sharedBundle, "node_modules"), runtimeOut);
  rmrf(sharedBundle);
}

async function stageThemeStarterRuntime(outDir) {
  const runtimeSrc = path.join(root, ".reactpress", "runtime", "reactpress-theme-starter");
  if (!fs.existsSync(runtimeSrc)) {
    console.warn(
      "[desktop] Skip theme-starter runtime — missing .reactpress/runtime/reactpress-theme-starter (run: pnpm --dir themes theme add reactpress-theme-starter)",
    );
    return;
  }

  const visitorBuildId = path.join(runtimeSrc, ".next", "BUILD_ID");
  if (!fs.existsSync(visitorBuildId)) {
    console.log("[desktop] Building reactpress-theme-starter .next for packaged visitor preview…");
    await runAsync("build theme-starter visitor", "pnpm", ["run", "build"], runtimeSrc);
  }

  const previewBuildId = path.join(runtimeSrc, ".next-preview", "BUILD_ID");
  if (!fs.existsSync(previewBuildId)) {
    console.log("[desktop] Building reactpress-theme-starter .next-preview for admin theme preview…");
    await runAsync(
      "build theme-starter preview",
      "pnpm",
      ["run", "build"],
      runtimeSrc,
      {
        env: {
          NEXT_DIST_DIR: ".next-preview",
          REACTPRESS_HONOR_PREVIEW: "1",
        },
      },
    );
  }

  const runtimeOut = path.join(outDir, ".reactpress", "runtime", "reactpress-theme-starter");
  copyThemeTree(runtimeSrc, runtimeOut);

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

async function stageCliRuntimeDeps(outDir) {
  const cliBundle = CACHE_PATHS.cliBundle;
  rmrf(cliBundle);

  console.log("[desktop] Deploying CLI runtime for theme preview (hoisted)…");
  await runAsync("deploy cli runtime", "pnpm", [
    "--filter",
    "@fecommunity/reactpress",
    "deploy",
    ...PNPM_DEPLOY_FLAGS,
    cliBundle,
  ]);

  const pruneStats = pruneBundleNodeModules(cliBundle);
  if (pruneStats.removed > 0) {
    console.log(
      `[desktop] Pruned ${pruneStats.removed} dev packages from CLI runtime (~${formatBytes(pruneStats.savedBytes)} saved)`,
    );
  }

  const nodeModules = path.join(cliBundle, "node_modules");
  if (!fs.existsSync(path.join(nodeModules, "chalk"))) {
    throw new Error("CLI deploy missing chalk — theme preview cannot load cli/out/lib");
  }

  copyInto(nodeModules, path.join(outDir, "cli", "node_modules"));
  rmrf(cliBundle);
}

export async function stageAppResources() {
  const serverBundle = CACHE_PATHS.serverBundle;
  const toolkitDist = path.join(root, "toolkit/dist");

  rmrf(outDir);
  rmrf(serverBundle);

  console.log("[desktop] Deploying server production bundle (hoisted, shared runtime)…");
  await runAsync("deploy server", "pnpm", [
    "--filter",
    "@fecommunity/reactpress-server",
    "deploy",
    ...PNPM_DEPLOY_FLAGS,
    serverBundle,
  ]);

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

  console.log("[desktop] Assembling app resources (themes share runtime-deps NODE_PATH)…");
  fs.mkdirSync(outDir, { recursive: true });
  copyInto(serverBundle, path.join(outDir, "server"));
  copyInto(toolkitDist, path.join(outDir, "toolkit", "dist"));
  copyInto(path.join(root, "cli/out/lib"), path.join(outDir, "cli/out/lib"));
  await stageCliRuntimeDeps(outDir);

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

  await stageSharedRuntimeDeps(outDir);
  await stageThemeStarterRuntime(outDir);

  const stagedMb = (dirSize(outDir) / (1024 * 1024)).toFixed(1);
  verifyStagedAppResources(outDir);
  const manifest = writeBuildManifest(outDir);
  console.log(`[desktop] App resources ready: ${outDir} (~${stagedMb} MB, builtAt=${manifest.builtAt})`);
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
