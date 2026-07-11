import {
  getThemeStateFromGlobalSetting,
  type SiteThemeState,
} from "@fecommunity/reactpress-toolkit/theme";
import { useMemo } from "react";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useThemes } from "@/hooks/useThemes";
import { SITE_SETTING_FIELD_DEFAULTS } from "@/modules/settings/siteSettingDefaults";

/**
 * Theme state from site settings, with `activeThemeId` reconciled against the themes list
 * (themes list updates immediately on activate; globalSetting can lag until refetch).
 */
export function useSiteThemeState(): {
  themeState: SiteThemeState;
  activeThemeId: string;
  siteUrl?: string;
} {
  const { data: settings } = useSiteSettings();
  const { data: themes } = useThemes();

  const themeState = useMemo(() => {
    try {
      const raw = settings?.globalSetting;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return getThemeStateFromGlobalSetting(parsed);
    } catch {
      return getThemeStateFromGlobalSetting(null);
    }
  }, [settings?.globalSetting]);

  const activeThemeId = useMemo(
    () => themes?.find((theme) => theme.active)?.id ?? themeState.activeTheme,
    [themes, themeState.activeTheme],
  );

  const siteUrl =
    (typeof settings?.systemUrl === "string" && settings.systemUrl.trim()) ||
    SITE_SETTING_FIELD_DEFAULTS.systemUrl;

  return { themeState, activeThemeId, siteUrl };
}
