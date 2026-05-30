import { safeJsonParse } from '../api/json';

export type LocaleMessages = Record<string, string>;
export type LocaleCatalog = Record<string, LocaleMessages>;

export interface SiteLocaleState {
  locale: string;
  locales: string[];
  messages: LocaleMessages;
  /** Full `{ zh: {...}, en: {...} }` catalog when available. */
  catalog: LocaleCatalog;
}

export interface ParseSiteLocaleOptions {
  locale?: string;
  fallbackLocale?: string;
  /** Cookie / query hint (checked before fallback). */
  preferredLocale?: string;
  acceptLanguage?: string;
}

export function resolveRequestLocale(
  supported: string[],
  options: {
    preferred?: string;
    fallback?: string;
    acceptLanguage?: string;
  } = {},
): string {
  const fallback = options.fallback ?? 'zh';
  const { preferred, acceptLanguage } = options;

  if (preferred && supported.includes(preferred)) {
    return preferred;
  }

  if (acceptLanguage) {
    const parts = acceptLanguage.split(',');
    for (const part of parts) {
      const tag = part.split(';')[0]?.trim().toLowerCase();
      if (!tag) continue;
      if (supported.includes(tag)) return tag;
      const short = tag.split('-')[0];
      if (short && supported.includes(short)) return short;
    }
  }

  if (supported.includes(fallback)) return fallback;
  return supported[0] ?? 'en';
}

export function parseSiteLocale(
  i18nRaw: unknown,
  options: ParseSiteLocaleOptions = {},
): SiteLocaleState {
  const catalog = safeJsonParse<LocaleCatalog>(
    i18nRaw,
    {},
  );
  const locales = Object.keys(catalog).filter(
    (key) => catalog[key] && typeof catalog[key] === 'object',
  );
  const fallbackLocale =
    options.fallbackLocale ??
    (locales.includes('zh') ? 'zh' : locales.includes('en') ? 'en' : locales[0] ?? 'en');

  const locale = resolveRequestLocale(locales.length ? locales : [fallbackLocale], {
    preferred: options.locale ?? options.preferredLocale,
    acceptLanguage: options.acceptLanguage,
    fallback: fallbackLocale,
  });

  const messages = { ...(catalog[locale] ?? {}) };

  return {
    locale,
    locales: locales.length ? locales : [locale],
    messages,
    catalog,
  };
}

export function createTranslator(messages: LocaleMessages) {
  return function t(key: string, fallback?: string): string {
    if (messages[key] != null && messages[key] !== '') {
      return messages[key];
    }
    return fallback ?? key;
  };
}
