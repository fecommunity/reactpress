/** WordPress-style theme manifest and site theme state (shared by server / web / themes). */

import type { ThemeConfigurationSchema } from './configuration/types';

export interface ThemeCustomizerChoice {
  value: string;
  label: string;
}

/** WordPress Customizer–style control (declared in `theme.json` → `customizer.sections`). */
export interface ThemeCustomizerSetting {
  id: string;
  type: 'color' | 'text' | 'image' | 'textarea' | 'checkbox' | 'select';
  label: string;
  default?: string;
  /** Shown below the control (like WP customize control descriptions). */
  description?: string;
  /** For `type: "select"`. */
  choices?: ThemeCustomizerChoice[];
}

export interface ThemeCustomizerSection {
  id: string;
  title: string;
  /** Inline controls; omit when `panel` is set. */
  settings?: ThemeCustomizerSetting[];
  /** Inline theme JSON Schema form inside customizer (no separate admin page). */
  panel?: 'configuration';
  description?: string;
}

/** Customizer mod id → `Setting` entity column (identity / background overrides). */
export const CUSTOMIZER_MOD_TO_SETTING_KEY: Record<string, string> = {
  displayTitle: 'systemTitle',
  displayTagline: 'systemSubTitle',
  siteLogo: 'systemLogo',
  backgroundImage: 'systemBg',
};

/** Setting fields stored under the same id in mods (about / footer). */
export const CUSTOMIZER_DIRECT_SETTING_KEYS = [
  'systemFooterInfo',
  'aboutUsGithubUrl',
  'aboutUsCommentQr',
  'aboutUsWechatQr',
] as const;

export type CustomizerDirectSettingKey = (typeof CUSTOMIZER_DIRECT_SETTING_KEYS)[number];

/** @deprecated Use CUSTOMIZER_DIRECT_SETTING_KEYS */
export const CUSTOMIZER_SITE_SETTING_KEYS = CUSTOMIZER_DIRECT_SETTING_KEYS;

export type CustomizerSiteSettingKey = CustomizerDirectSettingKey;

function modValue(mods: ThemeMods, modId: string): string | undefined {
  const v = mods[modId];
  if (v == null || String(v).trim() === '') return undefined;
  return String(v);
}

/** Values to persist into site `Setting` when publishing customizer mods. */
export function pickCustomizerSiteSettings(mods: ThemeMods): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [modId, settingKey] of Object.entries(CUSTOMIZER_MOD_TO_SETTING_KEY)) {
    const v = modValue(mods, modId);
    if (v) out[settingKey] = v;
  }
  for (const key of CUSTOMIZER_DIRECT_SETTING_KEYS) {
    const v = modValue(mods, key);
    if (v) out[key] = v;
  }
  return out;
}

/** Build form seed from site settings (inverse of mod → setting map). */
export function seedCustomizerModsFromSiteSetting(
  setting: Record<string, unknown> | null | undefined,
  mods: ThemeMods = {},
): ThemeMods {
  const merged = { ...mods };
  for (const [modId, settingKey] of Object.entries(CUSTOMIZER_MOD_TO_SETTING_KEY)) {
    if (!modValue(merged, modId) && setting?.[settingKey] != null) {
      merged[modId] = String(setting[settingKey]);
    }
  }
  for (const key of CUSTOMIZER_DIRECT_SETTING_KEYS) {
    if (!modValue(merged, key) && setting?.[key] != null) {
      merged[key] = String(setting[key]);
    }
  }
  return merged;
}

/** Overlay customizer / preview mods onto site setting for the active theme runtime. */
export function applyCustomizerModsToSiteSetting<T extends Record<string, unknown>>(
  setting: T,
  mods: ThemeMods,
): T {
  const next = { ...setting };
  for (const [modId, settingKey] of Object.entries(CUSTOMIZER_MOD_TO_SETTING_KEY)) {
    const v = modValue(mods, modId);
    if (v) (next as Record<string, unknown>)[settingKey] = v;
  }
  for (const key of CUSTOMIZER_DIRECT_SETTING_KEYS) {
    const v = modValue(mods, key);
    if (v) (next as Record<string, unknown>)[key] = v;
  }
  return next;
}

/** Primary color from customizer mods (Ant Design / CSS). */
export function customizerPrimaryColor(mods: ThemeMods, fallback = '#f44336'): string {
  return modValue(mods, 'primaryColor') ?? fallback;
}

