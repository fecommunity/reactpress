/**
 * Optimized desktop release pipeline — parallel builds, single toolkit compile, parallel deploy.
 *
 * Dependency graph:
 *   Phase 1 (parallel): toolkit, cli, desktop tsc
 *   Phase 2 (parallel): server, web (electron mode) — both need toolkit; server needs cli
 *   Phase 3: stage app resources (parallel pnpm deploy)
 *   Phase 4: electron-builder
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { stageAppResources } from "./prepare-app-resources.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");
const root = path.resolve(desktopDir, "..");
const dirOnly = process.argv.includes("--dir");

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

async function runAll(label, tasks) {
  console.log(`\n[desktop] ${label}…`);
  const results = await Promise.allSettled(tasks.map((task) => task()));
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    for (const f of failed) {
      console.error(f.reason?.message ?? f.reason);
    }
    process.exit(1);
  }
}

async function buildServerWithFallback() {
  const serverMain = path.join(root, "server/dist/main.js");
  try {
    await runAsync("server", "pnpm", ["run", "--dir", "server", "build"]);
  } catch (err) {
    if (fs.existsSync(serverMain)) {
      console.warn("[desktop] Server build failed — using existing server/dist.");
      return;
    }
    throw err;
  }
}

async function main() {
  const totalStarted = Date.now();
  console.log("[desktop] build:desktop — parallel pipeline");

  await runAll("Phase 1/4 · foundation (toolkit, cli, desktop shell)", [
    () => runAsync("toolkit", "pnpm", ["run", "build:toolkit"]),
    () => runAsync("cli", "pnpm", ["run", "--dir", "cli", "build"]),
    () => runAsync("desktop shell", "pnpm", ["run", "build"], desktopDir),
  ]);

  await runAll("Phase 2/4 · app bundles (server, web, theme)", [
    () => buildServerWithFallback(),
    () => runAsync("web (electron)", "pnpm", ["run", "--dir", "web", "build:electron"]),
    () => {
      const helloWorldDir = path.join(root, "themes", "hello-world");
      if (!fs.existsSync(helloWorldDir)) return Promise.resolve();
      return runAsync("hello-world theme", "pnpm", ["run", "build"], helloWorldDir);
    },
  ]);

  await stageAppResources();

  console.log("\n[desktop] Phase 4/4 · electron-builder…");
  const builderArgs = ["exec", "electron-builder", "--config", "electron-builder.yml"];
  if (dirOnly) builderArgs.push("--dir");
  await runAsync("electron-builder", "pnpm", builderArgs, desktopDir);

  const elapsed = ((Date.now() - totalStarted) / 1000).toFixed(1);
  console.log(`\n[desktop] Done in ${elapsed}s${dirOnly ? " (unpacked dir)" : ""}.`);
}

main().catch((err) => {
  console.error("[desktop]", err.message || err);
  process.exit(1);
});
