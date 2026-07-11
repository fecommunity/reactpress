/**
 * Remove dev-only and duplicate packages from pnpm deploy output.
 * Safe for desktop local API runtime (NestJS + toolkit dist).
 */
import fs from "node:fs";
import path from "node:path";

/** pnpm virtual store folder names to drop (prefix match). */
const DROP_PNPM_PREFIXES = [
  "@playwright+",
  "playwright-core@",
  "playwright@",
  "typescript@",
  "prettier@",
  "eslint@",
  "@typescript-eslint+",
  "@eslint+",
  "jest@",
  "ts-jest@",
  "supertest@",
  "husky@",
  "lint-staged@",
  "@nestjs+cli@",
  "@nestjs+schematics@",
  "@nestjs+testing@",
  "ts-node@",
  "ts-loader@",
  "tslint@",
  "@fecommunity+reactpress@file+cli", // entire CLI package pulled transitively
];

/** Hoisted node_modules package names to drop (exact or prefix for scoped). */
const DROP_HOISTED_EXACT = new Set([
  "typescript",
  "prettier",
  "eslint",
  "jest",
  "ts-jest",
  "supertest",
  "husky",
  "lint-staged",
  "ts-node",
  "ts-loader",
  "tslint",
  "playwright",
  "playwright-core",
  "@playwright/test",
  "@nestjs/cli",
  "@nestjs/schematics",
  "@nestjs/testing",
  "@fecommunity/reactpress",
]);

const DROP_HOISTED_PREFIXES = ["@typescript-eslint/", "@eslint/"];

function rmrf(target) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

function shouldDropPnpmEntry(name) {
  return DROP_PNPM_PREFIXES.some((prefix) => name.startsWith(prefix));
}

function shouldDropHoistedEntry(name) {
  if (DROP_HOISTED_EXACT.has(name)) return true;
  return DROP_HOISTED_PREFIXES.some((prefix) => name.startsWith(prefix));
}

function prunePnpmVirtualStore(bundleDir) {
  const pnpmDir = path.join(bundleDir, "node_modules", ".pnpm");
  if (!fs.existsSync(pnpmDir)) {
    return { removed: 0, savedBytes: 0 };
  }

  let removed = 0;
  let savedBytes = 0;

  for (const entry of fs.readdirSync(pnpmDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!shouldDropPnpmEntry(entry.name)) continue;

    const full = path.join(pnpmDir, entry.name);
    try {
      const size = dirSize(full);
      rmrf(full);
      removed += 1;
      savedBytes += size;
    } catch {
      // ignore
    }
  }

  return { removed, savedBytes };
}

function pruneHoistedNodeModules(bundleDir) {
  const nodeModules = path.join(bundleDir, "node_modules");
  if (!fs.existsSync(nodeModules)) {
    return { removed: 0, savedBytes: 0 };
  }

  let removed = 0;
  let savedBytes = 0;

  for (const entry of fs.readdirSync(nodeModules, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === ".pnpm") continue;
    if (!shouldDropHoistedEntry(entry.name)) continue;

    const full = path.join(nodeModules, entry.name);
    try {
      const size = dirSize(full);
      rmrf(full);
      removed += 1;
      savedBytes += size;
    } catch {
      // ignore
    }
  }

  return { removed, savedBytes };
}

/**
 * @param {string} bundleDir Directory containing node_modules (e.g. .cache/server-bundle)
 * @returns {{ removed: number; savedBytes: number }}
 */
export function pruneBundleNodeModules(bundleDir) {
  const pnpm = prunePnpmVirtualStore(bundleDir);
  const hoisted = pruneHoistedNodeModules(bundleDir);
  return {
    removed: pnpm.removed + hoisted.removed,
    savedBytes: pnpm.savedBytes + hoisted.savedBytes,
  };
}

function dirSize(dir) {
  let total = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) {
        try {
          total += fs.statSync(full).size;
        } catch {
          // ignore
        }
      }
    }
  }
  return total;
}

export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
