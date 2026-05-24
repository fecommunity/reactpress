import { useEffect, useState } from "react";
import { beginThemePreviewSession, endThemePreviewSession } from "@/shared/api/themes";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";
import { waitForVisitorSite } from "@/shared/theme/waitForVisitorSite";

export type ThemePreviewSessionStatus = "idle" | "switching" | "ready";

/**
 * Sync local preview dev (`preview-theme.json` on :3003) while admin preview is open.
 * Does not change the public visitor site (`active-theme.json` / :3001).
 */
export function useThemePreviewSession(
  themeId: string | undefined,
  siteUrl?: string,
  activeThemeId?: string,
) {
  const [status, setStatus] = useState<ThemePreviewSessionStatus>("idle");
  const [previewSiteUrl, setPreviewSiteUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!themeId) {
      setStatus("idle");
      setPreviewSiteUrl(undefined);
      return;
    }

    let cancelled = false;
    setStatus("switching");
    setPreviewSiteUrl(undefined);

    void (async () => {
      let sessionPreviewUrl: string | undefined;
      try {
        const result = await beginThemePreviewSession(themeId);
        sessionPreviewUrl = result.previewSiteUrl;
        if (!cancelled) setPreviewSiteUrl(sessionPreviewUrl);
      } catch {
        /* still try live preview / stub fallback */
      }

      if (cancelled) return;

      const liveUrl = resolveLiveSitePreviewUrl(siteUrl, {
        themeId,
        activeThemeId: activeThemeId ?? themeId,
        previewSiteUrl: sessionPreviewUrl,
        previewSessionReady: true,
      });

      if (!liveUrl) {
        if (!cancelled) setStatus("ready");
        return;
      }

      await waitForVisitorSite(liveUrl);
      if (!cancelled) setStatus("ready");
    })();

    return () => {
      cancelled = true;
      setStatus("idle");
      setPreviewSiteUrl(undefined);
      void endThemePreviewSession().catch(() => {
        /* ignore cleanup errors */
      });
    };
  }, [themeId, siteUrl, activeThemeId]);

  return {
    ready: status === "ready",
    switching: status === "switching",
    previewSiteUrl,
  };
}
