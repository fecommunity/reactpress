import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useThemeModBool } from '@fecommunity/reactpress-toolkit/theme';
import {
  type ColorScheme,
  persistColorScheme,
  readStoredColorScheme,
} from '../lib/preferences/color-scheme';

interface ColorSchemeContextValue {
  scheme: ColorScheme;
  isDark: boolean;
  setScheme: (next: ColorScheme) => void;
  toggleScheme: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

const SCHEME_SURFACE: Record<ColorScheme, { body: string; layout: string }> = {
  dark: { body: '#1e2a36', layout: '#1e2a36' },
  light: { body: '#e7eaee', layout: '#e7eaee' },
};

function resolveInitialScheme(adminPrefersDark: boolean): ColorScheme {
  return adminPrefersDark ? 'dark' : 'light';
}

/** Overrides toolkit ThemeCssVars so visitor toggle controls page chrome. */
function ColorSchemeSurfaceStyles({ scheme }: { scheme: ColorScheme }) {
  const { body, layout } = SCHEME_SURFACE[scheme];
  const css = `
    html[data-color-scheme='${scheme}'],
    html[data-color-scheme='${scheme}'] body {
      background-color: ${body} !important;
      color-scheme: ${scheme};
    }
    html[data-color-scheme='${scheme}'] [data-rp-component='layout'].theme-gaoredu,
    html[data-color-scheme='${scheme}'] [data-rp-component='main'],
    html[data-color-scheme='${scheme}'] .theme-gaoredu[data-rp-component='layout'] {
      background-color: ${layout} !important;
      width: 100%;
      max-width: none;
    }
  `;
  return <style data-rp-part="color-scheme-surface" dangerouslySetInnerHTML={{ __html: css }} />;
}

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const adminPrefersDark = useThemeModBool('darkMode', true);
  const [scheme, setSchemeState] = useState<ColorScheme>(() =>
    resolveInitialScheme(adminPrefersDark),
  );

  useEffect(() => {
    const stored = readStoredColorScheme();
    if (stored) setSchemeState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-color-scheme', scheme);
    return () => document.documentElement.removeAttribute('data-color-scheme');
  }, [scheme]);

  const setScheme = useCallback((next: ColorScheme) => {
    setSchemeState(next);
    persistColorScheme(next);
  }, []);

  const toggleScheme = useCallback(() => {
    setScheme(scheme === 'dark' ? 'light' : 'dark');
  }, [scheme, setScheme]);

  const value = useMemo<ColorSchemeContextValue>(
    () => ({
      scheme,
      isDark: scheme === 'dark',
      setScheme,
      toggleScheme,
    }),
    [scheme, setScheme, toggleScheme],
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      <ColorSchemeSurfaceStyles scheme={scheme} />
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider');
  }
  return ctx;
}
