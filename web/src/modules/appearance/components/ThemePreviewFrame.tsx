import type { CSSProperties } from "react";
import { useMemo } from "react";
import { Spin, Typography } from "antd";
import type { ThemeMods } from "@fecommunity/reactpress-toolkit/extension";
import { useThemePreviewHtml } from "@/hooks/useThemePreviewHtml";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";
import styles from "@/modules/appearance/components/themes-page.module.css";

type Props = {
  themeId: string;
  activeThemeId: string;
  mods: ThemeMods;
  siteUrl?: string;
  title: string;
  /** Local preview dev URL when themeId ≠ activeThemeId (see useThemePreviewSession). */
  previewSiteUrl?: string;
  previewSessionReady?: boolean;
  /** Fallback stub HTML when live site is unavailable (MSW / no visitor site). */
  preferModsPreview?: boolean;
  refreshKey?: string;
  className?: string;
  style?: CSSProperties;
};

export function ThemePreviewFrame({
  themeId,
  activeThemeId,
  mods,
  siteUrl,
  title,
  previewSiteUrl,
  previewSessionReady = false,
  preferModsPreview = false,
  refreshKey,
  className,
  style,
}: Props) {
  const modsKey = JSON.stringify(mods);

  const liveUrl = useMemo(() => {
    if (preferModsPreview) return null;
    if (preferModsPreview) return null;
    return resolveLiveSitePreviewUrl(siteUrl, {
      themeId,
      activeThemeId,
      previewSiteUrl,
      previewSessionReady,
    });
  }, [preferModsPreview, themeId, activeThemeId, siteUrl, previewSiteUrl, previewSessionReady]);

  const {
    html: previewHtml,
    loading: previewLoading,
    error: previewError,
  } = useThemePreviewHtml(liveUrl ? undefined : themeId, mods);

  if (liveUrl) {
    return (
      <iframe
        key={refreshKey ? `${liveUrl}-${refreshKey}` : liveUrl}
        className={className ?? styles.previewFrame}
        style={style}
        title={title}
        data-testid="theme-preview-frame"
        data-preview-mode="live"
        src={liveUrl}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    );
  }

  if (previewError) {
    return (
      <Typography.Text type="danger" style={{ padding: 16 }}>
        {previewError}
      </Typography.Text>
    );
  }

  if (previewLoading || !previewHtml) {
    return <Spin style={{ margin: 48 }} />;
  }

  return (
    <iframe
      key={refreshKey ? `${modsKey}-${refreshKey}` : modsKey}
      className={className ?? styles.previewFrame}
      style={style}
      title={title}
      data-testid="theme-preview-frame"
      data-preview-mode="stub"
      srcDoc={previewHtml}
      sandbox="allow-same-origin"
    />
  );
}
