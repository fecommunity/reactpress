/**
 * Resolve the visitor site URL for live theme preview in admin.
 * When admin runs under nginx unified entry (e.g. /admin/ on same host), preview `/`.
 */
export function resolveLiveSitePreviewUrl(fallbackSiteUrl?: string): string | null {
  if (typeof window === "undefined") return null;

  const adminBase = import.meta.env.BASE_URL || "/";
  const normalizedAdminBase = adminBase.endsWith("/") ? adminBase : `${adminBase}/`;
  const pathname = window.location.pathname;

  if (normalizedAdminBase !== "/" && pathname.startsWith(normalizedAdminBase)) {
    return `${window.location.origin}/`;
  }

  const siteUrl = fallbackSiteUrl?.trim();
  if (!siteUrl) return null;

  try {
    const site = new URL(siteUrl, window.location.origin);
    return `${site.origin}/`;
  } catch {
    return null;
  }
}

/** Same-origin live preview is available (nginx unified entry or matching site URL). */
export function canUseLiveSitePreview(
  themeId: string,
  activeThemeId: string,
  siteUrl?: string,
): boolean {
  if (themeId !== activeThemeId) return false;
  return resolveLiveSitePreviewUrl(siteUrl) !== null;
}
