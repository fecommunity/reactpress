/** Query key for draft theme configuration in live preview (`?reactpress_preview_config=…`). */
export const PREVIEW_CONFIG_QUERY_KEY = 'reactpress_preview_config';

export function parsePreviewConfigParam(raw: string | null | undefined): Record<string, unknown> {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.trim())) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function parsePreviewConfigFromRequestUrl(url: string | undefined): Record<string, unknown> {
  if (!url?.trim()) return {};
  try {
    const parsed = new URL(url, 'http://reactpress.local');
    return parsePreviewConfigParam(parsed.searchParams.get(PREVIEW_CONFIG_QUERY_KEY));
  } catch {
    return {};
  }
}

export function appendPreviewConfigToUrl(
  baseUrl: string,
  configuration: Record<string, unknown>,
): string {
  if (!configuration || Object.keys(configuration).length === 0) return baseUrl;

  try {
    const url = baseUrl.includes('://')
      ? new URL(baseUrl)
      : new URL(baseUrl, 'http://localhost');
    url.searchParams.set(PREVIEW_CONFIG_QUERY_KEY, JSON.stringify(configuration));
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/** Next.js Pages `ctx.query` / `asPath` / `req.url`. */
export function parsePreviewConfigFromNextCtx(ctx: {
  query?: Record<string, string | string[] | undefined>;
  asPath?: string;
  req?: { url?: string };
}): Record<string, unknown> {
  const raw = ctx.query?.[PREVIEW_CONFIG_QUERY_KEY];
  if (typeof raw === 'string') return parsePreviewConfigParam(raw);
  if (Array.isArray(raw) && typeof raw[0] === 'string') return parsePreviewConfigParam(raw[0]);

  const asPath = typeof ctx.asPath === 'string' ? ctx.asPath : '';
  if (asPath.includes('?')) {
    return parsePreviewConfigFromRequestUrl(
      `http://reactpress.local${asPath.startsWith('/') ? asPath : `/${asPath}`}`,
    );
  }

  const reqUrl = ctx.req?.url;
  if (reqUrl && String(reqUrl).includes('?')) {
    const path = String(reqUrl).startsWith('/') ? reqUrl : `/${reqUrl}`;
    return parsePreviewConfigFromRequestUrl(`http://reactpress.local${path}`);
  }

  return {};
}
