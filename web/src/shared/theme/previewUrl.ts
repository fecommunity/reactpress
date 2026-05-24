/**
 * Resolve the visitor site URL for live theme preview in admin.
 * When admin runs under nginx unified entry (e.g. /admin/ on same host), preview `/`.
 * Non-active themes use a separate preview dev port (default :3003) so the public site stays unchanged.
 */
export function resolveLiveSitePreviewUrl(
  fallbackSiteUrl?: string,
  options?: {
    themeId?: string;
    activeThemeId?: string;
    /** From `beginThemePreviewSession` when preview theme ≠ active theme. */
    previewSiteUrl?: string;
    previewSessionReady?: boolean;
  },
): string | null {
  if (typeof window === "undefined") return null;

  const adminBase = import.meta.env.BASE_URL || "/";
  const normalizedAdminBase = adminBase.endsWith("/") ? adminBase : `${adminBase}/`;
  const pathname = window.location.pathname;

  let publicOrigin: string | null = null;

  if (normalizedAdminBase !== "/" && pathname.startsWith(normalizedAdminBase)) {
    publicOrigin = `${window.location.origin}/`;
  } else {
    const siteUrl = fallbackSiteUrl?.trim();
    if (!siteUrl) return null;
    try {
      const site = new URL(siteUrl, window.location.origin);
      if (site.origin !== window.location.origin) return null;
      publicOrigin = `${site.origin}/`;
    } catch {
      return null;
    }
  }

  const themeId = options?.themeId;
  const activeThemeId = options?.activeThemeId;

  if (themeId && activeThemeId && themeId !== activeThemeId) {
    if (options?.previewSessionReady !== true) return null;
    return options.previewSiteUrl ?? null;
  }

  return publicOrigin;
}

/** Live iframe preview is available for the current theme. */
export function canUseLiveSitePreview(
  themeId: string,
  activeThemeId: string,
  siteUrl?: string,
  options?: { previewSessionReady?: boolean; previewSiteUrl?: string },
): boolean {
  return Boolean(
    resolveLiveSitePreviewUrl(siteUrl, {
      themeId,
      activeThemeId,
      previewSiteUrl: options?.previewSiteUrl,
      previewSessionReady: options?.previewSessionReady,
    }),
  );
}
