import type { ThemeMods } from "@fecommunity/reactpress-toolkit/theme";
import { appendPreviewTokenToUrl } from "@fecommunity/reactpress-toolkit/theme";
import { Spin, Typography } from "antd";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { useThemePreviewHtml } from "@/hooks/useThemePreviewHtml";
import styles from "@/modules/appearance/components/themes-page.module.css";
import { createPreviewDraft } from "@/shared/api/themes";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";

type Props = {
  themeId: string;
  activeThemeId: string;
  mods: ThemeMods;
  previewConfiguration?: Record<string, unknown>;
  siteUrl?: string;
  title: string;
  previewSiteUrl?: string;
  previewSessionReady?: boolean;
  preferModsPreview?: boolean;
  refreshKey?: string;
  className?: string;
  style?: CSSProperties;
};

export function ThemePreviewFrame({
  themeId,
  activeThemeId,
  mods,
  previewConfiguration,
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
  const configKey = JSON.stringify(previewConfiguration ?? {});

  const liveBase =
    !preferModsPreview &&
    resolveLiveSitePreviewUrl(siteUrl, {
      themeId,
      activeThemeId,
      previewSiteUrl,
      previewSessionReady,
    });

  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const [liveUrlLoading, setLiveUrlLoading] = useState(Boolean(liveBase));
  const [liveUrlError, setLiveUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (!liveBase) {
      setLiveUrl(null);
      setLiveUrlLoading(false);
      setLiveUrlError(null);
      return;
    }

    let cancelled = false;
    setLiveUrlLoading(true);
    setLiveUrlError(null);

    void createPreviewDraft({
      themeId,
      mods,
      configuration: previewConfiguration,
    })
      .then(({ token }) => {
        if (cancelled) return;
        setLiveUrl(appendPreviewTokenToUrl(liveBase, token));
      })
      .catch((e) => {
        if (cancelled) return;
        setLiveUrlError(e instanceof Error ? e.message : "Preview failed");
        setLiveUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLiveUrlLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [liveBase, modsKey, configKey, refreshKey]);

  const {
    html: previewHtml,
    loading: previewLoading,
    error: previewError,
  } = useThemePreviewHtml(liveUrl ? undefined : themeId, mods);

  if (liveBase) {
    if (liveUrlError) {
      return (
        <Typography.Text type="danger" style={{ padding: 16 }}>
          {liveUrlError}
        </Typography.Text>
      );
    }
    if (liveUrlLoading || !liveUrl) {
      return (
        <div className={styles.previewFrameLoading}>
          <Spin size="large" />
        </div>
      );
    }
    return (
      <iframe
        key={liveUrl}
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
    return (
      <div className={styles.previewFrameLoading}>
        <Spin size="large" />
      </div>
    );
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
