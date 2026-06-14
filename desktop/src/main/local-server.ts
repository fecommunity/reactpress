import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { DEFAULT_LOCAL_API_PORT } from "../shared/constants";
import { ensureLocalSite } from "./local-site";
import {
  bundledResourcesRoot,
  isPackagedRuntime,
  resolvePackagedNodePath,
} from "./packaged-runtime";
import {
  attachChildProcessLogging,
  isDesktopDebugVerbose,
  logError,
  logInfo,
} from "./system-log";

let serverProcess: ChildProcess | null = null;
let activePort = DEFAULT_LOCAL_API_PORT;
let activeSiteRoot: string | null = null;

function isElectronHost(): boolean {
  return Boolean(process.versions.electron);
}

function resolveDevMonorepoRoot(): string {
  return path.resolve(__dirname, "../../..");
}

function resolveMonorepoRootForServer(options?: { monorepoRoot?: string }): string {
  if (options?.monorepoRoot) return options.monorepoRoot;
  if (isPackagedRuntime()) return bundledResourcesRoot();
  return resolveDevMonorepoRoot();
}

function resolveServerMain(monorepoRoot: string): string {
  if (isPackagedRuntime()) {
    const bundledMain = path.join(bundledResourcesRoot(), "server", "dist", "main.js");
    if (fs.existsSync(bundledMain)) return bundledMain;
    throw new Error("Bundled ReactPress server not found. Rebuild with: pnpm build:desktop");
  }

  const devMain = path.join(monorepoRoot, "server/dist/main.js");
  if (fs.existsSync(devMain)) return devMain;

  const cliBundledMain = path.join(monorepoRoot, "cli/server/dist/main.js");
  if (fs.existsSync(cliBundledMain)) return cliBundledMain;

  throw new Error("ReactPress server is not built. Run: pnpm run --dir server build");
}

function resolveServerCwd(serverMain: string): string {
  if (isPackagedRuntime()) {
    return path.join(bundledResourcesRoot(), "server");
  }
  return path.dirname(path.dirname(serverMain));
}

function ensureServerBuilt(monorepoRoot: string): void {
  if (isPackagedRuntime()) return;

  const devMain = path.join(monorepoRoot, "server/dist/main.js");
  if (fs.existsSync(devMain)) return;

  const build = spawnSync("pnpm", ["run", "--dir", "./server", "build"], {
    cwd: monorepoRoot,
    shell: true,
    stdio: "inherit",
  });
  if (build.status !== 0) {
    throw new Error("Failed to build ReactPress server for local desktop mode");
  }
}

async function waitForHealth(port: number, timeoutMs = 120_000): Promise<void> {
  const url = `http://127.0.0.1:${port}/api/health`;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isLocalApiHealthy(port)) return;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Local API did not become ready at ${url}`);
}

export async function isLocalApiHealthy(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export function getLocalApiBaseUrl(port = activePort): string {
  return `http://127.0.0.1:${port}/api`;
}

export function isLocalServerRunning(): boolean {
  return Boolean(serverProcess && !serverProcess.killed);
}

export async function startLocalServer(options: {
  siteRoot: string;
  port?: number;
  monorepoRoot?: string;
  /** Skip health reuse and spawn a process this session owns (CLI dev restart). */
  forceRestart?: boolean;
}): Promise<{ port: number; apiBaseUrl: string }> {
  const port = options.port ?? DEFAULT_LOCAL_API_PORT;

  if (serverProcess && !serverProcess.killed) {
    return { port: activePort, apiBaseUrl: getLocalApiBaseUrl(activePort) };
  }

  // Dev: CLI may have already started the API in another process — reuse it.
  if (!options.forceRestart && (await isLocalApiHealthy(port))) {
    logInfo("api", `reusing existing healthy API on :${port}`);
    activePort = port;
    activeSiteRoot = options.siteRoot;
    return { port, apiBaseUrl: getLocalApiBaseUrl(port) };
  }

  const monorepoRoot = resolveMonorepoRootForServer(options);
  ensureServerBuilt(monorepoRoot);
  ensureLocalSite(options.siteRoot, port, { monorepoRoot });

  const serverMain = resolveServerMain(monorepoRoot);
  const serverCwd = resolveServerCwd(serverMain);
  const pipeChildLogs = isPackagedRuntime() || isDesktopDebugVerbose();

  logInfo("api", `spawning local API on :${port} (siteRoot=${options.siteRoot})`);

  serverProcess = spawn(process.execPath, [serverMain], {
    cwd: serverCwd,
    env: {
      ...process.env,
      ...(isElectronHost() ? { ELECTRON_RUN_AS_NODE: "1" } : {}),
      NODE_PATH: isPackagedRuntime()
        ? resolvePackagedNodePath()
        : process.env.NODE_PATH,
      NODE_ENV: "production",
      REACTPRESS_ORIGINAL_CWD: options.siteRoot,
      REACTPRESS_MONOREPO_ROOT: monorepoRoot,
      ...(isDesktopDebugVerbose() ? {} : { REACTPRESS_LOCAL_API_QUIET: "1" }),
      ...(isPackagedRuntime()
        ? {
            REACTPRESS_THEME_RUNTIME_SYMLINK: "1",
            REACTPRESS_DESKTOP_SITE_ROOT: options.siteRoot,
            REACTPRESS_SERVER_LOG_DIR: path.join(
              path.dirname(options.siteRoot),
              "logs",
              "server",
            ),
          }
        : {}),
    },
    stdio: pipeChildLogs ? "pipe" : "inherit",
  });

  if (pipeChildLogs && serverProcess) {
    attachChildProcessLogging(serverProcess, "api");
  }

  serverProcess.on("exit", (code, signal) => {
    if (code && code !== 0) {
      logError("api", `process exited (code=${code}, signal=${signal ?? "none"})`);
    } else {
      logInfo("api", `process exited (code=${code ?? 0})`);
    }
    serverProcess = null;
  });

  activePort = port;
  activeSiteRoot = options.siteRoot;

  await waitForHealth(port);
  return { port, apiBaseUrl: getLocalApiBaseUrl(port) };
}

export function stopLocalServer(): void {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill("SIGTERM");
  }
  serverProcess = null;
}

export function getActiveSiteRoot(): string | null {
  return activeSiteRoot;
}

export function resolveDefaultSiteRoot(userDataPath: string): string {
  return path.join(userDataPath, "site");
}

export function resolveDevSiteRoot(monorepoRoot: string): string {
  return path.join(monorepoRoot, ".reactpress", "desktop-dev-site");
}
