import type { IncomingMessage } from 'http';

import { readRequestCookie } from '../../utils/cookie';
import { resolveRequestLocale } from './locale';

export const VISITOR_LOCALE_COOKIE = 'reactpress-locale';
export const LEGACY_LOCALE_STORAGE_KEY = 'locale';

export { readRequestCookie };

export function resolveVisitorLocale(supported: string[], req?: IncomingMessage): string {
  const locales = supported.length ? supported : ['zh', 'en'];
  return resolveRequestLocale(locales, {
    preferred:
      readRequestCookie(req, VISITOR_LOCALE_COOKIE) ||
      readRequestCookie(req, LEGACY_LOCALE_STORAGE_KEY),
    acceptLanguage:
      typeof req?.headers?.['accept-language'] === 'string'
        ? req.headers['accept-language']
        : undefined,
    fallback: locales.includes('zh') ? 'zh' : locales[0] ?? 'zh',
  });
}

export function persistVisitorLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, locale);
  window.localStorage.setItem(VISITOR_LOCALE_COOKIE, locale);
  document.cookie = `${VISITOR_LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`;
}
