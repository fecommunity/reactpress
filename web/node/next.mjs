import { createAdminStaticHandler, normalizeAdminBase } from "./static.mjs";
export {
  createAdminRewrites,
  createAdminVercelRedirects,
  createAdminVercelRewrites,
} from "./admin-route-helpers.cjs";

function adminRoutePrefix(basePath = normalizeAdminBase()) {
  const normalized = normalizeAdminBase(basePath);
  if (normalized === "/") return "";
  return normalized.replace(/\/$/, "");
}

/** Whether the incoming Node HTTP request targets the Admin SPA base path. */
export function isAdminRequest(req, options = {}) {
  const basePath = normalizeAdminBase(options.basePath);
  const baseNoSlash = basePath === "/" ? "" : basePath.replace(/\/$/, "");
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  if (!baseNoSlash) return true;
  return pathname === baseNoSlash || pathname.startsWith(basePath);
}

/**
 * Compose Next.js (or any) request handler with Admin static serving on `/admin/`.
 * Use in a custom Node server so visitor site and admin share one origin.
 */
export function createCombinedRequestHandler(fallbackHandler, adminOptions = {}) {
  const adminHandler = createAdminStaticHandler(adminOptions);
  return (req, res) => {
    if (isAdminRequest(req, adminOptions)) {
      adminHandler(req, res);
      return;
    }
    fallbackHandler(req, res);
  };
}
