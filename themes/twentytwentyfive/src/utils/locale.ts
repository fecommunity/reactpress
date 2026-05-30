import { resolveRequestLocale } from '@fecommunity/reactpress-toolkit/theme';
import type { IncomingMessage } from 'http';

export const VISITOR_LOCALE_COOKIE = 'reactpress-locale';
export const LEGACY_LOCALE_STORAGE_KEY = 'locale';

export function readRequestCookie(req: IncomingMessage | undefined, name: string): string | undefined {
  const header = req?.headers?.cookie ?? '';
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]*)`).exec(header);
  if (!match?.[1]) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

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
