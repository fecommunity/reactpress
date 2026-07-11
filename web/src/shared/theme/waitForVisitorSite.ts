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

function parseLocalSiteUrl(siteUrl: string): URL | null {
  try {
    return new URL(siteUrl, typeof window !== "undefined" ? window.location.href : undefined);
  } catch {
    return null;
  }
}

function isLocalHostSite(parsed: URL): boolean {
  return /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname);
}

/** :3003 preview proxy — injects CORS headers and returns 503 until a backend is wired. */
function isPreviewProxyPort(siteUrl: string): boolean {
  const parsed = parseLocalSiteUrl(siteUrl);
  return Boolean(parsed && isLocalHostSite(parsed) && parsed.port === "3003");
}

/** :3001 visitor site — no CORS headers; opaque fetch is the reliable readiness probe. */
function isDirectVisitorPort(siteUrl: string): boolean {
  const parsed = parseLocalSiteUrl(siteUrl);
  return Boolean(parsed && isLocalHostSite(parsed) && parsed.port === "3001");
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

/** Preview proxy on :3003 — CORS distinguishes 503/502 from a live backend. */
async function probePreviewProxy(siteUrl: string): Promise<boolean> {
  try {
    const res = await fetch(siteUrl, {
      method: "GET",
      cache: "no-store",
      mode: "cors",
    });
    return res.ok;
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
  const previewProxy = crossOrigin && isPreviewProxyPort(siteUrl);
  const directVisitor = crossOrigin && isDirectVisitorPort(siteUrl);
  let attempt = 0;
  let crossOriginHits = 0;

  await sleep(minWaitMs);

  while (Date.now() - started < maxWaitMs) {
    attempt += 1;
    options?.onPoll?.(attempt, Date.now() - started);

    try {
      if (previewProxy) {
        if (await probePreviewProxy(siteUrl)) return true;
      } else if (directVisitor || crossOrigin) {
        const hit = await probeCrossOriginPreview(siteUrl);
        if (hit) {
          crossOriginHits += 1;
          const requiredHits = directVisitor ? 1 : 2;
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
