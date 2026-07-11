#!/usr/bin/env node
/**
 * Start embedded SQLite API for desktop dev (same spawn path as Electron main).
 * CommonJS so cli/out/lib/dev.js can require() it (TS module: CommonJS rewrites import()).
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const desktopRoot = path.join(__dirname, "..");

function ensureDesktopBuilt(monorepoRoot) {
  const localServerJs = path.join(monorepoRoot, "desktop/out/main/local-server.js");
  if (fs.existsSync(localServerJs)) return;

  const buildResult = spawnSync("pnpm", ["run", "--dir", "./desktop", "build"], {
    cwd: monorepoRoot,
    shell: true,
    stdio: "inherit",
    env: {
      ...process.env,
      REACTPRESS_ORIGINAL_CWD: monorepoRoot,
    },
  });
  if (buildResult.status !== 0) {
    process.exit(buildResult.status ?? 1);
  }
}

async function killStaleLocalApiPort(monorepoRoot, port) {
  const portsPath = path.join(monorepoRoot, "cli/out/lib/ports.js");
  if (!fs.existsSync(portsPath)) return;

  const { killPortListeners, isPortListening } = require(portsPath);
  if (!isPortListening(port)) return;

  killPortListeners(port, "TERM");
  await new Promise((r) => setTimeout(r, 400));
  if (isPortListening(port)) {
    killPortListeners(port, "KILL");
    await new Promise((r) => setTimeout(r, 200));
  }
}

async function startDesktopLocalApi(monorepoRoot, { forceRestart = false, port } = {}) {
  if (!fs.existsSync(path.join(desktopRoot, "package.json"))) {
    throw new Error("desktop/package.json not found — run from monorepo root");
  }

  ensureDesktopBuilt(monorepoRoot);

  const localServerPath = path.join(monorepoRoot, "desktop/out/main/local-server.js");
  const {
    startLocalServer,
    resolveDevSiteRoot,
    getLocalApiBaseUrl,
    stopLocalServer,
    DEFAULT_LOCAL_API_PORT,
  } = require(localServerPath);

  const fromEnv = parseInt(
    process.env.REACTPRESS_LOCAL_API_PORT || process.env.SERVER_PORT || "",
    10,
  );
  const localApiPort =
    port ?? (Number.isInteger(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_LOCAL_API_PORT);

  if (forceRestart) {
    try {
      stopLocalServer();
    } catch {
      // ignore
    }
    await killStaleLocalApiPort(monorepoRoot, localApiPort);
  }

  const siteRoot = resolveDevSiteRoot(monorepoRoot);
  await startLocalServer({
    siteRoot,
    monorepoRoot,
    port: localApiPort,
    forceRestart,
  });
  const localApiBase = getLocalApiBaseUrl(localApiPort);

  return { siteRoot, localApiBase, port: localApiPort };
}

module.exports = { ensureDesktopBuilt, startDesktopLocalApi };
