import type { SiteThemeState, ThemeMods } from '../extension/theme';
import { getThemeStateFromGlobalSetting } from '../extension/theme';

export interface ThemeRuntime {
  /** Theme package id (from `theme.json` or env). */
  themeId: string;
  /** Published active theme on the site. */
  activeThemeId: string;
  /** Customizer values for `themeId`. */
  mods: ThemeMods;
  /** `previewThemeId` differs from `activeThemeId` in customizer preview. */
  isPreview: boolean;
  themeState: SiteThemeState;
}

export interface ResolveThemeRuntimeOptions {
  themeId: string;
  /** When true (default), use `previewThemeId` from global settings when set. */
  honorPreview?: boolean;
}

export function resolveThemeRuntime(
  globalSettingRaw: unknown,
  options: ResolveThemeRuntimeOptions,
): ThemeRuntime {
  const themeState = getThemeStateFromGlobalSetting(globalSettingRaw);
  const activeThemeId = themeState.activeTheme;
  const previewId = themeState.previewThemeId;
  const honorPreview = options.honorPreview !== false;
  const effectiveId =
    honorPreview && previewId ? previewId : options.themeId || activeThemeId;
  const isPreview = Boolean(previewId && previewId !== activeThemeId);

  return {
    themeId: effectiveId,
    activeThemeId,
    mods: themeState.mods[effectiveId] ?? {},
    isPreview,
    themeState,
  };
}
