#!/usr/bin/env node
/**
 * 主题调试：委托 reactpress dev（API + 主题 :3001 + 后台 + nginx 统一入口）
 *
 *   pnpm dev:themes       → reactpress dev（推荐）
 *   pnpm dev:themes:api   → 同上（别名）
 */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

console.log(`
  ReactPress 主题开发
  ───────────────────
  统一入口（需 Docker）:  http://localhost
    访客站 / 当前启用主题
    管理后台 /admin/
    API      /api

  启动中…
`);

const child = spawn("node", ["./cli/bin/reactpress.js", "dev"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    REACTPRESS_ORIGINAL_CWD: root,
  },
});

child.on("close", (code) => process.exit(code ?? 0));

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
