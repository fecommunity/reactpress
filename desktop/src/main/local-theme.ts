import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { DEFAULT_LOCAL_API_PORT } from "../shared/constants";
import { getLocalApiBaseUrl } from "./local-server";

const VISITOR_PORT = 3001;
const PREVIEW_PORT = 3003;

let activeThemeProcess: ChildProcess | null = null;
let previewThemeProcess: ChildProcess | null = null;
let watchCleanup: (() => void) | null = null;
let runningActiveSignature = "";
let runningPreviewSignature = "";

function isPackagedRuntime(): boolean {
  try {
    const { app: electronApp } = require("electron") as typeof import("electron");
    return Boolean(electronApp?.isPackaged) && process.env.ELECTRON_IS_DEV !== "1";
  } catch {
    return false;
  }
}

function isElectronHost(): boolean {
  return Boolean(process.versions.electron);
}

function bundledResourcesRoot(): string {
  return process.resourcesPath;
}

function resolveDevMonorepoRoot(): string {
  return path.resolve(__dirname, "../../..");
}

function resolveMonorepoRoot(options?: { monorepoRoot?: string }): string {
  if (options?.monorepoRoot) return options.monorepoRoot;
  if (isPackagedRuntime()) return bundledResourcesRoot();
  return resolveDevMonorepoRoot();
}

function resolveServerNodeModules(monorepoRoot: string): string {
  if (isPackagedRuntime()) {
    return path.join(bundledResourcesRoot(), "server", "node_modules");
  }
  return path.join(monorepoRoot, "server", "node_modules");
}

function resolveCliLib(monorepoRoot: string, fileName: string): string {
  const packaged = path.join(monorepoRoot, "cli", "out", "lib", fileName);
  if (fs.existsSync(packaged)) return packaged;
  const dev = path.join(resolveDevMonorepoRoot(), "cli", "out", "lib", fileName);
  if (fs.existsSync(dev)) return dev;
  throw new Error(`CLI lib missing: ${fileName}`);
}

type ThemeRuntimeModule = {
  readActiveThemeManifest: (projectRoot: string) => { activeTheme: string };
  readPreviewThemeManifest: (projectRoot: string) => { activeTheme: string } | null;
  resolveThemeDirectory: (projectRoot: string, themeId: string) => string | null;
  readManifestSignature: (projectRoot: string) => string;
  readPreviewManifestSignature: (projectRoot: string) => string;
};

function loadThemeRuntime(monorepoRoot: string, siteRoot: string): ThemeRuntimeModule {
  process.env.REACTPRESS_DESKTOP_SITE_ROOT = siteRoot;
  process.env.REACTPRESS_MONOREPO_ROOT = monorepoRoot;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(resolveCliLib(monorepoRoot, "theme-runtime.js")) as ThemeRuntimeModule;
}

function hasProductionBuild(themeDir: string): boolean {
  const nextDir = path.join(themeDir, ".next");
  return (
    fs.existsSync(path.join(nextDir, "BUILD_ID")) &&
    fs.existsSync(path.join(nextDir, "server"))
  );
}

function resolveThemeDirForRuntime(
  runtime: ThemeRuntimeModule,
  siteRoot: string,
  monorepoRoot: string,
  themeId: string,
): string | null {
  const resolved = runtime.resolveThemeDirectory(siteRoot, themeId);
  if (resolved && hasProductionBuild(resolved)) return resolved;

  const bundled = path.join(monorepoRoot, "themes", themeId);
  if (fs.existsSync(bundled) && hasProductionBuild(bundled)) return bundled;

  if (resolved && fs.existsSync(path.join(resolved, "server.js"))) return resolved;
  return resolved;
}

function killThemeProcess(child: ChildProcess | null): void {
  if (!child || child.killed) return;
  try {
    child.kill("SIGTERM");
  } catch {
    // ignore
  }
}

function resolveThemeNodePath(themeDir: string, monorepoRoot: string): string {
  const parts = [
    path.join(themeDir, "node_modules"),
    resolveServerNodeModules(monorepoRoot),
  ];
  const existing = parts.filter((p) => fs.existsSync(p));
  return existing.join(path.delimiter);
}

function spawnThemeProduction(options: {
  themeDir: string;
  port: number;
  siteRoot: string;
  apiPort: number;
  monorepoRoot: string;
}): ChildProcess | null {
  const serverJs = path.join(options.themeDir, "server.js");
  if (!fs.existsSync(serverJs)) {
    console.error("[ReactPress Desktop] Theme server.js missing:", options.themeDir);
    return null;
  }

  const apiBase = getLocalApiBaseUrl(options.apiPort);
  const child = spawn(process.execPath, [serverJs], {
    cwd: options.themeDir,
    env: {
      ...process.env,
      ...(isElectronHost() ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
      NODE_ENV: "production",
      PORT: String(options.port),
      CLIENT_PORT: String(options.port),
      REACTPRESS_ORIGINAL_CWD: options.siteRoot,
      REACTPRESS_THEME_DIR: options.themeDir,
      REACTPRESS_API_URL: apiBase,
      SERVER_API_URL: apiBase,
      NEXT_PUBLIC_REACTPRESS_API_URL: apiBase,
      REACTPRESS_SKIP_DEV_PORT_REDIRECT: "1",
      NODE_PATH: resolveThemeNodePath(options.themeDir, options.monorepoRoot),
    },
    stdio: "pipe",
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    if (text.includes("Error") || text.includes("Failed") || text.includes("Cannot find")) {
      console.error("[ReactPress Desktop Theme]", text.trim());
    }
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`[ReactPress Desktop] Theme process exited with code ${code}`);
    }
  });

  return child;
}

