export type ThemeMods = Record<string, string>;

/** Customizer mod id → legacy Setting column (runtime overlay for themes). */
export const THEME_BRANDING_MOD_TO_SETTING: Record<string, string> = {
  displayTitle: 'systemTitle',
  displayTagline: 'systemSubTitle',
  siteLogo: 'systemLogo',
  backgroundImage: 'systemBg',
  siteFavicon: 'systemFavicon',
  siteNotice: 'systemNoticeInfo',
  seoKeyword: 'seoKeyword',
  seoDesc: 'seoDesc',
  baiduAnalyticsId: 'baiduAnalyticsId',
  googleAnalyticsId: 'googleAnalyticsId',
};

/** Mod ids stored under the same key in mods and Setting overlay. */
export const THEME_BRANDING_DIRECT_MODS = [
  'systemFooterInfo',
  'aboutUsGithubUrl',
  'aboutUsCommentQr',
  'aboutUsWechatQr',
] as const;

function modValue(mods: ThemeMods, modId: string): string | undefined {
  const v = mods[modId];
  if (v == null || String(v).trim() === '') return undefined;
  return String(v);
}

/** Build customizer form seed from legacy Setting columns (one-time / fallback). */
export function seedThemeModsFromLegacySetting(
  setting: Record<string, unknown> | null | undefined,
  mods: ThemeMods = {},
): ThemeMods {
  const merged = { ...mods };
  for (const [modId, settingKey] of Object.entries(THEME_BRANDING_MOD_TO_SETTING)) {
    if (!modValue(merged, modId) && setting?.[settingKey] != null) {
      merged[modId] = String(setting[settingKey]);
    }
  }
  for (const key of THEME_BRANDING_DIRECT_MODS) {
    if (!modValue(merged, key) && setting?.[key] != null) {
      merged[key] = String(setting[key]);
    }
  }
  return merged;
}

/** Overlay theme mods onto a Setting-shaped object for theme runtime & mail templates. */
export function applyThemeModsToSiteSetting<T extends Record<string, unknown>>(
  setting: T,
  mods: ThemeMods,
): T {
  const next = { ...setting };
  for (const [modId, settingKey] of Object.entries(THEME_BRANDING_MOD_TO_SETTING)) {
    const v = modValue(mods, modId);
    if (v) (next as Record<string, unknown>)[settingKey] = v;
  }
  for (const key of THEME_BRANDING_DIRECT_MODS) {
    const v = modValue(mods, key);
    if (v) (next as Record<string, unknown>)[key] = v;
  }
  return next;
}

export function brandingModValue(mods: ThemeMods, modId: string): string | undefined {
  return modValue(mods, modId);
}
