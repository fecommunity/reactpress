import { theme } from "antd";
import type { CSSProperties } from "react";

type ThemeToken = ReturnType<typeof theme.useToken>["token"];

/** Theme-aware CSS variables for dashboard cards and list hovers. */
export function dashboardThemeVars(token: ThemeToken): CSSProperties {
  return {
    "--dash-card-hover-bg": token.colorFillAlter,
    "--dash-card-hover-border": token.colorPrimaryBorder,
    "--dash-card-hover-shadow": token.boxShadowSecondary,
    "--dash-recent-hover-bg": token.colorFillAlter,
    "--dash-chart-hover-border": token.colorBorderSecondary,
    "--dash-comment-divider": token.colorSplit,
  } as CSSProperties;
}