async function waitForThemePort(port: number, timeoutMs = 120_000): Promise<boolean> {
  const url = `http://127.0.0.1:${port}/`;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.ok || res.status === 304 || res.status === 307 || res.status === 308) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function restartActiveTheme(options: {
  siteRoot: string;
  apiPort: number;
  monorepoRoot: string;
}): Promise<void> {
  const runtime = loadThemeRuntime(options.monorepoRoot, options.siteRoot);
  const signature = runtime.readManifestSignature(options.siteRoot);
  if (!signature) {
    runningActiveSignature = "";
    killThemeProcess(activeThemeProcess);
    activeThemeProcess = null;
    return;
  }

  if (signature === runningActiveSignature && activeThemeProcess && !activeThemeProcess.killed) {
    return;
  }

  const { activeTheme } = runtime.readActiveThemeManifest(options.siteRoot);
  const themeDir = resolveThemeDirForRuntime(
    runtime,
    options.siteRoot,
    options.monorepoRoot,
    activeTheme,
  );
  if (!themeDir) {
    console.error(`[ReactPress Desktop] Active theme not found: ${activeTheme}`);
    return;
  }

  killThemeProcess(activeThemeProcess);
  activeThemeProcess = null;
  runningActiveSignature = "";

  activeThemeProcess = spawnThemeProduction({
    themeDir,
    port: VISITOR_PORT,
    siteRoot: options.siteRoot,
    apiPort: options.apiPort,
    monorepoRoot: options.monorepoRoot,
  });
  if (!activeThemeProcess) return;

  runningActiveSignature = signature;
  const ready = await waitForThemePort(VISITOR_PORT);
  if (ready) {
    console.log(`[ReactPress Desktop] Visitor site ready: http://localhost:${VISITOR_PORT}/ (${activeTheme})`);
  } else {
    console.warn(`[ReactPress Desktop] Visitor site slow or failed on :${VISITOR_PORT}`);
  }
}

async function restartPreviewTheme(options: {
  siteRoot: string;
  apiPort: number;
  monorepoRoot: string;
}): Promise<void> {
  const runtime = loadThemeRuntime(options.monorepoRoot, options.siteRoot);
  const signature = runtime.readPreviewManifestSignature(options.siteRoot);

  if (!signature) {
    runningPreviewSignature = "";
    killThemeProcess(previewThemeProcess);
    previewThemeProcess = null;
    return;
  }

  const previewManifest = runtime.readPreviewThemeManifest(options.siteRoot);
  const previewThemeId = previewManifest?.activeTheme;
  if (!previewThemeId) return;

  const { activeTheme } = runtime.readActiveThemeManifest(options.siteRoot);
  if (previewThemeId === activeTheme) {
    runningPreviewSignature = "";
    killThemeProcess(previewThemeProcess);
    previewThemeProcess = null;
    return;
  }

  if (
    signature === runningPreviewSignature &&
    previewThemeProcess &&
    !previewThemeProcess.killed
  ) {
    return;
  }

  const themeDir = resolveThemeDirForRuntime(
    runtime,
    options.siteRoot,
    options.monorepoRoot,
    previewThemeId,
  );
  if (!themeDir) return;

  killThemeProcess(previewThemeProcess);
  previewThemeProcess = null;
  runningPreviewSignature = "";

  previewThemeProcess = spawnThemeProduction({
    themeDir,
    port: PREVIEW_PORT,
    siteRoot: options.siteRoot,
    apiPort: options.apiPort,
    monorepoRoot: options.monorepoRoot,
  });
  if (!previewThemeProcess) return;

  runningPreviewSignature = signature;
  const ready = await waitForThemePort(PREVIEW_PORT);
  if (ready) {
    console.log(
      `[ReactPress Desktop] Theme preview ready: http://localhost:${PREVIEW_PORT}/ (${previewThemeId})`,
    );
  }
}

function watchThemeManifests(
  options: { siteRoot: string; apiPort: number; monorepoRoot: string },
  onChange: () => void,
): () => void {
  const manifestDir = path.join(options.siteRoot, ".reactpress");
  fs.mkdirSync(manifestDir, { recursive: true });

  let debounce: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(onChange, 250);
  };

  const watcher = fs.watch(manifestDir, schedule);
  const poller = setInterval(schedule, 1500);

  return () => {
    if (debounce) clearTimeout(debounce);
    clearInterval(poller);
    watcher.close();
  };
}

export async function startLocalThemeSite(options: {
  siteRoot: string;
  apiPort?: number;
  monorepoRoot?: string;
}): Promise<void> {
  if (!isPackagedRuntime()) return;

  const apiPort = options.apiPort ?? DEFAULT_LOCAL_API_PORT;
  const monorepoRoot = resolveMonorepoRoot(options);
  const ctx = { siteRoot: options.siteRoot, apiPort, monorepoRoot };

  const sync = () => {
    void restartActiveTheme(ctx).then(() => restartPreviewTheme(ctx));
  };

  sync();
  watchCleanup = watchThemeManifests(ctx, sync);
}

export function stopLocalThemeSite(): void {
  if (watchCleanup) {
    watchCleanup();
    watchCleanup = null;
  }
  killThemeProcess(activeThemeProcess);
  killThemeProcess(previewThemeProcess);
  activeThemeProcess = null;
  previewThemeProcess = null;
  runningActiveSignature = "";
  runningPreviewSignature = "";
}
