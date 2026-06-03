import type { ResolvedSiteConfig } from '@fecommunity/reactpress-toolkit/theme';
import {
  getThemeStateFromGlobalSetting,
  resolveSiteConfig,
  safeJsonParse,
} from '@fecommunity/reactpress-toolkit/theme';

import { SettingProvider } from '@/providers';

import themeManifest from '../../theme.json';

export type SiteNavConfig = {
  urlConfig: NonNullable<NonNullable<ResolvedSiteConfig['nav']>['urlConfig']>;
  searchCategories: NonNullable<NonNullable<ResolvedSiteConfig['nav']>['searchCategories']>;
};

/** Load nav blocks for `/nav` pages (client transitions skip slimmed `_app` nav). */
export async function fetchSiteNavConfig(locale: string): Promise<SiteNavConfig> {
  const setting = await SettingProvider.getSetting();
  const globalSettingRaw = safeJsonParse<Record<string, unknown>>(setting.globalSetting, {});
  const themeState = getThemeStateFromGlobalSetting(globalSettingRaw);
  const siteConfig = resolveSiteConfig(
    globalSettingRaw,
    themeState.activeTheme,
    locale,
    themeManifest,
  );

  return {
    urlConfig: siteConfig.nav?.urlConfig ?? [],
    searchCategories: siteConfig.nav?.searchCategories ?? { categories: [], subCategories: {} },
  };
}
