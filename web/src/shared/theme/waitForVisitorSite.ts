function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCrossOriginSiteUrl(siteUrl: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const target = new URL(siteUrl, window.location.href);
    return target.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/** Cross-origin preview (:3003) — opaque fetch succeeds on any HTTP response. */
async function probeCrossOriginPreview(siteUrl: string): Promise<boolean> {
  try {
    await fetch(siteUrl, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
    });
    return true;
  } catch {
    return false;
  }
}

/** Poll visitor / preview dev until reachable (theme restart / compile). */
export async function waitForVisitorSite(
  siteUrl: string,
  options?: {
    minWaitMs?: number;
    maxWaitMs?: number;
    intervalMs?: number;
    onPoll?: (attempt: number, elapsedMs: number) => void;
  },
): Promise<boolean> {
  const minWaitMs = options?.minWaitMs ?? 300;
  const maxWaitMs = options?.maxWaitMs ?? 120_000;
  const intervalMs = options?.intervalMs ?? 350;
  const started = Date.now();
  const crossOrigin = isCrossOriginSiteUrl(siteUrl);
  let attempt = 0;
  let crossOriginHits = 0;
  let localThemePreview = false;
  try {
    const parsed = new URL(
      siteUrl,
      typeof window !== "undefined" ? window.location.href : undefined,
    );
    localThemePreview =
      crossOrigin &&
      /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname) &&
      /^(3001|3003)$/.test(parsed.port);
  } catch {
    localThemePreview = false;
  }

  await sleep(minWaitMs);

  while (Date.now() - started < maxWaitMs) {
    attempt += 1;
    options?.onPoll?.(attempt, Date.now() - started);

    try {
      if (crossOrigin) {
        const hit = await probeCrossOriginPreview(siteUrl);
        if (hit) {
          crossOriginHits += 1;
          const requiredHits = localThemePreview ? 1 : 2;
          if (crossOriginHits >= requiredHits) return true;
        } else {
          crossOriginHits = 0;
        }
      } else {
        const res = await fetch(siteUrl, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        if (res.ok) return true;
      }
    } catch {
      crossOriginHits = 0;
      /* theme dev still starting */
    }
    await sleep(intervalMs);
  }

  return false;
}
