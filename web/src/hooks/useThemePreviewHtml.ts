import type { ThemeMods } from "@fecommunity/reactpress-toolkit/extension";
import { useEffect, useState } from "react";

import { buildThemePreviewUrl } from "@/shared/api/themes";

/** Fetch theme preview HTML (works with MSW and same-origin API). */
export function useThemePreviewHtml(themeId: string | undefined, mods: ThemeMods) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modsKey = JSON.stringify(mods);

  useEffect(() => {
    if (!themeId) {
      setHtml("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const parsedMods = JSON.parse(modsKey) as ThemeMods;
        const url = await buildThemePreviewUrl(themeId, parsedMods);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Preview failed: ${res.status}`);
        }
        const text = await res.text();
        if (!cancelled) setHtml(text);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Preview failed");
          setHtml("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [themeId, modsKey]);

  return { html, loading, error };
}
