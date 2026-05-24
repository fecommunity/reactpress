import type React from 'react';
import type { ThemeMods } from '../../extension/theme';
import type { LocaleCatalog, LocaleMessages } from '../../theme/locale';
import type { SiteMeta } from '../../theme/setting';

export interface LocaleContextValue {
  locale: string;
  locales: string[];
  messages: LocaleMessages;
  catalog: LocaleCatalog;
  setLocale: (next: string) => void;
  t: (key: string, fallback?: string) => string;
}

export interface ThemeRuntimeContextValue {
  themeId: string;
  activeThemeId: string;
  mods: ThemeMods;
  isPreview: boolean;
  siteMeta: SiteMeta;
}

export interface ReactPressProviderProps {
  locale: string;
  locales: string[];
  messages: LocaleMessages;
  catalog?: LocaleCatalog;
  themeId: string;
  activeThemeId: string;
  mods?: ThemeMods;
  isPreview?: boolean;
  siteMeta?: SiteMeta;
  children: React.ReactNode;
  /** Persist locale in `localStorage` (browser only). */
  persistLocale?: boolean;
  onLocaleChange?: (locale: string) => void;
}
