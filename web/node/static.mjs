import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Production default — matches `web/.env.production` (`VITE_ADMIN_BASE=/admin/`). */
export const DEFAULT_ADMIN_BASE = "/admin/";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
};

export function resolveDistDir(options = {}) {
  if (options.distDir) {
    return path.resolve(options.distDir);
  }
  return path.resolve(__dirname, "..", "dist");
}

export function normalizeAdminBase(basePath = DEFAULT_ADMIN_BASE) {
  const trimmed = String(basePath || DEFAULT_ADMIN_BASE).trim() || DEFAULT_ADMIN_BASE;
  if (trimmed === "/") return "/";
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/** URL path segment for `public/` sync (e.g. `/admin/` → `admin`). */
export function adminPublicSegment(basePath = DEFAULT_ADMIN_BASE) {
  const normalized = normalizeAdminBase(basePath);
  if (normalized === "/") return "";
  return normalized.replace(/^\/+|\/+$/g, "");
}

/**
 * Copy the built Admin SPA into a directory served at `/admin/` on the same origin.
 * Example: `syncAdminDistToPublic("./public/admin")` → `/admin/index.html`, `/admin/assets/…`
 */
export function syncAdminDistToPublic(targetDir, options = {}) {
  const distDir = resolveDistDir(options);
  const indexPath = path.join(distDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Admin dist not found at ${distDir}. Build @fecommunity/reactpress-web first or install a published package with dist/.`,
    );
  }

  const resolvedTarget = path.resolve(targetDir);
  fs.rmSync(resolvedTarget, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(resolvedTarget), { recursive: true });
  fs.cpSync(distDir, resolvedTarget, { recursive: true });

  return resolvedTarget;
}

function contentTypeFor(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function isPathInsideRoot(rootDir, candidatePath) {
  const relative = path.relative(rootDir, candidatePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function readDistFile(distDir, relativePath) {
  const normalized = relativePath.replace(/^\/+/, "");
  const fullPath = path.resolve(distDir, normalized);
  if (!isPathInsideRoot(distDir, fullPath)) {
    return null;
  }
  try {
    const stat = await fsp.stat(fullPath);
    if (!stat.isFile()) return null;
    const body = await fsp.readFile(fullPath);
    return { fullPath, body };
  } catch {
    return null;
  }
}

/**
 * Connect/Express-compatible middleware for serving the built Admin SPA.
 * Falls back to `index.html` for client-side routes under the admin base path.
 */
export function createAdminStaticMiddleware(options = {}) {
  const distDir = resolveDistDir(options);
  const basePath = normalizeAdminBase(options.basePath);
  const baseNoSlash = basePath === "/" ? "" : basePath.replace(/\/$/, "");

  return async function adminStaticMiddleware(req, res, next) {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = url.pathname;

    if (baseNoSlash && pathname === baseNoSlash) {
      res.statusCode = 301;
      res.setHeader("Location", basePath);
      res.end();
      return;
    }

    if (basePath !== "/" && !pathname.startsWith(basePath)) {
      if (typeof next === "function") {
        next();
        return;
      }
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }

    const relativePath =
      basePath === "/"
        ? pathname.replace(/^\/+/, "") || "index.html"
        : pathname.slice(basePath.length) || "index.html";

    const asset = await readDistFile(distDir, relativePath);
    if (asset) {
      res.statusCode = 200;
      res.setHeader("Content-Type", contentTypeFor(asset.fullPath));
      res.setHeader(
        "Cache-Control",
        relativePath === "index.html" ? "no-cache" : "public, max-age=31536000, immutable",
      );
      res.end(asset.body);
      return;
    }

    const spa = await readDistFile(distDir, "index.html");
    if (!spa) {
      res.statusCode = 500;
      res.end(
        "Admin build not found. Run `pnpm --dir web build` or install a published package with dist/.",
      );
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.end(spa.body);
  };
}

/** Low-level Node HTTP handler (no framework required). */
export function createAdminStaticHandler(options = {}) {
  const middleware = createAdminStaticMiddleware(options);
  return (req, res) => {
    middleware(req, res);
  };
}

/** Start a standalone static server for the Admin SPA. Returns the HTTP server instance. */
export function serveAdmin(options = {}) {
  const distDir = resolveDistDir(options);
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error(
      `Admin dist not found at ${distDir}. Build the package first or pass { distDir } to serveAdmin().`,
    );
  }

  const host = options.host ?? "0.0.0.0";
  const port = Number(options.port ?? process.env.WEB_ADMIN_PORT ?? 3000);
  const basePath = normalizeAdminBase(options.basePath);
  const handler = createAdminStaticHandler({ distDir, basePath });

  const server = http.createServer((req, res) => {
    handler(req, res);
  });

  server.listen(port, host, () => {
    const entry =
      basePath === "/" ? `http://localhost:${port}/` : `http://localhost:${port}${basePath}`;
    if (options.silent !== true) {
      console.log(`[ReactPress Admin] Serving ${distDir}`);
      console.log(`[ReactPress Admin] ${entry}`);
    }
  });

  return server;
}
