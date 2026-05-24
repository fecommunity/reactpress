import type { CSSProperties } from "react";
import { useMemo } from "react";
import { Spin, Typography } from "antd";
import type { ThemeMods } from "@fecommunity/reactpress-toolkit/extension";
import { useThemePreviewHtml } from "@/hooks/useThemePreviewHtml";
import { canUseLiveSitePreview, resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";
import styles from "@/modules/appearance/components/themes-page.module.css";

type Props = {
  themeId: string;
  activeThemeId: string;
  mods: ThemeMods;
  siteUrl?: string;
  title: string;
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
  refreshKey,
  className,
  style,
}: Props) {
  const liveUrl = useMemo(() => {
    if (!canUseLiveSitePreview(themeId, activeThemeId, siteUrl)) return null;
    return resolveLiveSitePreviewUrl(siteUrl);
  }, [themeId, activeThemeId, siteUrl]);

  const {
    html: previewHtml,
    loading: previewLoading,
    error: previewError,
  } = useThemePreviewHtml(liveUrl ? undefined : themeId, mods);

  if (liveUrl) {
    return (
      <iframe
        key={refreshKey ?? liveUrl}
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
