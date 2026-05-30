import { theme } from "antd";
import type { CSSProperties } from "react";

type ThemeToken = ReturnType<typeof theme.useToken>["token"];

/** Theme-aware CSS variables for admin list pages (light/dark). */
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
    "--article-list-row-hover": token.colorFillAlter,
    "--article-list-row-selected": token.colorPrimaryBg,
    "--article-list-header-bg": token.colorFillAlter,
    "--article-list-header-text": token.colorTextSecondary,
    "--article-list-avatar-bg": token.colorFillSecondary,
    "--article-list-avatar-text": token.colorTextSecondary,
    "--article-list-count-badge-bg": token.colorFillSecondary,
    "--article-list-count-badge-text": token.colorTextLightSolid,
    "--comment-pending-bg": token.colorWarningBg,
    "--comment-pending-accent": token.colorWarning,
    "--comment-pending-border": token.colorWarningBorder,
    "--comment-pending-indicator": token.colorError,
  } as CSSProperties;
}
