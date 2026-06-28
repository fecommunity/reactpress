/**
 * Ensures the Electron binary is downloaded after pnpm install.
 * pnpm may skip electron's postinstall when onlyBuiltDependencies is misconfigured
 * or on a lockfile-only install — run install.js explicitly if path.txt is missing.
 *
 * Skipped in CI: server/web builds do not need the Electron binary. Node 24.16+ also
 * has a known regression where electron/install.js exits 0 without writing path.txt.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

function shouldSkipInstall() {
  return (
    process.env.CI === "true" ||
    process.env.CI === "1" ||
    process.env.SKIP_ELECTRON_BINARY === "1" ||
    process.env.ELECTRON_SKIP_BINARY_DOWNLOAD === "1"
  );
}

if (shouldSkipInstall()) {
  console.log("[desktop] Skipping Electron binary install (CI or skip flag).");
  process.exit(0);
}

const require = createRequire(import.meta.url);

let electronDir;
try {
  electronDir = path.dirname(require.resolve("electron/package.json"));
} catch {
  console.warn("[desktop] electron package not found — skip binary install");
  process.exit(0);
}

const pathFile = path.join(electronDir, "path.txt");
if (fs.existsSync(pathFile)) {
  process.exit(0);
}

console.log("[desktop] Electron binary missing — running install.js …");
const result = spawnSync(process.execPath, [path.join(electronDir, "install.js")], {
  stdio: "inherit",
  cwd: electronDir,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

if (!fs.existsSync(pathFile)) {
  console.error("[desktop] Electron install.js finished but path.txt is still missing.");
  process.exit(1);
}
