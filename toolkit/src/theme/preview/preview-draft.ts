import type { ThemeMods } from '../extension/theme';

/** Short-lived preview payload id (avoids 414 from huge query strings). */
export const PREVIEW_TOKEN_QUERY_KEY = 'reactpress_preview_token';

export type PreviewDraftPayload = {
  /** Theme whose `configuration` / mods apply (defaults to active theme when omitted). */
  themeId?: string;
  mods?: ThemeMods;
  configuration?: Record<string, unknown>;
};

export function appendPreviewTokenToUrl(baseUrl: string, token: string): string {
  if (!token.trim()) return baseUrl;
  try {
    const url = baseUrl.includes('://')
      ? new URL(baseUrl)
      : new URL(baseUrl, 'http://localhost');
    url.searchParams.set(PREVIEW_TOKEN_QUERY_KEY, token);
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function parsePreviewTokenFromRequestUrl(url: string | undefined): string {
  if (!url?.trim()) return '';
  try {
    const parsed = new URL(url, 'http://reactpress.local');
    return parsed.searchParams.get(PREVIEW_TOKEN_QUERY_KEY)?.trim() ?? '';
  } catch {
    return '';
  }
}

/** Next.js Pages `ctx.query` / `asPath` / `req.url`. */
export function parsePreviewTokenFromNextCtx(ctx: {
  query?: Record<string, string | string[] | undefined>;
  asPath?: string;
  req?: { url?: string };
}): string {
  const raw = ctx.query?.[PREVIEW_TOKEN_QUERY_KEY];
  if (typeof raw === 'string') return raw.trim();
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0].trim();

  const asPath = typeof ctx.asPath === 'string' ? ctx.asPath : '';
  if (asPath.includes('?')) {
    return parsePreviewTokenFromRequestUrl(
      `http://reactpress.local${asPath.startsWith('/') ? asPath : `/${asPath}`}`,
    );
  }

  const reqUrl = ctx.req?.url;
  if (reqUrl && String(reqUrl).includes('?')) {
    const path = String(reqUrl).startsWith('/') ? reqUrl : `/${reqUrl}`;
    return parsePreviewTokenFromRequestUrl(`http://reactpress.local${path}`);
  }

  return '';
}
