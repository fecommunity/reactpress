#!/usr/bin/env node
/**
 * Full desktop dev entry: SQLite API + Vite Admin + theme previews + Electron.
 *
 * API is spawned via desktop/out/main/local-server.js (same code path as packaged
 * Electron main). Bootstrap: desktop/scripts/bootstrap-local-api.cjs
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "../..");

process.chdir(monorepoRoot);
if (!process.env.REACTPRESS_ORIGINAL_CWD?.trim()) {
  process.env.REACTPRESS_ORIGINAL_CWD = monorepoRoot;
}

const require = createRequire(import.meta.url);
const devLib = path.join(monorepoRoot, "cli/out/lib/dev.js");

if (!fs.existsSync(devLib)) {
  console.error(
    "[ReactPress Desktop] CLI is not built. Run: pnpm run --dir cli build",
  );
  process.exit(1);
}

const { runDesktopDev } = require(devLib);

runDesktopDev(monorepoRoot).catch((err) => {
  console.error("[ReactPress Desktop]", err?.message || err);
  process.exit(err?.exitCode ?? 1);
});
