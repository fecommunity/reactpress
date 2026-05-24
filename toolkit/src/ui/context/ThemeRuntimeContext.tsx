import React, { createContext, useContext, useMemo } from 'react';
import type { ThemeMods } from '../../extension/theme';
import type { ThemeRuntimeContextValue } from './types';

const ThemeRuntimeContext = createContext<ThemeRuntimeContextValue | null>(null);

export interface ThemeRuntimeProviderProps {
  themeId: string;
  activeThemeId: string;
  mods?: ThemeMods;
  isPreview?: boolean;
  children: React.ReactNode;
}

export function ThemeRuntimeProvider({
  themeId,
  activeThemeId,
  mods = {},
  isPreview = false,
  children,
}: ThemeRuntimeProviderProps) {
  const value = useMemo<ThemeRuntimeContextValue>(
    () => ({
      themeId,
      activeThemeId,
      mods,
      isPreview,
    }),
    [activeThemeId, isPreview, mods, themeId],
  );

  return (
    <ThemeRuntimeContext.Provider value={value}>{children}</ThemeRuntimeContext.Provider>
  );
}

export function useThemeRuntime(): ThemeRuntimeContextValue {
  const ctx = useContext(ThemeRuntimeContext);
  if (!ctx) {
    throw new Error(
      'useThemeRuntime must be used within ReactPressProvider or ThemeRuntimeProvider',
    );
  }
  return ctx;
}

/** Read a single customizer mod with optional default (from `theme.json` customizer). */
export function useThemeMod(modId: string, defaultValue = ''): string {
  const ctx = useContext(ThemeRuntimeContext);
  if (!ctx) return defaultValue;
  return ctx.mods[modId] ?? defaultValue;
}

export function useThemeId(): string {
  return useThemeRuntime().themeId;
}

export function useActiveThemeId(): string {
  return useThemeRuntime().activeThemeId;
}

export function useIsThemePreview(): boolean {
  return useThemeRuntime().isPreview;
}
