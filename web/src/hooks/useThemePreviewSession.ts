import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { beginThemePreviewSession, endThemePreviewSession } from "@/shared/api/themes";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";
import { waitForVisitorSite } from "@/shared/theme/waitForVisitorSite";

export type ThemePreviewSessionStatus = "idle" | "switching" | "ready";

/** Debounce ending preview so React Strict Mode remount does not delete preview-theme.json twice. */
const PREVIEW_SESSION_END_MS = 300;

/** First preview build can take several minutes (npm deps + next build). */
const PREVIEW_READY_MAX_MS = 180_000;
const PREVIEW_READY_POLL_MS = 200;
const PREVIEW_READY_MIN_MS = 100;

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
 * Sync local preview dev (`preview-theme.json` on :3003+) while admin preview is open.
 * Does not change the public visitor site (`active-theme.json` / :3001).
 */
export function useThemePreviewSession(
  themeId: string | undefined,
  siteUrl?: string,
  activeThemeId?: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled !== false;
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ThemePreviewSessionStatus>("idle");
  const [previewSiteUrl, setPreviewSiteUrl] = useState<string | undefined>();
  const [resolvedActiveThemeId, setResolvedActiveThemeId] = useState<string | undefined>();
  const siteUrlRef = useRef(siteUrl);
  const activeThemeIdRef = useRef(activeThemeId);
  siteUrlRef.current = siteUrl;
  activeThemeIdRef.current = activeThemeId;

  useEffect(() => {
    if (!enabled || !themeId) {
      setStatus("idle");
      setPreviewSiteUrl(undefined);
      setResolvedActiveThemeId(undefined);
      return;
    }

    retainPreviewSession();

    let cancelled = false;
    setStatus("switching");
    setPreviewSiteUrl(undefined);
    setResolvedActiveThemeId(undefined);

    void (async () => {
      let sessionPreviewUrl: string | undefined;
      let sessionActiveTheme = activeThemeIdRef.current ?? themeId;

      try {
        const result = await beginThemePreviewSession(themeId);
        sessionPreviewUrl = result.previewSiteUrl;
        if (typeof result.activeTheme === "string" && result.activeTheme) {
          sessionActiveTheme = result.activeTheme;
        }
        if (!cancelled) {
          setPreviewSiteUrl(sessionPreviewUrl);
          setResolvedActiveThemeId(sessionActiveTheme);
          void queryClient.invalidateQueries({ queryKey: ["themes"] });
          void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
        }
      } catch {
        /* still try live preview / stub fallback */
      }

      if (cancelled) return;

      const effectiveActiveThemeId = sessionActiveTheme;

      const liveUrl = resolveLiveSitePreviewUrl(siteUrlRef.current, {
        themeId,
        activeThemeId: effectiveActiveThemeId,
        previewSiteUrl: sessionPreviewUrl,
        previewSessionReady: true,
      });

      if (!liveUrl) {
        if (!cancelled) setStatus("ready");
        return;
      }

      // Active theme uses public origin; non-active themes boot on previewSiteUrl.
      if (!sessionPreviewUrl) {
        if (!cancelled) setStatus("ready");
        return;
      }

      const ready = await waitForVisitorSite(liveUrl, {
        minWaitMs: PREVIEW_READY_MIN_MS,
        maxWaitMs: PREVIEW_READY_MAX_MS,
        intervalMs: PREVIEW_READY_POLL_MS,
      });
      if (!cancelled) setStatus(ready ? "ready" : "switching");
    })();

    return () => {
      cancelled = true;
      setStatus("idle");
      setPreviewSiteUrl(undefined);
      setResolvedActiveThemeId(undefined);
      releasePreviewSession();
    };
  }, [enabled, themeId, queryClient]);

  return {
    ready: status === "ready",
    switching: status === "switching",
    previewSiteUrl,
    activeThemeId: resolvedActiveThemeId ?? activeThemeId,
  };
}
