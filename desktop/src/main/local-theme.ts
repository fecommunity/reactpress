import { type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { DEFAULT_LOCAL_API_PORT } from "../shared/constants";
import { getLocalApiBaseUrl } from "./local-server";
import {
  bundledResourcesRoot,
  ensurePackagedModuleResolution,
  isPackagedRuntime,
  listPackagedNodeModuleDirs,
} from "./packaged-runtime";
import {
  attachChildProcessLogging,
  logError,
  logInfo,
  logWarn,
} from "./system-log";

const VISITOR_PORT = 3001;
const PREVIEW_PORT = 3003;

let activeThemeProcess: ChildProcess | null = null;
let previewThemeProcess: ChildProcess | null = null;
let watchCleanup: (() => void) | null = null;
let runningActiveSignature = "";
let runningPreviewSignature = "";

function isElectronHost(): boolean {
  return Boolean(process.versions.electron);
}

function resolveDevMonorepoRoot(): string {
  return path.resolve(__dirname, "../../..");
}

function resolveMonorepoRoot(options?: { monorepoRoot?: string }): string {
  if (options?.monorepoRoot) return options.monorepoRoot;
  if (isPackagedRuntime()) return bundledResourcesRoot();
  return resolveDevMonorepoRoot();
}

function resolveSharedRuntimeNodeModules(monorepoRoot: string): string | null {
  if (!isPackagedRuntime()) return null;
  const shared = path.join(bundledResourcesRoot(), "runtime-deps", "node_modules");
  return fs.existsSync(shared) ? shared : null;
}

function resolveCliRuntimeNodeModules(): string | null {
  if (!isPackagedRuntime()) return null;
  const cliNm = path.join(bundledResourcesRoot(), "cli", "node_modules");
  return fs.existsSync(cliNm) ? cliNm : null;
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

function requireCliLib<T>(monorepoRoot: string, fileName: string): T {
  ensurePackagedModuleResolution();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(resolveCliLib(monorepoRoot, fileName)) as T;
}

type ThemeRuntimeModule = {
  readActiveThemeManifest: (projectRoot: string) => { activeTheme: string };
  readPreviewThemeManifest: (projectRoot: string) => { activeTheme: string } | null;
  resolveThemeDirectory: (projectRoot: string, themeId: string) => string | null;
  readManifestSignature: (projectRoot: string) => string;
  readPreviewManifestSignature: (projectRoot: string) => string;
};

type ThemePreviewPoolModule = {
  resolvePreviewThemeLaunchPlan: (themeDir: string, port: number) => { mode: string; cmd: string; args: string[] };
  spawnThemeProcess: (
    projectRoot: string,
    options: {
      themeDir: string;
      themeId: string;
      port: number;
      serverApiUrl: string;
      publicApiUrl: string;
      launch: { mode: string; cmd: string; args: string[] };
      role?: "visitor" | "preview";
      extraEnv?: Record<string, string | undefined>;
    },
  ) => ChildProcess;
  releasePreviewPort: (port: number) => Promise<boolean>;
  withPreviewPortLock: <T>(fn: () => Promise<T>) => Promise<T>;
};

type ThemeProdModule = {
  enqueueThemeBuild: (
    projectRoot: string,
    themeId: string,
    options?: { logPrefix?: string; distDir?: string },
  ) => Promise<{ themeId: string; themeDir: string; skippedBuild?: boolean }>;
  PREVIEW_DIST_DIR: string;
  ensureThemeDependenciesInstalled: (
    projectRoot: string,
    themeDir: string,
    themeId: string,
    logPrefix?: string,
  ) => void;
};

type ThemePreviewFrameModule = {
  ensurePreviewFrameAllowed: (dir: string) => boolean;
};

function loadThemeRuntime(monorepoRoot: string, siteRoot: string): ThemeRuntimeModule {
  process.env.REACTPRESS_DESKTOP_SITE_ROOT = siteRoot;
  process.env.REACTPRESS_MONOREPO_ROOT = monorepoRoot;
  return requireCliLib<ThemeRuntimeModule>(monorepoRoot, "theme-runtime.js");
}

function loadThemePreviewPool(monorepoRoot: string): ThemePreviewPoolModule {
  return requireCliLib<ThemePreviewPoolModule>(monorepoRoot, "theme-preview-pool.js");
}

function loadThemeProd(monorepoRoot: string): ThemeProdModule {
  return requireCliLib<ThemeProdModule>(monorepoRoot, "theme-prod.js");
}

function loadThemePreviewFrame(monorepoRoot: string): ThemePreviewFrameModule | null {
  try {
    return requireCliLib<ThemePreviewFrameModule>(monorepoRoot, "theme-preview-frame.js");
  } catch {
    return null;
  }
}

function hasProductionBuild(themeDir: string, distDir = ".next"): boolean {
  const nextDir = path.join(themeDir, distDir);
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

  const bundledRuntime = path.join(monorepoRoot, ".reactpress", "runtime", themeId);
  if (fs.existsSync(bundledRuntime) && hasProductionBuild(bundledRuntime)) return bundledRuntime;

  if (resolved && fs.existsSync(path.join(resolved, "package.json"))) return resolved;
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
    resolveCliRuntimeNodeModules(),
    resolveSharedRuntimeNodeModules(monorepoRoot),
    resolveServerNodeModules(monorepoRoot),
  ].filter((p): p is string => Boolean(p));
  const existing = parts.filter((p) => fs.existsSync(p));
  return existing.join(path.delimiter);
}

type ThemeLaunchPlan = { mode: string; cmd: string; args: string[] };

function resolveSharedNextBin(themeDir: string, monorepoRoot: string): string | null {
  const candidates = [
    path.join(themeDir, "node_modules", "next", "dist", "bin", "next"),
    path.join(monorepoRoot, "node_modules", "next", "dist", "bin", "next"),
  ];

  if (isPackagedRuntime()) {
    for (const dir of [
      resolveCliRuntimeNodeModules(),
      ...listPackagedNodeModuleDirs(),
    ]) {
      if (dir) candidates.push(path.join(dir, "next", "dist", "bin", "next"));
    }
  } else {
    for (const dir of [resolveSharedRuntimeNodeModules(monorepoRoot)]) {
      if (dir) candidates.push(path.join(dir, "next", "dist", "bin", "next"));
    }
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

/** Electron packaged apps have no `node`/`pnpm` on PATH — use Electron as Node. */
function normalizeThemeLaunchForElectron(
  launch: ThemeLaunchPlan,
  options: { themeDir: string; port: number; monorepoRoot: string },
): ThemeLaunchPlan {
  if (!isElectronHost()) return launch;

  const { execPath } = process;

  if (launch.cmd === "node") {
    return { ...launch, cmd: execPath };
  }

  if (launch.cmd === "pnpm" || launch.cmd === "npm") {
    const script = launch.args[launch.args[0] === "run" ? 1 : 0];
    const nextBin = resolveSharedNextBin(options.themeDir, options.monorepoRoot);

    if (nextBin && (script === "start" || script === "dev")) {
      const portIdx = launch.args.indexOf("--port");
      const pIdx = launch.args.indexOf("-p");
      let port = options.port;
      if (portIdx >= 0) port = Number(launch.args[portIdx + 1]) || port;
      else if (pIdx >= 0) port = Number(launch.args[pIdx + 1]) || port;

      if (script === "dev") {
        return { mode: "dev", cmd: execPath, args: [nextBin, "dev", "-p", String(port)] };
      }
      return { mode: launch.mode, cmd: execPath, args: [nextBin, "start", "-p", String(port)] };
    }

    if (fs.existsSync(path.join(options.themeDir, "server.js"))) {
      return { mode: "production", cmd: execPath, args: ["server.js"] };
    }
  }

  return launch;
}

/** Packaged app ships shared node_modules — skip npm/pnpm install in theme dir. */
function themeRuntimeReady(themeDir: string): boolean {
  const localNext = path.join(themeDir, "node_modules", "next");
  if (fs.existsSync(localNext)) return true;

  if (!isPackagedRuntime()) return false;

  const candidates = [
    ...listPackagedNodeModuleDirs(),
    resolveCliRuntimeNodeModules(),
  ].filter((p): p is string => Boolean(p));

  return candidates.some((nm) => fs.existsSync(path.join(nm, "next")));
}

function maybeEnsureThemeDependencies(
  prod: ThemeProdModule,
  siteRoot: string,
  themeDir: string,
  themeId: string,
): void {
  if (themeRuntimeReady(themeDir)) return;
  prod.ensureThemeDependenciesInstalled(siteRoot, themeDir, themeId, "themePreview");
}

function ensureThemePreviewFrame(themeDir: string, monorepoRoot: string): void {
  const frame = loadThemePreviewFrame(monorepoRoot);
  if (!frame) return;
  try {
    frame.ensurePreviewFrameAllowed(themeDir);
  } catch {
    // optional patch for Next.js themes
  }
}

async function spawnThemeServer(options: {
  themeDir: string;
  themeId: string;
  port: number;
  siteRoot: string;
  apiPort: number;
  monorepoRoot: string;
  role: "visitor" | "preview";
}): Promise<ChildProcess | null> {
  const pool = loadThemePreviewPool(options.monorepoRoot);
  const prod = loadThemeProd(options.monorepoRoot);
  const apiBase = getLocalApiBaseUrl(options.apiPort);

  try {
    maybeEnsureThemeDependencies(prod, options.siteRoot, options.themeDir, options.themeId);
    ensureThemePreviewFrame(options.themeDir, options.monorepoRoot);
  } catch (err) {
    logError(
      "theme",
      `setup failed for ${options.themeId}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }

  const launch = normalizeThemeLaunchForElectron(
    pool.resolvePreviewThemeLaunchPlan(options.themeDir, options.port),
    options,
  );

  if (launch.mode === "production") {
    const distDir = options.role === "preview" ? prod.PREVIEW_DIST_DIR : ".next";
    if (!hasProductionBuild(options.themeDir, distDir)) {
      try {
        await prod.enqueueThemeBuild(options.siteRoot, options.themeId, {
          logPrefix: "themePreview",
          distDir: options.role === "preview" ? prod.PREVIEW_DIST_DIR : undefined,
        });
      } catch (err) {
        logError(
          "theme",
          `build failed for ${options.themeId}: ${err instanceof Error ? err.message : String(err)}`,
        );
        return null;
      }
    }
  }

  const child = pool.spawnThemeProcess(options.siteRoot, {
    themeDir: options.themeDir,
    themeId: options.themeId,
    port: options.port,
    serverApiUrl: apiBase,
    publicApiUrl: apiBase,
    launch,
    role: options.role,
    extraEnv: {
      ...(isElectronHost() ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
      ...(isPackagedRuntime() ? { REACTPRESS_SKIP_THEME_INSTALL: "1" } : {}),
      REACTPRESS_ORIGINAL_CWD: options.siteRoot,
      REACTPRESS_THEME_DIR: options.themeDir,
      NODE_PATH: resolveThemeNodePath(options.themeDir, options.monorepoRoot),
    },
  });

  attachChildProcessLogging(child, `theme:${options.role}:${options.themeId}`);

  child.on("exit", (code, signal) => {
    if (code && code !== 0) {
      logError(
        "theme",
        `${options.themeId} on :${options.port} exited (code=${code}, signal=${signal ?? "none"})`,
      );
    } else {
      logInfo("theme", `${options.themeId} on :${options.port} exited (code=${code ?? 0})`);
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
    logError("theme", `active theme not found: ${activeTheme}`);
    return;
  }

  killThemeProcess(activeThemeProcess);
  activeThemeProcess = null;
  runningActiveSignature = "";

  activeThemeProcess = await spawnThemeServer({
    themeDir,
    themeId: activeTheme,
    port: VISITOR_PORT,
    siteRoot: options.siteRoot,
    apiPort: options.apiPort,
    monorepoRoot: options.monorepoRoot,
    role: "visitor",
  });
  if (!activeThemeProcess) return;

  runningActiveSignature = signature;
  const ready = await waitForThemePort(VISITOR_PORT);
  if (ready) {
    logInfo("theme", `visitor site ready http://localhost:${VISITOR_PORT}/ (${activeTheme})`);
  } else {
    logWarn("theme", `visitor site slow or failed on :${VISITOR_PORT} (${activeTheme})`);
  }
}

async function restartPreviewTheme(options: {
  siteRoot: string;
  apiPort: number;
  monorepoRoot: string;
}): Promise<void> {
  const pool = loadThemePreviewPool(options.monorepoRoot);
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

  await pool.withPreviewPortLock(async () => {
    killThemeProcess(previewThemeProcess);
    previewThemeProcess = null;
    runningPreviewSignature = "";

    await pool.releasePreviewPort(PREVIEW_PORT);

    previewThemeProcess = await spawnThemeServer({
      themeDir,
      themeId: previewThemeId,
      port: PREVIEW_PORT,
      siteRoot: options.siteRoot,
      apiPort: options.apiPort,
      monorepoRoot: options.monorepoRoot,
      role: "preview",
    });
    if (!previewThemeProcess) return;

    runningPreviewSignature = signature;
    const ready = await waitForThemePort(PREVIEW_PORT);
    if (ready) {
      logInfo(
        "theme",
        `preview ready http://localhost:${PREVIEW_PORT}/ (${previewThemeId})`,
      );
    }
  });
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

  logInfo("theme", `starting theme site watcher (siteRoot=${options.siteRoot})`);

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
