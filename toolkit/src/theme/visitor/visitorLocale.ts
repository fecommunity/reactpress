import type { IncomingMessage } from 'http';

import { readRequestCookie } from '../../utils/cookie';
import { resolveRequestLocale } from './locale';

export const VISITOR_LOCALE_COOKIE = 'reactpress-locale';
export const LEGACY_LOCALE_STORAGE_KEY = 'locale';

export { readRequestCookie };

function readCookieFromHeader(header: string, name: string): string | undefined {
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(header);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** Read a visitor cookie in the browser (client `getInitialProps`, hydration). */
export function readBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return readCookieFromHeader(document.cookie, name);
}

export function resolveVisitorLocale(supported: string[], req?: IncomingMessage): string {
  const locales = supported.length ? supported : ['zh', 'en'];
  const preferred =
    readRequestCookie(req, VISITOR_LOCALE_COOKIE) ||
    readRequestCookie(req, LEGACY_LOCALE_STORAGE_KEY) ||
    readBrowserCookie(VISITOR_LOCALE_COOKIE) ||
    readBrowserCookie(LEGACY_LOCALE_STORAGE_KEY);

  let acceptLanguage: string | undefined;
  if (typeof req?.headers?.['accept-language'] === 'string') {
    acceptLanguage = req.headers['accept-language'];
  } else if (typeof navigator !== 'undefined' && navigator.language) {
    acceptLanguage = navigator.language;
  }

  return resolveRequestLocale(locales, {
    preferred,
    acceptLanguage,
    fallback: locales.includes('zh') ? 'zh' : locales[0] ?? 'zh',
  });
}

export function persistVisitorLocale(locale: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LEGACY_LOCALE_STORAGE_KEY, locale);
  window.localStorage.setItem(VISITOR_LOCALE_COOKIE, locale);
  document.cookie = `${VISITOR_LOCALE_COOKIE}=${encodeURIComponent(locale)}; path=/; max-age=31536000; SameSite=Lax`;
}
