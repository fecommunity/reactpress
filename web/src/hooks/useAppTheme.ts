import { useMemo } from "react";
import type { ConfigProviderProps } from "antd";
import { buildLightThemeConfig, buildDarkThemeConfig } from "./tokenBuilders";
import { useSettingsStore } from "@/stores/settings";

/**
 * Theme selection for ConfigProvider: light/dark share radius, font, control tweaks.
 * @see https://ant.design/docs/react/customize-theme
 */
export function useAppTheme(): ConfigProviderProps {
  const darkMode = useSettingsStore((s) => s.darkMode);

  return useMemo(() => (darkMode ? buildDarkThemeConfig() : buildLightThemeConfig()), [darkMode]);
}
