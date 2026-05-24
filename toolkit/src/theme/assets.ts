import { resolveThemeApiBaseUrl } from './api';

/** Resolve media / logo URLs for theme pages (relative `/api/...` → public API origin). */
export function resolvePublicAssetUrl(url: string | undefined | null): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('//')) {
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    return `${protocol}${trimmed}`;
  }

  const apiBase = resolveThemeApiBaseUrl().replace(/\/$/, '');
  const siteOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : apiBase.replace(/\/api\/?$/, '');

  if (trimmed.startsWith('/api/')) {
    return `${siteOrigin}${trimmed}`;
  }
  if (trimmed.startsWith('/')) {
    return `${siteOrigin}${trimmed}`;
  }
  return trimmed;
}
