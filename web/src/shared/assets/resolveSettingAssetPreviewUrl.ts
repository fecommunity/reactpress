import { resolvePublicAssetUrl } from "@fecommunity/reactpress-toolkit/theme";

import { publicAssetUrl } from "@/utils/constants";

/** Shipped under web/public and admin-dist at the same basename (not API /public). */
const ADMIN_BUNDLED_ROOT_ASSETS = new Set([
  "/favicon.png",
  "/favicon.ico",
  "/favicon-16.png",
  "/favicon-32.png",
  "/favicon-48.png",
  "/logo.png",
  "/logo.svg",
  "/logo-200.png",
  "/logo-400.png",
  "/apple-touch-icon.png",
  "/icon-192.png",
  "/icon-512.png",
]);

/**
 * Resolve setting/media URLs for admin UI previews.
 * Bundled defaults (/favicon.png) live under Vite `base` (/admin/); uploads use theme/API resolution.
 */
export function resolveSettingAssetPreviewUrl(url: string | undefined | null): string {
  const trimmed = (url ?? "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("//")) {
    const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
    return `${protocol}${trimmed}`;
  }
  if (trimmed.startsWith("/") && ADMIN_BUNDLED_ROOT_ASSETS.has(trimmed)) {
    return publicAssetUrl(trimmed);
  }
  return resolvePublicAssetUrl(trimmed);
}
