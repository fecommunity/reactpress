'use client';

import {
  ReactPressProvider,
  SiteCatalogProvider,
  type SiteCatalogContextValue,
} from '@fecommunity/reactpress-toolkit/ui';
import {
  applyColorModeClass,
  clearThemeSession,
  persistColorMode,
  persistThemeSession,
  persistVisitorLocale,
  resolveClientThemeMode,
  resolveStoredUser,
  type ThemeColorMode,
} from '@fecommunity/reactpress-toolkit/theme';
import type { AppBootstrapResult } from '@fecommunity/reactpress-toolkit/theme/server';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { LayoutShell } from './layout-shell';

type Props = {
  bootstrap: AppBootstrapResult;
  children: React.ReactNode;
};

export function ReactPressAppProviders({ bootstrap, children }: Props) {
  const {
    setting: initialSetting,
    tags,
    categories,
    pages,
    i18n,
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
    },
    [locale],
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
      i18n,
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
      i18n,
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

  const messages = (i18n?.[locale] ?? {}) as Record<string, string>;
  const catalog = i18n as Record<string, Record<string, string>>;

  return (
    <ReactPressProvider
      locale={locale}
      locales={locales}
      messages={messages}
      catalog={catalog}
      themeId="my-blog"
      mods={themeMods}
      onLocaleChange={changeLocale}
    >
      <SiteCatalogProvider value={catalogValue}>
        <LayoutShell>{children}</LayoutShell>
      </SiteCatalogProvider>
    </ReactPressProvider>
  );
}
