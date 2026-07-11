#!/usr/bin/env node
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const monorepoRoot = path.resolve(webRoot, "..");

execSync("pnpm run build", { cwd: path.join(monorepoRoot, "toolkit"), stdio: "inherit" });
execSync("pnpm run build", { cwd: webRoot, stdio: "inherit" });
