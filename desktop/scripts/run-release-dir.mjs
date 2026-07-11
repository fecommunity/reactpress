#!/usr/bin/env node
/**
 * Launch the unpacked ReactPress.app from build:desktop:dir — same code paths as a DMG install.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");

function resolveUnpackedApp() {
  const candidates = [
    path.join(desktopDir, "release/mac-arm64/ReactPress.app"),
    path.join(desktopDir, "release/mac/ReactPress.app"),
    path.join(desktopDir, "release/linux-unpacked/reactpress"),
    path.join(desktopDir, "release/win-unpacked/ReactPress.exe"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const appPath = resolveUnpackedApp();
if (!appPath) {
  console.error(
    "[desktop] Unpacked app not found. Run: pnpm build:desktop:dir",
  );
  process.exit(1);
}

const debug = process.argv.includes("--debug") || process.env.REACTPRESS_DESKTOP_DEBUG === "1";
const executable =
  process.platform === "darwin"
    ? path.join(appPath, "Contents/MacOS/ReactPress")
    : appPath;

console.log(`[desktop] Launching ${appPath}${debug ? " (debug)" : ""}`);

const child = spawn(executable, [], {
  stdio: "inherit",
  env: {
    ...process.env,
    ...(debug ? { REACTPRESS_DESKTOP_DEBUG: "1" } : {}),
  },
});

child.on("close", (code) => process.exit(code ?? 0));
child.on("error", (err) => {
  console.error("[desktop] Failed to launch:", err.message || err);
  process.exit(1);
});
