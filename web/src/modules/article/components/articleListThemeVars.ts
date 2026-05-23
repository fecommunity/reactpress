import { theme } from "antd";
import type { CSSProperties } from "react";

type ThemeToken = ReturnType<typeof theme.useToken>["token"];

/** Theme-aware CSS variables for WordPress-style article list (light/dark). */
export function articleListThemeVars(token: ThemeToken): CSSProperties {
  return {
    "--article-list-text": token.colorText,
    "--article-list-muted": token.colorTextSecondary,
    "--article-list-border": token.colorBorderSecondary,
    "--article-list-bg": token.colorBgContainer,
    "--article-list-link": token.colorLink,
    "--article-list-link-hover": token.colorLinkHover,
    "--article-list-danger": token.colorError,
    "--article-list-danger-hover": token.colorErrorHover,
    "--article-list-separator": token.colorBorder,
    "--article-list-radius": `${token.borderRadius}px`,
  } as CSSProperties;
}
