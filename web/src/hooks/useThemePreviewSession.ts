import { useEffect, useState } from "react";
import { beginThemePreviewSession, endThemePreviewSession } from "@/shared/api/themes";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";
import { waitForVisitorSite } from "@/shared/theme/waitForVisitorSite";

export type ThemePreviewSessionStatus = "idle" | "switching" | "ready";

/** Debounce ending preview so React Strict Mode remount does not delete preview-theme.json twice. */
const PREVIEW_SESSION_END_MS = 450;

let previewSessionRefCount = 0;
let previewSessionEndTimer: ReturnType<typeof setTimeout> | null = null;

function retainPreviewSession(): void {
  if (previewSessionEndTimer) {
    clearTimeout(previewSessionEndTimer);
    previewSessionEndTimer = null;
  }
  previewSessionRefCount += 1;
}

function releasePreviewSession(): void {
  previewSessionRefCount = Math.max(0, previewSessionRefCount - 1);
  if (previewSessionRefCount > 0) return;
  if (previewSessionEndTimer) clearTimeout(previewSessionEndTimer);
  previewSessionEndTimer = setTimeout(() => {
    previewSessionEndTimer = null;
    if (previewSessionRefCount === 0) {
      void endThemePreviewSession().catch(() => {
        /* ignore cleanup errors */
      });
    }
  }, PREVIEW_SESSION_END_MS);
}

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

    retainPreviewSession();

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
      releasePreviewSession();
    };
  }, [themeId, siteUrl, activeThemeId]);

  return {
    ready: status === "ready",
    switching: status === "switching",
    previewSiteUrl,
  };
}