export interface ThemeManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  authorUri?: string;
  tags?: string[];
  screenshot?: string;
  reactpress?: {
    requires?: string;
    templates?: Record<string, string>;
    supports?: Record<string, unknown>;
    /** JSON Schema for site config (`globalSetting.config[themeId]`). */
    configuration?: ThemeConfigurationSchema;
  };
  customizer?: {
    sections: ThemeCustomizerSection[];
  };
}

export type ThemeMods = Record<string, string>;

export interface SiteThemeState {
  activeTheme: string;
  installedThemes: string[];
  mods: Record<string, ThemeMods>;
  /** Theme id shown in customizer preview (may differ from active until publish). */
  previewThemeId?: string;
}

export const DEFAULT_ACTIVE_THEME = 'twentytwentyfive';

export const defaultSiteThemeState: SiteThemeState = {
  activeTheme: DEFAULT_ACTIVE_THEME,
  installedThemes: [DEFAULT_ACTIVE_THEME],
  mods: {},
};

export interface GlobalSettingWithTheme {
  zh?: unknown;
  en?: unknown;
  theme?: SiteThemeState;
  config?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
}

export function parseThemeManifest(raw: unknown): ThemeManifest | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || typeof o.name !== 'string') return null;
  return {
    id: o.id,
    name: o.name,
    version: typeof o.version === 'string' ? o.version : '1.0.0',
    description: typeof o.description === 'string' ? o.description : undefined,
    author: typeof o.author === 'string' ? o.author : undefined,
    authorUri: typeof o.authorUri === 'string' ? o.authorUri : undefined,
    tags: Array.isArray(o.tags) ? o.tags.filter((t): t is string => typeof t === 'string') : undefined,
    screenshot: typeof o.screenshot === 'string' ? o.screenshot : undefined,
    reactpress:
      o.reactpress && typeof o.reactpress === 'object'
        ? (o.reactpress as ThemeManifest['reactpress'])
        : o.configuration && typeof o.configuration === 'object'
          ? {
              configuration: o.configuration as ThemeConfigurationSchema,
            }
          : undefined,
    customizer:
      o.customizer && typeof o.customizer === 'object'
        ? (o.customizer as ThemeManifest['customizer'])
        : undefined,
  };
}

export function getThemeStateFromGlobalSetting(raw: unknown): SiteThemeState {
  if (!raw || typeof raw !== 'object') return { ...defaultSiteThemeState };
  const gs = raw as GlobalSettingWithTheme;
  const theme = gs.theme;
  if (!theme || typeof theme !== 'object') return { ...defaultSiteThemeState };
  return {
    activeTheme:
      typeof theme.activeTheme === 'string' ? theme.activeTheme : defaultSiteThemeState.activeTheme,
    installedThemes: Array.isArray(theme.installedThemes)
      ? theme.installedThemes.filter((id): id is string => typeof id === 'string')
      : [...defaultSiteThemeState.installedThemes],
    mods:
      theme.mods && typeof theme.mods === 'object'
        ? (theme.mods as Record<string, ThemeMods>)
        : {},
    previewThemeId:
      typeof theme.previewThemeId === 'string' ? theme.previewThemeId : undefined,
  };
}

export { resolvePublicAssetUrl } from '../theme/assets';

export {
  PREVIEW_MODS_QUERY_KEY,
  appendPreviewModsToUrl,
  mergePreviewMods,
  parsePreviewModsFromNextCtx,
  parsePreviewModsFromRequestUrl,
  parsePreviewModsParam,
} from '../theme/preview-mods';

export {
  PREVIEW_CONFIG_QUERY_KEY,
  appendPreviewConfigToUrl,
  parsePreviewConfigFromNextCtx,
  parsePreviewConfigFromRequestUrl,
  parsePreviewConfigParam,
} from '../theme/preview-config';

export {
  PREVIEW_TOKEN_QUERY_KEY,
  appendPreviewTokenToUrl,
  parsePreviewTokenFromNextCtx,
  parsePreviewTokenFromRequestUrl,
  type PreviewDraftPayload,
} from '../theme/preview-draft';

export function mergeThemeStateIntoGlobalSetting(
  raw: unknown,
  patch: Partial<SiteThemeState>,
): GlobalSettingWithTheme {
  const base =
    raw && typeof raw === 'object' ? ({ ...(raw as GlobalSettingWithTheme) } as GlobalSettingWithTheme) : {};
  const current = getThemeStateFromGlobalSetting(base);
  base.theme = { ...current, ...patch };
  return base;
}
