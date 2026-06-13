/**
 * Ensures the Electron binary is downloaded after pnpm install.
 * pnpm may skip electron's postinstall when onlyBuiltDependencies is misconfigured
 * or on a lockfile-only install — run install.js explicitly if path.txt is missing.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
