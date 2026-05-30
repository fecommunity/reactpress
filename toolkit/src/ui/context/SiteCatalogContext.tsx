import React, { createContext, useContext } from 'react';

import type { SiteCatalogContextValue } from './siteCatalogTypes';
import { defaultSiteCatalogContext } from './siteCatalogTypes';

export type {
  SiteCatalogContextValue,
  SiteCatalogSiteConfig,
  SiteConfigNav,
} from './siteCatalogTypes';

/** Global site catalog + session state for full-featured themes. */
export const SiteCatalogContext = createContext<SiteCatalogContextValue>(defaultSiteCatalogContext);

export function SiteCatalogProvider({
  value,
  children,
}: {
  value: SiteCatalogContextValue;
  children: React.ReactNode;
}) {
  return (
    <SiteCatalogContext.Provider value={value}>{children}</SiteCatalogContext.Provider>
  );
}

export function useSiteCatalog() {
  const ctx = useContext(SiteCatalogContext);
  return {
    categories: ctx.categories ?? [],
    tags: ctx.tags ?? [],
    pages: ctx.pages ?? [],
    siteConfig: ctx.siteConfig,
    globalSetting: ctx.globalSetting,
    locale: ctx.locale,
    locales: ctx.locales ?? [],
    i18n: ctx.i18n,
    changeLocale: ctx.changeLocale,
    collapsed: ctx.collapsed,
    toggleCollapse: ctx.toggleCollapse,
  };
}

export function useSiteSetting() {
  const ctx = useContext(SiteCatalogContext);
  return ctx.setting ?? ({} as NonNullable<SiteCatalogContextValue['setting']>);
}

export function useSiteUser() {
  const ctx = useContext(SiteCatalogContext);
  return {
    user: ctx.user,
    setUser: ctx.setUser,
    removeUser: ctx.removeUser,
  };
}

export function useColorMode() {
  const ctx = useContext(SiteCatalogContext);
  return {
    colorMode: ctx.theme ?? 'light',
    changeColorMode: ctx.changeTheme,
  };
}

/** @deprecated Prefer `useSiteCatalog().siteConfig`. */
export function useSiteConfig() {
  const ctx = useContext(SiteCatalogContext);
  return {
    siteConfig: ctx.siteConfig,
    globalSetting: ctx.globalSetting,
  };
}
