import type { ThemeConfigurationSchema } from './configuration/types';
import type { ResolvedSiteConfig } from './configuration/types';
import { resolveSiteConfig } from './configuration/resolve';
import { getThemeStateFromGlobalSetting } from './theme';
import { safeJsonParse } from '../api/json';

export type SiteNavConfig = {
  urlConfig: NonNullable<NonNullable<ResolvedSiteConfig['nav']>['urlConfig']>;
  searchCategories: NonNullable<NonNullable<ResolvedSiteConfig['nav']>['searchCategories']>;
};

export type FetchSiteNavConfigOptions = {
  locale: string;
  manifest: { id: string; options?: ThemeConfigurationSchema };
  getSetting: () => Promise<{ globalSetting?: unknown }>;
};

/** Load nav blocks for `/nav` pages (client transitions may skip slimmed `_app` nav). */
export async function fetchSiteNavConfig(options: FetchSiteNavConfigOptions): Promise<SiteNavConfig> {
  const setting = await options.getSetting();
  const globalSettingRaw = safeJsonParse<Record<string, unknown>>(setting.globalSetting, {});
  const themeState = getThemeStateFromGlobalSetting(globalSettingRaw);
  const siteConfig = resolveSiteConfig(
    globalSettingRaw,
    themeState.activeTheme,
    options.locale,
    options.manifest,
  );

  return {
    urlConfig: siteConfig.nav?.urlConfig ?? [],
    searchCategories: siteConfig.nav?.searchCategories ?? { categories: [], subCategories: {} },
  };
}
