/**
 * Site-wide vs theme-owned settings.
 *
 * - **System settings** (`SYSTEM_SETTING_FIELD_KEYS`): shared defaults (URLs, site identity,
 *   SEO, i18n, mail). Edited under admin → 设置.
 * - **Theme mods** (`THEME_BRANDING_*`): per-theme overrides in `globalSetting.theme.mods[themeId]`.
 *   Empty mod → inherit the matching system setting at runtime.
 * - **Theme-only** (footer / 关于我们): appearance only, no system setting column.
 */

import {
  applyThemeModsToSiteSetting,
  seedThemeModsFromLegacySetting,
  THEME_BRANDING_DIRECT_MODS,
  THEME_BRANDING_MOD_TO_SETTING,
} from './branding-mods';
import {
  getThemeStateFromGlobalSetting,
  type GlobalSettingWithTheme,
  type SiteThemeState,
  type ThemeMods,
} from './theme';

export {
  applyThemeModsToSiteSetting,
  seedThemeModsFromLegacySetting,
  THEME_BRANDING_DIRECT_MODS,
  THEME_BRANDING_MOD_TO_SETTING,
} from './branding-mods';

/** Site identity defaults (admin → 设置 → 常规). Themes may override via customizer mods. */
export const SITE_DEFAULT_SETTING_KEYS = [
  'systemTitle',
  'systemSubTitle',
  'systemLogo',
  'systemFavicon',
  'systemNoticeInfo',
] as const;

/** SEO defaults (admin → 设置 → SEO). Themes may override via customizer mods. */
export const SEO_DEFAULT_SETTING_KEYS = [
  'seoKeyword',
  'seoDesc',
  'baiduAnalyticsId',
  'googleAnalyticsId',
] as const;

/** Theme-only appearance (no system setting column). */
export const THEME_ONLY_APPEARANCE_KEYS = [
  'systemFooterInfo',
  'aboutUsGithubUrl',
  'aboutUsCommentQr',
  'aboutUsWechatQr',
] as const;

/** DB columns managed as system configuration (admin → 设置). */
export const SYSTEM_SETTING_FIELD_KEYS = [
  'i18n',
  'systemUrl',
  'adminSystemUrl',
  ...SITE_DEFAULT_SETTING_KEYS,
  ...SEO_DEFAULT_SETTING_KEYS,
  'smtpHost',
  'smtpPort',
  'smtpUser',
  'smtpPass',
  'smtpFromUser',
] as const;

export type SystemSettingFieldKey = (typeof SYSTEM_SETTING_FIELD_KEYS)[number];

/** @deprecated Use SITE_DEFAULT_SETTING_KEYS + SEO_DEFAULT_SETTING_KEYS */
export const LEGACY_APPEARANCE_SETTING_KEYS = [
  ...SITE_DEFAULT_SETTING_KEYS,
  ...SEO_DEFAULT_SETTING_KEYS,
  ...THEME_ONLY_APPEARANCE_KEYS,
] as const;

export type ThemeBrandingDirectMod = (typeof THEME_BRANDING_DIRECT_MODS)[number];

/** Keys exposed to anonymous theme `setting/get` (plus computed appearance overlay). */
export const PUBLIC_SETTING_KEYS = [
  'i18n',
  'systemUrl',
  'adminSystemUrl',
  'globalSetting',
  ...LEGACY_APPEARANCE_SETTING_KEYS,
] as const;

function modHasValue(mods: ThemeMods, modId: string): boolean {
  const v = mods[modId];
  return v != null && String(v).trim() !== '';
}

/** Copy legacy appearance columns into theme mods when mods are empty. */
export function migrateLegacyAppearanceToThemeMods(
  globalRaw: unknown,
  settingRow: Record<string, unknown>,
): { global: GlobalSettingWithTheme; changed: boolean } {
  const base =
    globalRaw && typeof globalRaw === 'object'
      ? ({ ...(globalRaw as GlobalSettingWithTheme) } as GlobalSettingWithTheme)
      : ({} as GlobalSettingWithTheme);
  const themeState = getThemeStateFromGlobalSetting(base);
  const themeIds = new Set<string>([
    themeState.activeTheme,
    ...themeState.installedThemes,
  ]);
  const mods: Record<string, ThemeMods> =
    themeState.mods && typeof themeState.mods === 'object'
      ? { ...(themeState.mods as Record<string, ThemeMods>) }
      : {};

  let changed = false;
  for (const themeId of themeIds) {
    if (!themeId) continue;
    const current = mods[themeId] ?? {};
    const seeded = seedThemeModsFromLegacySetting(settingRow, current);
    const currentHasValues = Object.keys(current).some((k) => modHasValue(current, k));
    const seededHasValues = Object.keys(seeded).some((k) => modHasValue(seeded, k));
    if (!currentHasValues && seededHasValues) {
      mods[themeId] = seeded;
      changed = true;
    }
  }

  if (!changed) {
    return { global: base, changed: false };
  }
  const next: SiteThemeState = { ...themeState, mods };
  return { global: { ...base, theme: next }, changed: true };
}

/** Strip non-system fields from admin PATCH payloads. */
export function pickSystemSettingPatch(patch: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of SYSTEM_SETTING_FIELD_KEYS) {
    if (key in patch) out[key] = patch[key];
  }
  return out;
}

/** Overlay active theme mods onto a Setting row for runtime (themes, mail templates). */
export function resolveEffectiveSettingRow<T extends Record<string, unknown>>(
  row: T,
  globalRaw?: unknown,
  themeId?: string,
): T {
  const gs = globalRaw ?? row.globalSetting;
  const themeState = getThemeStateFromGlobalSetting(
    typeof gs === 'string'
      ? (() => {
          try {
            return JSON.parse(gs) as unknown;
          } catch {
            return {};
          }
        })()
      : gs,
  );
  const id = themeId ?? themeState.activeTheme;
  const mods = themeState.mods[id] ?? {};
  return applyThemeModsToSiteSetting(row, mods);
}

/** Public API view: system keys + branding overlay + globalSetting. */
export function buildPublicSettingView(row: Record<string, unknown>): Record<string, unknown> {
  const effective = resolveEffectiveSettingRow(row);
  const out: Record<string, unknown> = {};
  for (const key of PUBLIC_SETTING_KEYS) {
    if (effective[key] !== undefined) out[key] = effective[key];
  }
  return out;
}
