/** Legacy root paths that live under API `/public` on the server. */
const PUBLIC_PATH_ALIASES: Record<string, string> = {
  '/logo.png': '/public/logo.png',
  '/favicon.png': '/public/favicon.png',
  '/favicon.ico': '/public/favicon.ico',
};

/** Theme Next rewrites serve alias keys (e.g. `/logo.png`), not `/public/*` API paths. */
const THEME_LOCAL_PUBLIC_PATHS: Record<string, string> = Object.fromEntries(
  Object.entries(PUBLIC_PATH_ALIASES).map(([themePath, apiPath]) => [apiPath, themePath]),
);

function normalizePublicAssetPath(path: string): string {
  return PUBLIC_PATH_ALIASES[path] ?? path;
}

function toThemeServablePath(apiPath: string): string {
  return THEME_LOCAL_PUBLIC_PATHS[apiPath] ?? apiPath;
}

/** Paths proxied by theme `next.config` rewrites — keep relative, never bake absolute API URLs. */
function isThemeRewritePath(path: string): boolean {
  return path in THEME_LOCAL_PUBLIC_PATHS || path.startsWith('/public/') || path.startsWith('/uploads/');
}

/** Whether a configured asset path is likely to resolve (skip broken defaults like `/logo.png`). */
export function isLikelyValidAssetPath(url: string | undefined | null): boolean {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/api/') || trimmed.startsWith('/uploads/')) {
    return true;
  }
  if (trimmed.startsWith('/public/') && !PUBLIC_PATH_ALIASES[trimmed.replace('/public', '')]) {
    return true;
  }
  return false;
}

/** Header logo — uploads only; default wordmark `/logo.png` is shown via `SiteBranding` text instead. */
export function isLikelyValidHeaderLogoPath(url: string | undefined | null): boolean {
  return isLikelyValidAssetPath(url);
}

/** Stable public site origin for asset URLs — matches on SSR and client when `NEXT_PUBLIC_*` is set. */
function resolvePublicSiteOrigin(): string {
  const publicApi =
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_REACTPRESS_API_URL?.trim()) || '';
  if (publicApi) {
    return publicApi.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const serverApi =
    process.env.REACTPRESS_API_URL?.trim() ||
    process.env.SERVER_API_URL?.trim() ||
    'http://localhost:3002/api';
  return serverApi.replace(/\/api\/?$/, '').replace(/\/$/, '');
}

/** Visitor site origin — differs from API origin during SSR (theme :3001 vs API :3002). */
function resolveThemeSiteOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const clientSite = process.env.CLIENT_SITE_URL?.trim();
  if (clientSite) {
    try {
      return new URL(clientSite).origin;
    } catch {
      return clientSite.replace(/\/$/, '');
    }
  }
  const clientPort = process.env.CLIENT_PORT?.trim() || process.env.PORT?.trim();
  if (clientPort) {
    return `http://127.0.0.1:${clientPort}`;
  }
  return resolvePublicSiteOrigin();
}

/** Resolve media / logo URLs for theme pages. */
export function resolvePublicAssetUrl(url: string | undefined | null): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('//')) {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    return `${protocol}${trimmed}`;
  }
  if (trimmed.startsWith('/')) {
    const normalized = normalizePublicAssetPath(trimmed);
    if (isThemeRewritePath(normalized)) {
      return toThemeServablePath(normalized);
    }
    const origin = resolvePublicSiteOrigin();
    const themeOrigin = resolveThemeSiteOrigin();
    if (origin === themeOrigin) {
      return normalized;
    }
    return `${origin}${normalized}`;
  }
  return trimmed;
}

/** Rewrite relative asset URLs inside rendered article HTML (`src`, `href`). */
export function rewriteArticleHtmlAssets(html: string | undefined | null): string {
  if (!html?.trim()) return html ?? '';
  return html.replace(
    /(\b(?:src|href)\s*=\s*)(["'])([^"']+)\2/gi,
    (_, prefix: string, quote: string, url: string) =>
      `${prefix}${quote}${resolvePublicAssetUrl(url)}${quote}`,
  );
}
