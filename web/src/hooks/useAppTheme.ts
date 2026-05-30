import type { ConfigProviderProps } from "antd";
import { useMemo } from "react";

import { useSettingsStore } from "@/stores/settings";

import { buildDarkThemeConfig, buildLightThemeConfig } from "./tokenBuilders";

/**
 * Theme selection for ConfigProvider: light/dark share radius, font, control tweaks.
 * @see https://ant.design/docs/react/customize-theme
 */
export function useAppTheme(): ConfigProviderProps {
  const darkMode = useSettingsStore((s) => s.darkMode);

  return useMemo(() => (darkMode ? buildDarkThemeConfig() : buildLightThemeConfig()), [darkMode]);
}
