#!/usr/bin/env node
/**
 * Launch Electron for local desktop dev.
 * macOS uses a patched ReactPress.app bundle so Dock label/icon branding works.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { prepareMacDevApp } from "./prepare-macos-dev-app.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");

function resolveElectronExecutable() {
  if (process.platform === "darwin") {
    return prepareMacDevApp(desktopRoot);
  }
  const require = createRequire(path.join(desktopRoot, "package.json"));
  return require("electron");
}

const child = spawn(resolveElectronExecutable(), ["."], {
  cwd: desktopRoot,
  env: {
    ...process.env,
    ELECTRON_IS_DEV: process.env.ELECTRON_IS_DEV || "1",
  },
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (err) => {
  console.error("[ReactPress Desktop] Failed to launch Electron:", err);
  process.exit(1);
});
