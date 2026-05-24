/** WordPress-style theme manifest and site theme state (shared by server / web / themes). */

export interface ThemeCustomizerSetting {
  id: string;
  type: 'color' | 'text' | 'image' | 'textarea';
  label: string;
  default?: string;
}

export interface ThemeCustomizerSection {
  id: string;
  title: string;
  settings: ThemeCustomizerSetting[];
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
