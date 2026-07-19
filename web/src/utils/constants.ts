/**
 * Server API root including global prefix (`/api`).
 * Endpoint constants under `src/api/*` must NOT repeat `/api` in the path.
 *
 * - Dev: `/api` → Vite proxy (`VITE_DEV_API_PROXY_TARGET`)
 * - Production static Admin (nginx / theme `/admin/` + same-origin `/api`): `/api`
 * - Override with `VITE_API_BASE_URL` when the API is on another absolute origin
 */
function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Same-origin `/api` for both dev and published Admin SPA (Next rewrite / nginx).
  return "/api";
}

export const API_BASE_URL = resolveApiBaseUrl();

/** `mock` = MSW scaffold (admin/admin); `server` = Nest JWT (`name` + `password`) */
export const AUTH_MODE = import.meta.env.VITE_AUTH_MODE ?? "mock";

/**
 * Resolve a `public/` file path against Vite `base` (e.g. `/admin/` behind nginx).
 * Use for `<img src>`, favicon, MSW assets — not for API routes.
 */
export function publicAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const segment = path.replace(/^\//, "");
  return `${base}${segment}`;
}

/** Favicon path under `public/` (browser tab icon). */
export const APP_FAVICON_SRC = publicAssetUrl("/favicon.ico");

/** Vector favicon fallback (`public/logo.svg`). */
export const APP_FAVICON_SVG_SRC = publicAssetUrl("/logo.svg");

/** Brand logo for login and in-app branding (`public/logo.svg`). */
export const APP_LOGO_SRC = publicAssetUrl("/logo.svg");

/** Product / brand name (login header, sidebar logo text, etc.). */
export const APP_BRAND_NAME = "ReactPress";

/** Official ReactPress monorepo on GitHub. */
export const REACTPRESS_GITHUB_URL = "https://github.com/fecommunity/reactpress";

/** Public docs site (Docusaurus). Override with `VITE_REACTPRESS_DOCS_URL`. */
export const REACTPRESS_DOCS_BASE_URL =
  import.meta.env.VITE_REACTPRESS_DOCS_URL?.trim().replace(/\/$/, "") ||
  "https://reactpress.surge.sh";

/** Live demo site (public blog). */
export const REACTPRESS_DEMO_URL = "https://blog.gaoredu.com";

export function reactpressDocsPath(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const prefix = locale === "zh" ? "/zh" : "";
  return `${REACTPRESS_DOCS_BASE_URL}${prefix}${normalized}`;
}
