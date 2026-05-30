/** WordPress-style theme manifest and site theme state (shared by server / web / themes). */

import type { ThemeConfigurationSchema } from './configuration/types';

export interface ThemeCustomizerChoice {
  value: string;
  label: string;
}

/** WordPress Customizer–style control (declared in `theme.json` → `customizer.sections`). */
export interface ThemeCustomizerSetting {
  id: string;
  type: 'color' | 'text' | 'image' | 'textarea' | 'checkbox' | 'select' | 'noticeList';
  label: string;
  default?: string;
  /** Shown below the control (like WP customize control descriptions). */
  description?: string;
  /** For `type: "select"`. */
  choices?: ThemeCustomizerChoice[];
  /** Sub-group within a section panel (e.g. light vs dark colors). */
  settingGroup?: string;
}

/** Sidebar nav category (基础 / 样式 / 布局). */
export interface ThemeCustomizerGroup {
  id: string;
  title: string;
  description?: string;
}

/** Visual block inside a section detail panel. */
export interface ThemeCustomizerSettingGroup {
  id: string;
  title: string;
  description?: string;
}

export interface ThemeCustomizerSection {
  id: string;
  title: string;
  /** Nav category id (`customizer.groups[].id`). */
  group?: string;
  /** Inline controls; omit when `panel` is set. */
  settings?: ThemeCustomizerSetting[];
  /** Blocks inside the section panel (e.g. 浅色 / 深色). */
  settingGroups?: ThemeCustomizerSettingGroup[];
  /** Inline theme JSON Schema form inside customizer (no separate admin page). */
  panel?: 'configuration';
  description?: string;
}

export interface ThemeCustomizerManifest {
  groups?: ThemeCustomizerGroup[];
  sections: ThemeCustomizerSection[];
}

import {
  applyCustomizerModsToSiteSetting,
  brandingModValue,
  seedThemeModsFromLegacySetting,
  THEME_BRANDING_DIRECT_MODS,
  THEME_BRANDING_MOD_TO_SETTING,
  type ThemeMods,
} from './branding-mods';

export {
  applyCustomizerModsToSiteSetting,
  seedThemeModsFromLegacySetting,
  THEME_BRANDING_DIRECT_MODS,
  THEME_BRANDING_MOD_TO_SETTING,
} from './branding-mods';

/** @deprecated Use THEME_BRANDING_MOD_TO_SETTING */
export const CUSTOMIZER_MOD_TO_SETTING_KEY = THEME_BRANDING_MOD_TO_SETTING;

/** @deprecated Use THEME_BRANDING_DIRECT_MODS */
export const CUSTOMIZER_DIRECT_SETTING_KEYS = THEME_BRANDING_DIRECT_MODS;

export type CustomizerDirectSettingKey = (typeof THEME_BRANDING_DIRECT_MODS)[number];

/** @deprecated Use THEME_BRANDING_DIRECT_MODS */
export const CUSTOMIZER_SITE_SETTING_KEYS = THEME_BRANDING_DIRECT_MODS;

export type CustomizerSiteSettingKey = CustomizerDirectSettingKey;

/**
 * @deprecated Appearance is stored in `globalSetting.theme.mods`; do not PATCH Setting columns.
 */
export function pickCustomizerSiteSettings(mods: ThemeMods): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [modId, settingKey] of Object.entries(THEME_BRANDING_MOD_TO_SETTING)) {
    const v = brandingModValue(mods, modId);
    if (v) out[settingKey] = v;
  }
  for (const key of THEME_BRANDING_DIRECT_MODS) {
    const v = brandingModValue(mods, key);
    if (v) out[key] = v;
  }
  return out;
}

/** @deprecated Use seedThemeModsFromLegacySetting */
export const seedCustomizerModsFromSiteSetting = seedThemeModsFromLegacySetting;

/** Primary color from customizer mods (Ant Design / CSS), light mode. */
export function customizerPrimaryColor(mods: ThemeMods, fallback = '#f44336'): string {
  const v = brandingModValue(mods, 'primaryColor');
  return v && String(v).trim() ? String(v).trim() : fallback;
}

export { customizerPrimaryColorForMode } from './twentytwentyfive-vars';

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
  customizer?: ThemeCustomizerManifest;
}

export type { ThemeMods } from './branding-mods';

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
