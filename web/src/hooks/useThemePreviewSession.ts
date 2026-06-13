import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { beginThemePreviewSession, endThemePreviewSession } from "@/shared/api/themes";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";
import { waitForVisitorSite } from "@/shared/theme/waitForVisitorSite";

export type ThemePreviewSessionStatus = "idle" | "switching" | "ready";

/** Debounce ending preview so React Strict Mode remount does not delete preview-theme.json twice. */
const PREVIEW_SESSION_END_MS = 400;

/** First preview build can take several minutes (npm deps + next build). */
const PREVIEW_READY_MAX_MS = 180_000;
const PREVIEW_READY_POLL_MS = 200;
const PREVIEW_READY_MIN_MS = 100;

let previewSessionRefCount = 0;
let previewSessionEndTimer: ReturnType<typeof setTimeout> | null = null;
/** Monotonic id — stale begin/end pairs are ignored after rapid theme switches. */
let previewSessionGeneration = 0;

function retainPreviewSession(): void {
  if (previewSessionEndTimer) {
    clearTimeout(previewSessionEndTimer);
    previewSessionEndTimer = null;
  }
  previewSessionRefCount += 1;
}

function releasePreviewSession(generation: number): void {
  previewSessionRefCount = Math.max(0, previewSessionRefCount - 1);
  if (previewSessionRefCount > 0) return;
  if (previewSessionEndTimer) clearTimeout(previewSessionEndTimer);
  previewSessionEndTimer = setTimeout(() => {
    previewSessionEndTimer = null;
    if (previewSessionRefCount === 0 && previewSessionGeneration === generation) {
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

    const generation = ++previewSessionGeneration;
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
        if (cancelled || generation !== previewSessionGeneration) return;

        sessionPreviewUrl = result.previewSiteUrl;
        if (typeof result.activeTheme === "string" && result.activeTheme) {
          sessionActiveTheme = result.activeTheme;
        }
        setPreviewSiteUrl(sessionPreviewUrl);
        setResolvedActiveThemeId(sessionActiveTheme);
        void queryClient.invalidateQueries({ queryKey: ["themes"] });
        void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      } catch {
        if (cancelled || generation !== previewSessionGeneration) return;
        /* still try live preview / stub fallback */
      }

      if (cancelled || generation !== previewSessionGeneration) return;

      const effectiveActiveThemeId = sessionActiveTheme;

      const liveUrl = resolveLiveSitePreviewUrl(siteUrlRef.current, {
        themeId,
        activeThemeId: effectiveActiveThemeId,
        previewSiteUrl: sessionPreviewUrl,
        previewSessionReady: true,
      });

      if (!liveUrl) {
        setStatus("ready");
        return;
      }

      if (!sessionPreviewUrl) {
        setStatus("ready");
        return;
      }

      const ready = await waitForVisitorSite(liveUrl, {
        minWaitMs: PREVIEW_READY_MIN_MS,
        maxWaitMs: PREVIEW_READY_MAX_MS,
        intervalMs: PREVIEW_READY_POLL_MS,
      });
      if (!cancelled && generation === previewSessionGeneration) {
        setStatus(ready ? "ready" : "switching");
      }
    })();

    return () => {
      cancelled = true;
      setStatus("idle");
      setPreviewSiteUrl(undefined);
      setResolvedActiveThemeId(undefined);
      releasePreviewSession(generation);
    };
  }, [enabled, themeId, queryClient]);

  return {
    ready: status === "ready",
    switching: status === "switching",
    previewSiteUrl,
    activeThemeId: resolvedActiveThemeId ?? activeThemeId,
  };
}
