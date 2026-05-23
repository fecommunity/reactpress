import { theme } from "antd";
import type { CSSProperties } from "react";

type ThemeToken = ReturnType<typeof theme.useToken>["token"];

export function mediaListThemeVars(token: ThemeToken): CSSProperties {
  return {
    "--media-list-text": token.colorText,
    "--media-list-muted": token.colorTextSecondary,
    "--media-list-border": token.colorBorderSecondary,
    "--media-list-bg": token.colorBgContainer,
    "--media-list-link": token.colorLink,
    "--media-list-link-hover": token.colorLinkHover,
    "--media-list-danger": token.colorError,
    "--media-list-danger-hover": token.colorErrorHover,
    "--media-list-separator": token.colorBorder,
    "--media-list-radius": `${token.borderRadius}px`,
    "--media-list-accent": token.colorPrimary,
  } as CSSProperties;
}
