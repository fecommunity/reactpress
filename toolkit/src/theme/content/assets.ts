/** Legacy root paths that live under API `/public` on the server. */
const PUBLIC_PATH_ALIASES: Record<string, string> = {
  '/logo.png': '/public/logo.png',
  '/favicon.png': '/public/favicon.png',
  '/favicon.ico': '/public/favicon.ico',
};

function normalizePublicAssetPath(path: string): string {
  return PUBLIC_PATH_ALIASES[path] ?? path;
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
    const origin = resolvePublicSiteOrigin();
    const themeOrigin = typeof window !== 'undefined' ? window.location.origin : origin;
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
