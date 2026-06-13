import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { DEFAULT_LOCAL_API_PORT } from "../shared/constants";
import { ensureLocalSite } from "./local-site";

let serverProcess: ChildProcess | null = null;
let activePort = DEFAULT_LOCAL_API_PORT;
let activeSiteRoot: string | null = null;

function resolveMonorepoRoot(): string {
  return path.resolve(__dirname, "../../..");
}

function resolveServerMain(monorepoRoot: string): string {
  const devMain = path.join(monorepoRoot, "server/dist/main.js");
  if (fs.existsSync(devMain)) return devMain;
  const bundledMain = path.join(monorepoRoot, "cli/server/dist/main.js");
  if (fs.existsSync(bundledMain)) return bundledMain;
  throw new Error("ReactPress server is not built. Run: pnpm run --dir server build");
}

function ensureServerBuilt(monorepoRoot: string): void {
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
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Local API did not become ready at ${url}`);
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
}): Promise<{ port: number; apiBaseUrl: string }> {
  if (serverProcess && !serverProcess.killed) {
    return { port: activePort, apiBaseUrl: getLocalApiBaseUrl(activePort) };
  }

  const monorepoRoot = options.monorepoRoot ?? resolveMonorepoRoot();
  const port = options.port ?? DEFAULT_LOCAL_API_PORT;
  ensureServerBuilt(monorepoRoot);
  ensureLocalSite(options.siteRoot, port, { monorepoRoot });

  const serverMain = resolveServerMain(monorepoRoot);
  const serverDir = path.dirname(path.dirname(serverMain));

  serverProcess = spawn(process.execPath, [serverMain], {
    cwd: serverDir,
    env: {
      ...process.env,
      NODE_ENV: "production",
      REACTPRESS_ORIGINAL_CWD: options.siteRoot,
      REACTPRESS_MONOREPO_ROOT: monorepoRoot,
      REACTPRESS_LOCAL_API_QUIET: "1",
    },
    stdio: "inherit",
  });

  serverProcess.on("exit", () => {
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
