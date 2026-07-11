"use strict";

/** Production default — matches `web/.env.production` (`VITE_ADMIN_BASE=/admin/`). */
const DEFAULT_ADMIN_BASE = "/admin/";

function normalizeAdminBase(basePath = DEFAULT_ADMIN_BASE) {
  const trimmed = String(basePath || DEFAULT_ADMIN_BASE).trim() || DEFAULT_ADMIN_BASE;
  if (trimmed === "/") return "/";
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

function adminRoutePrefix(basePath) {
  const normalized = normalizeAdminBase(basePath);
  if (normalized === "/") return "";
  return normalized.replace(/\/$/, "");
}

/** Next.js `rewrites()` rules that proxy `/admin` to a separate Admin static server. */
function createAdminRewrites(options = {}) {
  const adminOrigin = String(
    options.adminOrigin ??
      process.env.REACTPRESS_ADMIN_ORIGIN ??
      process.env.WEB_ADMIN_ORIGIN ??
      "http://localhost:3000",
  ).replace(/\/$/, "");
  const basePath = normalizeAdminBase(options.basePath);
  const baseNoSlash = basePath.replace(/\/$/, "");

  return [
    { source: baseNoSlash, destination: `${adminOrigin}${basePath}` },
    { source: `${baseNoSlash}/:path*`, destination: `${adminOrigin}${basePath}:path*` },
  ];
}

/** Next.js `redirects()` — canonical trailing slash (`/admin` → `/admin/`). */
function createAdminVercelRedirects(options = {}) {
  const prefix = adminRoutePrefix(options.basePath);
  if (!prefix) return [];
  return [{ source: prefix, destination: `${prefix}/`, permanent: true }];
}

/**
 * Next.js `rewrites()` for Admin SPA on Vercel / `next start`.
 * Pair with `syncAdminDistToPublic("./public/admin")`.
 */
function createAdminVercelRewrites(options = {}) {
  const prefix = adminRoutePrefix(options.basePath);
  if (!prefix) {
    return {
      afterFiles: [{ source: "/:path*", destination: "/index.html" }],
    };
  }
  return {
    afterFiles: [
      { source: prefix, destination: `${prefix}/index.html` },
      { source: `${prefix}/:path*`, destination: `${prefix}/index.html` },
    ],
  };
}

module.exports = {
  DEFAULT_ADMIN_BASE,
  normalizeAdminBase,
  createAdminRewrites,
  createAdminVercelRedirects,
  createAdminVercelRewrites,
};
