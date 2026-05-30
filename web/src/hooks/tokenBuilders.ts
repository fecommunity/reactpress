import type { ConfigProviderProps, ThemeConfig } from "antd";
import { theme } from "antd";

import { WP_ADMIN } from "./wpAdminTokens";

/**
 * Common theme token builders
 * Reduces duplication between light and dark theme definitions
 */

export const SHARED_DESIGN_TOKENS = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",

  borderRadius: 2,
  borderRadiusSM: 2,
  borderRadiusLG: 4,
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

/** WordPress admin sidebar (always dark). */
export const MENU_WP_SIDEBAR = {
  darkItemBg: WP_ADMIN.sidebarBg,
  darkSubMenuItemBg: WP_ADMIN.sidebarSubmenuBg,
  darkItemSelectedBg: WP_ADMIN.accentBlue,
  darkItemSelectedColor: "#fff",
  darkItemColor: WP_ADMIN.adminBarText,
  darkItemHoverBg: WP_ADMIN.sidebarSubmenuBg,
  darkItemHoverColor: "#72aee6",
  itemBorderRadius: 0,
  itemMarginInline: 0,
  itemMarginBlock: 0,
  itemHeight: 34,
  subMenuItemBg: WP_ADMIN.sidebarSubmenuBg,
} as const;

/**
 * Build light theme config
 */
export function buildLightThemeConfig(): ConfigProviderProps {
  const lightSeed: ThemeConfig["token"] = {
    colorPrimary: WP_ADMIN.accentBlue,
    colorLink: WP_ADMIN.accentBlue,
    colorLinkHover: WP_ADMIN.accentBlueHover,
    colorBgLayout: WP_ADMIN.contentBg,
    colorBgContainer: "#ffffff",
    colorBorder: WP_ADMIN.borderColor,
    colorBorderSecondary: WP_ADMIN.borderColor,
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
        Menu: { ...MENU_LIGHT, ...MENU_WP_SIDEBAR },
      },
    },
  };
}

/**
 * Build dark theme config
 */
export function buildDarkThemeConfig(): ConfigProviderProps {
  const darkSeed: ThemeConfig["token"] = {
    colorPrimary: WP_ADMIN.accentBlue,
    colorLink: "#72aee6",
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
        Menu: { ...MENU_DARK, ...MENU_WP_SIDEBAR },
      },
    },
  };
}
