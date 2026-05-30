import React, { createContext, useContext, useMemo } from 'react';
import type { ThemeMods } from '../../theme/extension/theme';
import { DEFAULT_SITE_META } from '../../theme/ssr/setting';
import type { ThemeRuntimeContextValue } from './types';

const ThemeRuntimeContext = createContext<ThemeRuntimeContextValue | null>(null);

export interface ThemeRuntimeProviderProps {
  themeId: string;
  activeThemeId: string;
  mods?: ThemeMods;
  isPreview?: boolean;
  siteMeta?: ThemeRuntimeContextValue['siteMeta'];
  children: React.ReactNode;
}

export function ThemeRuntimeProvider({
  themeId,
  activeThemeId,
  mods = {},
  isPreview = false,
  siteMeta = DEFAULT_SITE_META,
  children,
}: ThemeRuntimeProviderProps) {
  const value = useMemo<ThemeRuntimeContextValue>(
    () => ({
      themeId,
      activeThemeId,
      mods,
      isPreview,
      siteMeta,
    }),
    [activeThemeId, isPreview, mods, siteMeta, themeId],
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

const TRUTHY = new Set(['1', 'true', 'yes', 'on']);

/** Checkbox mods are stored as strings (`"1"` / `"0"`). */
export function useThemeModBool(modId: string, defaultValue = false): boolean {
  const raw = useThemeMod(modId, defaultValue ? '1' : '0');
  if (raw === '') return defaultValue;
  return TRUTHY.has(raw.trim().toLowerCase());
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

export function useSiteMeta(): ThemeRuntimeContextValue['siteMeta'] {
  const ctx = useContext(ThemeRuntimeContext);
  return ctx?.siteMeta ?? DEFAULT_SITE_META;
}
