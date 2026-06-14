import fs from "node:fs";
import Module from "node:module";
import path from "node:path";

type NodeModuleRuntime = typeof Module & {
  _nodeModulePaths: (from: string) => string[];
};

const NodeModule = Module as NodeModuleRuntime;

let modulePathsReady = false;
let originalNodeModulePaths: ((from: string) => string[]) | null = null;

/** True only inside a packaged Electron app (not dev Electron or plain Node). */
export function isPackagedRuntime(): boolean {
  try {
    const { app: electronApp } = require("electron") as typeof import("electron");
    return Boolean(electronApp?.isPackaged) && process.env.ELECTRON_IS_DEV !== "1";
  } catch {
    return false;
  }
}

export function bundledResourcesRoot(): string {
  return process.resourcesPath;
}

/** node_modules dirs staged under Resources (server + shared theme runtime). */
export function listPackagedNodeModuleDirs(): string[] {
  if (!isPackagedRuntime()) return [];
  return [
    path.join(bundledResourcesRoot(), "runtime-deps", "node_modules"),
    path.join(bundledResourcesRoot(), "server", "node_modules"),
    path.join(bundledResourcesRoot(), "cli", "node_modules"),
  ].filter((dir) => fs.existsSync(dir));
}

/**
 * Inject Resources node_modules into Node's module search paths so main-process
 * require() can resolve CLI runtime deps (chalk, ora, …) when loading cli/out/lib.
 */
export function ensurePackagedModuleResolution(): void {
  if (!isPackagedRuntime() || modulePathsReady) return;

  const extraDirs = listPackagedNodeModuleDirs();
  if (extraDirs.length === 0) return;

  if (!originalNodeModulePaths) {
    originalNodeModulePaths = NodeModule._nodeModulePaths;
    NodeModule._nodeModulePaths = (from: string) => {
      const paths = originalNodeModulePaths!(from);
      for (const dir of extraDirs) {
        if (!paths.includes(dir)) paths.unshift(dir);
      }
      return paths;
    };
  }

  modulePathsReady = true;
}

export function configurePackagedRuntimeEnv(): void {
  if (!isPackagedRuntime()) return;

  process.env.REACTPRESS_SKIP_THEME_INSTALL = "1";
  process.env.REACTPRESS_MONOREPO_ROOT = bundledResourcesRoot();
  const nodePath = resolvePackagedNodePath();
  if (nodePath) {
    process.env.NODE_PATH = nodePath;
  }
}

export function resolvePackagedNodePath(): string {
  return listPackagedNodeModuleDirs().join(path.delimiter);
}
