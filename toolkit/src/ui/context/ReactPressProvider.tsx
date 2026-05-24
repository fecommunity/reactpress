import React from 'react';
import { LocaleProvider } from './LocaleContext';
import { ThemeRuntimeProvider } from './ThemeRuntimeContext';
import type { ReactPressProviderProps } from './types';

/** Wraps the theme app with locale + active theme / customizer context. */
export function ReactPressProvider({
  locale,
  locales,
  messages,
  catalog = {},
  themeId,
  activeThemeId,
  mods = {},
  isPreview = false,
  siteMeta,
  children,
  persistLocale = true,
  onLocaleChange,
}: ReactPressProviderProps) {
  return (
    <LocaleProvider
      locale={locale}
      locales={locales}
      messages={messages}
      catalog={catalog}
      persistLocale={persistLocale}
      onLocaleChange={onLocaleChange}
    >
      <ThemeRuntimeProvider
        themeId={themeId}
        activeThemeId={activeThemeId}
        mods={mods}
        isPreview={isPreview}
        siteMeta={siteMeta}
      >
        {children}
      </ThemeRuntimeProvider>
    </LocaleProvider>
  );
}
