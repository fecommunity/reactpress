import { deepMerge } from '../../utils/object';
import enLocale from '../../config/locales/en.json';
import zhLocale from '../../config/locales/zh.json';

const BUILTIN_VISITOR_LOCALES: Record<string, Record<string, unknown>> = {
  en: enLocale as Record<string, unknown>,
  zh: zhLocale as Record<string, unknown>,
};

/** Remote CMS i18n may omit newer keys — fill from toolkit defaults. */
export function mergeVisitorI18n(apiI18n: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...apiI18n };
  for (const [locale, defaults] of Object.entries(BUILTIN_VISITOR_LOCALES)) {
    const fromApi = (apiI18n[locale] as Record<string, unknown>) || {};
    merged[locale] = deepMerge(deepMerge({}, defaults), fromApi);
  }
  return merged;
}

/** Keep only the active locale in SSR payload; other locales load client-side. */
export function slimVisitorI18nForSsr(
  i18n: Record<string, unknown>,
  locale: string,
): Record<string, unknown> {
  const messages = i18n[locale];
  return messages && typeof messages === 'object' ? { [locale]: messages } : {};
}
