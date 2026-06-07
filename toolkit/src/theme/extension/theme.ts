/** WordPress-style theme manifest and site theme state (shared by server / web / themes). */

import type { ThemeConfigurationSchema } from './configuration/types';
import { normalizeAppearance, normalizePlatformFields } from './manifest-normalize';

export interface ThemeAppearanceChoice {
  value: string;
  label: string;
}

/** Appearance control (declared in `theme.json` → `appearance.sections`). */
export interface ThemeAppearanceSetting {
  id: string;
  type: 'color' | 'text' | 'image' | 'textarea' | 'checkbox' | 'select' | 'noticeList';
  label: string;
  default?: string;
  description?: string;
  choices?: ThemeAppearanceChoice[];
  /** Sub-group within a section (e.g. light vs dark colors). */
  group?: string;
}

/** Sidebar nav panel (Site Identity, Colors, …). */
export interface ThemeAppearancePanel {
  id: string;
  title: string;
  description?: string;
}

/** Control group inside a section panel (e.g. Light / Dark). */
export interface ThemeAppearanceGroup {
  id: string;
  title: string;
  description?: string;
}

export interface ThemeAppearanceSection {
  id: string;
  title: string;
  /** Nav panel id (`appearance.panels[].id`). */
  panel?: string;
  settings?: ThemeAppearanceSetting[];
  groups?: ThemeAppearanceGroup[];
  /** Embed the theme `options` schema form instead of inline controls. */
  embed?: 'options';
  description?: string;
}

export interface ThemeAppearanceManifest {
  panels?: ThemeAppearancePanel[];
  sections: ThemeAppearanceSection[];
}

export type { ThemeMods } from './branding-mods';
export {
  applyThemeModsToSiteSetting,
  seedThemeModsFromLegacySetting,
  THEME_BRANDING_DIRECT_MODS,
  THEME_BRANDING_MOD_TO_SETTING,
} from './branding-mods';

import type { ThemeMods } from './branding-mods';
import { appearancePrimaryColorForMode } from './twentytwentyfive-vars';

export { appearancePrimaryColorForMode } from './twentytwentyfive-vars';

/** Primary color from appearance mods (Ant Design / CSS), light mode. */
export function appearancePrimaryColor(mods: ThemeMods, fallback = '#f44336'): string {
  return appearancePrimaryColorForMode(mods, false, fallback);
}

export interface ThemeManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  authorUri?: string;
  themeUri?: string;
  tags?: string[];
  /** Theme cover image path (relative to theme root). Shown in admin theme list / preview. */
  cover?: string;
  requires?: string;
  supports?: Record<string, unknown>;
  templates?: Record<string, string>;
  options?: ThemeConfigurationSchema;
  appearance?: ThemeAppearanceManifest;
}

export interface SiteThemeState {
  activeTheme: string;
  installedThemes: string[];
  mods: Record<string, ThemeMods>;
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

  const platform = normalizePlatformFields(o);
  const appearance = normalizeAppearance(o.appearance);

  return {
    id: o.id,
    name: o.name,
    version: typeof o.version === 'string' ? o.version : '1.0.0',
    description: typeof o.description === 'string' ? o.description : undefined,
    author: typeof o.author === 'string' ? o.author : undefined,
    authorUri: typeof o.authorUri === 'string' ? o.authorUri : undefined,
    themeUri: typeof o.themeUri === 'string' ? o.themeUri : undefined,
    tags: Array.isArray(o.tags) ? o.tags.filter((t): t is string => typeof t === 'string') : undefined,
    cover: typeof o.cover === 'string' ? o.cover : undefined,
    ...platform,
    appearance,
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

export { resolvePublicAssetUrl } from '../content/assets';
export {
  appendPreviewConfigToUrl,
  parsePreviewConfigFromNextCtx,
  parsePreviewConfigFromRequestUrl,
  parsePreviewConfigParam,
  PREVIEW_CONFIG_QUERY_KEY,
} from '../preview/preview-config';
export {
  appendPreviewTokenToUrl,
  parsePreviewTokenFromNextCtx,
  parsePreviewTokenFromRequestUrl,
  PREVIEW_TOKEN_QUERY_KEY,
  type PreviewDraftPayload,
} from '../preview/preview-draft';
export {
  appendPreviewModsToUrl,
  mergePreviewMods,
  parsePreviewModsFromNextCtx,
  parsePreviewModsFromRequestUrl,
  parsePreviewModsParam,
  PREVIEW_MODS_QUERY_KEY,
} from '../preview/preview-mods';

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
