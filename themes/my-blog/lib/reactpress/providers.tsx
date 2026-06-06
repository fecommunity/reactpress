'use client';

import { SettingProvider } from '@/lib/providers/client';
import {
  ReactPressProvider,
  SiteCatalogProvider,
  readPersistedLocale,
  useLocale,
  type SiteCatalogContextValue,
} from '@fecommunity/reactpress-toolkit/ui';
import {
  applyColorModeClass,
  clearThemeSession,
  mergeVisitorI18n,
  persistColorMode,
  persistThemeSession,
  persistVisitorLocale,
  resolveClientThemeMode,
  resolveStoredUser,
  safeJsonParse,
  type ThemeColorMode,
} from '@fecommunity/reactpress-toolkit/theme';
import type { AppBootstrapResult } from '@fecommunity/reactpress-toolkit/theme/server';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { LayoutShell } from './layout-shell';

type Props = {
  bootstrap: AppBootstrapResult;
  children: React.ReactNode;
};

function VisitorLocaleBootstrap({
  locales,
  ssrLocale,
}: {
  locales: string[];
  ssrLocale: string;
}) {
  const { setLocale } = useLocale();

  useLayoutEffect(() => {
    const stored = readPersistedLocale(locales, ssrLocale);
    if (stored && stored !== ssrLocale) {
      setLocale(stored);
    }
  }, [locales, setLocale, ssrLocale]);

  return null;
}

export function ReactPressAppProviders({ bootstrap, children }: Props) {
  const {
    setting: initialSetting,
    tags,
    categories,
    pages,
    i18n: bootstrapI18n,
    globalSetting,
    siteConfig,
    locales,
    initialLocale,
    themeMods,
  } = bootstrap;

  const [theme, setTheme] = useState<ThemeColorMode>('light');
  const [locale, setLocale] = useState(initialLocale);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUserState] = useState<SiteCatalogContextValue['user']>(null);
  const [setting] = useState(initialSetting);
  const [i18nCatalog, setI18nCatalog] = useState<Record<string, Record<string, string>>>(() =>
    mergeVisitorI18n(bootstrapI18n as Record<string, unknown>) as Record<string, Record<string, string>>,
  );

  useLayoutEffect(() => {
    const storedUser = resolveStoredUser();
    if (storedUser) {
      persistThemeSession(storedUser);
      setUserState(storedUser);
    }

    const preferred = resolveClientThemeMode();
    applyColorModeClass(preferred === 'dark');
    setTheme(preferred);
  }, []);

  useEffect(() => {
    applyColorModeClass(theme === 'dark');
  }, [theme]);

  const prefetchRemainingI18nLocales = useCallback(() => {
    if (!Array.isArray(locales) || locales.length <= 1) return;

    SettingProvider.getSetting()
      .then((res) => {
        const full = mergeVisitorI18n(safeJsonParse(res.i18n, {})) as Record<
          string,
          Record<string, string>
        >;
        setI18nCatalog((prev) => ({ ...prev, ...full }));
      })
      .catch(() => {
        // Active locale messages are already available from SSR / builtins.
      });
  }, [locales]);

  useEffect(() => {
    prefetchRemainingI18nLocales();
  }, [prefetchRemainingI18nLocales]);

  const changeTheme = useCallback((next: ThemeColorMode) => {
    const isDark = next === 'dark';
    applyColorModeClass(isDark);
    persistColorMode(isDark);
    setTheme(next);
  }, []);

  const changeLocale = useCallback(
    (key: string) => {
      if (!key || key === locale) return;
      persistVisitorLocale(key);
      setLocale(key);

      if (!i18nCatalog[key]) {
        prefetchRemainingI18nLocales();
      }
    },
    [i18nCatalog, locale, prefetchRemainingI18nLocales],
  );

  const setUser = useCallback((next: SiteCatalogContextValue['user']) => {
    persistThemeSession(next);
    setUserState(next);
  }, []);

  const removeUser = useCallback(() => {
    clearThemeSession();
    setUserState(null);
    window.location.reload();
  }, []);

  const toggleCollapse = useCallback(() => setCollapsed((value) => !value), []);

  const catalogValue = useMemo<SiteCatalogContextValue>(
    () => ({
      setting,
      i18n: i18nCatalog,
      locale,
      locales,
      globalSetting,
      siteConfig,
      tags,
      categories,
      pages,
      theme,
      collapsed,
      changeLocale,
      user,
      setUser,
      removeUser,
      changeTheme,
      getSetting: () => setting,
      toggleCollapse,
    }),
    [
      setting,
      i18nCatalog,
      locale,
      locales,
      globalSetting,
      siteConfig,
      tags,
      categories,
      pages,
      theme,
      collapsed,
      changeLocale,
      user,
      setUser,
      removeUser,
      changeTheme,
      toggleCollapse,
    ],
  );

  const messages = (i18nCatalog[locale] ?? {}) as Record<string, string>;

  return (
    <ReactPressProvider
      locale={locale}
      locales={locales}
      messages={messages}
      catalog={i18nCatalog}
      themeId="my-blog"
      mods={themeMods}
      onLocaleChange={changeLocale}
    >
      <SiteCatalogProvider value={catalogValue}>
        <LayoutShell>
          <VisitorLocaleBootstrap locales={locales} ssrLocale={initialLocale} />
          {children}
        </LayoutShell>
      </SiteCatalogProvider>
    </ReactPressProvider>
  );
}
