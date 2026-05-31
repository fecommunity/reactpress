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

/** Poll visitor / preview dev until reachable (theme restart / compile). */
export async function waitForVisitorSite(
  siteUrl: string,
  options?: { minWaitMs?: number; maxWaitMs?: number; intervalMs?: number },
): Promise<boolean> {
  const minWaitMs = options?.minWaitMs ?? 300;
  const maxWaitMs = options?.maxWaitMs ?? 120_000;
  const intervalMs = options?.intervalMs ?? 350;
  const started = Date.now();
  const crossOrigin = isCrossOriginSiteUrl(siteUrl);

  await sleep(minWaitMs);

  while (Date.now() - started < maxWaitMs) {
    try {
      if (crossOrigin) {
        // Preview dev on :3003+ has no CORS headers — opaque probe avoids console noise.
        await fetch(siteUrl, {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
        });
        return true;
      }

      const res = await fetch(siteUrl, {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      if (res.ok) return true;
    } catch {
      /* theme dev still starting */
    }
    await sleep(intervalMs);
  }

  return false;
}
