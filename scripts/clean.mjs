#!/usr/bin/env node
/**
 * 清理 node_modules 与各包 dev/build 缓存（并行删除）
 * 用法: pnpm clean && pnpm install
 */
import { existsSync, readdirSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONCURRENCY = Math.max(4, os.cpus().length);

const SKIP_DIRS = new Set([".git", ".husky"]);
const CACHE_DIR_NAMES = new Set([
  ".next",
  ".turbo",
  ".cache",
  ".vite",
  ".eslintcache",
  "coverage",
  "test-results",
  "playwright-report",
]);

/** @type {string[]} */
const EXTRA_TARGETS = [".reactpress/runtime", "dist"];

function shouldSkipDir(name) {
  return SKIP_DIRS.has(name);
}

/**
 * @param {string} dir
 * @param {(rel: string) => void} onMatch
 */
function walk(dir, onMatch) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const abs = path.join(dir, entry.name);
    const rel = path.relative(root, abs);

    if (entry.name === "node_modules" || CACHE_DIR_NAMES.has(entry.name)) {
      onMatch(rel);
      continue;
    }

    if (shouldSkipDir(entry.name)) continue;
    walk(abs, onMatch);
  }
}

async function removeRel(rel) {
  const abs = path.join(root, rel);
  if (!existsSync(abs)) return null;
  await fs.rm(abs, { recursive: true, force: true, maxRetries: 2, retryDelay: 50 });
  return rel;
}

/** @param {string[]} items @param {(item: string) => Promise<string|null>} fn */
async function runPool(items, fn) {
  /** @type {Promise<string|null>[]} */
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => worker()),
  );
  return results.filter(Boolean);
}

/** @type {Set<string>} */
const targets = new Set(EXTRA_TARGETS);
walk(root, (rel) => targets.add(rel));

const list = [...targets];
const removed = await runPool(list, removeRel);

if (removed.length === 0) {
  console.log("[clean] 没有需要清理的 node_modules 或缓存");
} else {
  console.log(`[clean] 已并行删除 (${CONCURRENCY} 路) node_modules / 缓存:`);
  for (const rel of removed.sort()) console.log(`  - ${rel}`);
  console.log("\n[clean] 请运行 pnpm install 重新安装依赖");
}
