function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Poll same-origin visitor site until HTTP 200 (theme dev restart / compile). */
export async function waitForVisitorSite(
  siteUrl: string,
  options?: { minWaitMs?: number; maxWaitMs?: number; intervalMs?: number },
): Promise<boolean> {
  const minWaitMs = options?.minWaitMs ?? 1200;
  const maxWaitMs = options?.maxWaitMs ?? 120_000;
  const intervalMs = options?.intervalMs ?? 1200;
  const started = Date.now();

  await sleep(minWaitMs);

  while (Date.now() - started < maxWaitMs) {
    try {
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
