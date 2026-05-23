import { theme } from "antd";
import type { ConfigProviderProps, ThemeConfig } from "antd";

/**
 * Common theme token builders
 * Reduces duplication between light and dark theme definitions
 */

export const SHARED_DESIGN_TOKENS = {
  fontFamily:
    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",

  borderRadius: 8,
  borderRadiusSM: 6,
  borderRadiusLG: 12,
} as const;

export const CONTROL_COMPONENTS = {
  Button: {
    primaryShadow: "none",
    defaultShadow: "none",
    dangerShadow: "none",
  },
  Input: {
    activeShadow: "none",
  },
} as const;

/**
 * Calculate table row selected color based on theme algorithm
 */
export function buildTableTokens(cfg: ThemeConfig) {
  const rowSelectedBg = theme.getDesignToken(cfg).colorFillAlter;
  return {
    rowSelectedBg,
    rowSelectedHoverBg: rowSelectedBg,
  };
}

/**
 * Build menu tokens for light theme
 */
export const MENU_LIGHT = {
  itemSelectedBg: "rgba(0, 0, 0, 0.06)",
  itemSelectedColor: "rgba(0, 0, 0, 0.88)",
  subMenuItemSelectedColor: "rgba(0, 0, 0, 0.88)",
  itemHoverBg: "rgba(0, 0, 0, 0.04)",
  itemHoverColor: "rgba(0, 0, 0, 0.88)",
  itemActiveBg: "rgba(0, 0, 0, 0.08)",
  itemBorderRadius: SHARED_DESIGN_TOKENS.borderRadiusSM,
  itemMarginInline: 8,
  horizontalItemSelectedColor: "rgba(0, 0, 0, 0.88)",
  horizontalItemHoverColor: "rgba(0, 0, 0, 0.88)",
} as const;

/**
 * Build menu tokens for dark theme
 */
export const MENU_DARK = {
  itemSelectedBg: "rgba(255, 255, 255, 0.08)",
  itemSelectedColor: "rgba(255, 255, 255, 0.85)",
  subMenuItemSelectedColor: "rgba(255, 255, 255, 0.85)",
  itemHoverBg: "rgba(255, 255, 255, 0.06)",
  itemHoverColor: "rgba(255, 255, 255, 0.85)",
  itemActiveBg: "rgba(255, 255, 255, 0.1)",
  itemBorderRadius: SHARED_DESIGN_TOKENS.borderRadiusSM,
  itemMarginInline: 8,
  horizontalItemSelectedColor: "rgba(255, 255, 255, 0.85)",
  horizontalItemHoverColor: "rgba(255, 255, 255, 0.85)",
} as const;

/**
 * Build light theme config
 */
export function buildLightThemeConfig(): ConfigProviderProps {
  const lightSeed: ThemeConfig["token"] = {
    colorBgLayout: "#ffffff",
    ...SHARED_DESIGN_TOKENS,
  };

  return {
    theme: {
      algorithm: theme.defaultAlgorithm,
      token: lightSeed,
      components: {
        ...CONTROL_COMPONENTS,
        Table: buildTableTokens({
          algorithm: theme.defaultAlgorithm,
          token: lightSeed,
        }),
        Menu: MENU_LIGHT,
      },
    },
  };
}

/**
 * Build dark theme config
 */
export function buildDarkThemeConfig(): ConfigProviderProps {
  const darkSeed: ThemeConfig["token"] = {
    ...SHARED_DESIGN_TOKENS,
  };

  return {
    theme: {
      algorithm: theme.darkAlgorithm,
      token: darkSeed,
      components: {
        ...CONTROL_COMPONENTS,
        Table: buildTableTokens({
          algorithm: theme.darkAlgorithm,
          token: darkSeed,
        }),
        Menu: MENU_DARK,
      },
    },
  };
}
