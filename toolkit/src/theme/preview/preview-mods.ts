import type { ThemeMods } from '../extension/theme';

/** Query key for draft customizer values in live preview iframe (`?reactpress_preview_mods=…`). */
export const PREVIEW_MODS_QUERY_KEY = 'reactpress_preview_mods';

export function parsePreviewModsParam(raw: string | null | undefined): ThemeMods {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.trim())) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: ThemeMods = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (value == null || value === '') continue;
      out[key] = String(value);
    }
    return out;
  } catch {
    return {};
  }
}

/** Read draft mods from a request URL or path+query string. */
export function parsePreviewModsFromRequestUrl(url: string | undefined): ThemeMods {
  if (!url?.trim()) return {};
  try {
    const parsed = new URL(url, 'http://reactpress.local');
    return parsePreviewModsParam(parsed.searchParams.get(PREVIEW_MODS_QUERY_KEY));
  } catch {
    return {};
  }
}

export function appendPreviewModsToUrl(baseUrl: string, mods: ThemeMods): string {
  if (Object.keys(mods).length === 0) return baseUrl;

  try {
    const url = baseUrl.includes('://')
      ? new URL(baseUrl)
      : new URL(baseUrl, 'http://localhost');
    url.searchParams.set(PREVIEW_MODS_QUERY_KEY, JSON.stringify(mods));
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export function mergePreviewMods(base: ThemeMods, override: ThemeMods): ThemeMods {
  if (!Object.keys(override).length) return base;
  return { ...base, ...override };
}

/** Next.js Pages `ctx.query` / `asPath` / `req.url` — used in `createThemeApp.getInitialProps`. */
export function parsePreviewModsFromNextCtx(ctx: {
  query?: Record<string, string | string[] | undefined>;
  asPath?: string;
  req?: { url?: string };
}): ThemeMods {
  const raw = ctx.query?.[PREVIEW_MODS_QUERY_KEY];
  if (typeof raw === 'string') return parsePreviewModsParam(raw);
  if (Array.isArray(raw) && typeof raw[0] === 'string') return parsePreviewModsParam(raw[0]);

  const asPath = typeof ctx.asPath === 'string' ? ctx.asPath : '';
  if (asPath.includes('?')) {
    return parsePreviewModsFromRequestUrl(`http://reactpress.local${asPath.startsWith('/') ? asPath : `/${asPath}`}`);
  }

  const reqUrl = ctx.req?.url;
  if (reqUrl && String(reqUrl).includes('?')) {
    const path = String(reqUrl).startsWith('/') ? reqUrl : `/${reqUrl}`;
    return parsePreviewModsFromRequestUrl(`http://reactpress.local${path}`);
  }

  return {};
}
