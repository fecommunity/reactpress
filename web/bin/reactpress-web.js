#!/usr/bin/env node

/**
 * ReactPress Admin SPA — static server & dist path helper.
 *
 * Usage:
 *   npx @fecommunity/reactpress-web
 *   npx @fecommunity/reactpress-web start --port 3000
 *   npx @fecommunity/reactpress-web path
 */

import {
  createAdminStaticMiddleware,
  resolveDistDir,
  serveAdmin,
  syncAdminDistToPublic,
} from "../node/index.mjs";

const args = process.argv.slice(2);

function readFlag(name, fallback) {
  const idx = args.indexOf(name);
  if (idx === -1) return fallback;
  const value = args[idx + 1];
  if (value == null || value.startsWith("-")) return fallback;
  return value;
}

function hasFlag(name) {
  return args.includes(name);
}

function printHelp() {
  console.log(`
ReactPress Admin — prebuilt management console (Vite SPA)

Usage:
  reactpress-web [command] [options]

Commands:
  start, serve     Start static server (default)
  path             Print absolute dist directory (for nginx/docker volumes)
  sync-public      Copy dist into a Next.js public/ folder (Vercel / static hosting)
  middleware       Print Node import example

Options:
  --port <n>       Listen port (default: 3000 or WEB_ADMIN_PORT)
  --host <host>    Bind host (default: 0.0.0.0)
  --base <path>    Public base path (default: /admin/)
  --dist <path>    Override dist directory
  --help, -h       Show help

Examples:
  npx @fecommunity/reactpress-web
  npx @fecommunity/reactpress-web start --port 3000 --base /admin/
  npx @fecommunity/reactpress-web path
  npx @fecommunity/reactpress-web sync-public ./public/admin

Programmatic:
  import { resolveDistDir, createAdminStaticMiddleware, serveAdmin } from '@fecommunity/reactpress-web';
`);
}

if (hasFlag("--help") || hasFlag("-h")) {
  printHelp();
  process.exit(0);
}

const command = args.find((arg) => !arg.startsWith("-")) ?? "start";
const distDir = readFlag("--dist", undefined);
const basePath = readFlag("--base", "/admin/");
const host = readFlag("--host", "0.0.0.0");
const port = Number(readFlag("--port", process.env.WEB_ADMIN_PORT ?? "3000"));

const staticOptions = { distDir, basePath };

if (command === "path") {
  console.log(resolveDistDir(staticOptions));
  process.exit(0);
}

if (command === "middleware") {
  console.log(`import { createAdminStaticMiddleware, resolveDistDir } from '@fecommunity/reactpress-web';

// Express / Connect
app.use(createAdminStaticMiddleware({ basePath: '${basePath}' }));

// nginx volume mount:
// ${resolveDistDir(staticOptions)}:/usr/share/reactpress-admin:ro
`);
  process.exit(0);
}

if (command === "sync-public") {
  const publicDir = args.find((arg, index) => index > 0 && !arg.startsWith("-") && arg !== command);
  if (!publicDir) {
    console.error("Usage: reactpress-web sync-public <publicDir>");
    console.error("Example: reactpress-web sync-public ./public/admin");
    process.exit(1);
  }
  const target = syncAdminDistToPublic(publicDir, staticOptions);
  console.log(`[ReactPress Admin] Synced ${resolveDistDir(staticOptions)} → ${target}`);
  process.exit(0);
}

if (command === "start" || command === "serve") {
  serveAdmin({ ...staticOptions, host, port });
  process.exitCode = 0;
} else {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}
