import { useCallback } from 'react';
import { useLocale } from '@fecommunity/reactpress-toolkit/theme';
import { THEME_LOCALE_CATALOG } from '../lib/i18n/catalog';

/** Translator with API messages first, then theme catalog fallback. */
export function useThemeT() {
  const { locale, t } = useLocale();

  return useCallback(
    (key: string, fallback?: string) => {
      const fromApi = t(key);
      if (fromApi !== key) return fromApi;
      const local = THEME_LOCALE_CATALOG[locale]?.[key];
      if (local) return local;
      return fallback ?? key;
    },
    [locale, t],
  );
}
