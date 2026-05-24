import { Button, Spin } from "antd";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import {
  getThemeStateFromGlobalSetting,
  type ThemeMods,
} from "@fecommunity/reactpress-toolkit/extension";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useThemePreviewSession } from "@/hooks/useThemePreviewSession";
import { useThemes, useThemeMutations } from "@/hooks/useThemes";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";
import {
  PreviewDeviceToolbar,
  type PreviewDevice,
} from "@/modules/appearance/components/PreviewDeviceToolbar";
import { ThemeCustomizerPanel } from "@/modules/appearance/components/ThemeCustomizerPanel";
import { ThemePreviewFrame } from "@/modules/appearance/components/ThemePreviewFrame";
import { ThemePreviewPaneLoading } from "@/modules/appearance/components/ThemePreviewPaneLoading";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import styles from "@/modules/appearance/components/themes-page.module.css";

const deviceFrameClass: Record<PreviewDevice, string> = {
  desktop: styles.previewFrameWrapDesktop,
  tablet: styles.previewFrameWrapTablet,
  mobile: styles.previewFrameWrapMobile,
};

export function CustomizePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { data: themes, isLoading: themesLoading, isError, refetch: refetchThemes } = useThemes();
  const { modsMutation } = useThemeMutations();

  const themeState = useMemo(() => {
    try {
      const raw = settings?.globalSetting;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return getThemeStateFromGlobalSetting(parsed);
    } catch {
      return getThemeStateFromGlobalSetting(null);
    }
  }, [settings?.globalSetting]);

  const themeId = themeState.previewThemeId ?? themeState.activeTheme;
  const activeTheme = themes?.find((th) => th.id === themeId);
  const siteTitle =
    typeof settings?.systemTitle === "string" ? settings.systemTitle.trim() : undefined;
  const siteDescription =
    typeof settings?.systemSubTitle === "string" ? settings.systemSubTitle.trim() : undefined;

  const savedMods = useMemo(() => themeState.mods[themeId] ?? {}, [themeState.mods, themeId]);
  const [draftMods, setDraftMods] = useState<ThemeMods>(savedMods);
  /** Applied to preview iframe only when user clicks「预览」or after publish. */
  const [previewMods, setPreviewMods] = useState<ThemeMods>(savedMods);

  useEffect(() => {
    void refetchThemes();
  }, [refetchThemes]);

  useEffect(() => {
    setDraftMods(savedMods);
    setPreviewMods(savedMods);
  }, [themeId, savedMods]);

  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const siteUrl = typeof settings?.systemUrl === "string" ? settings.systemUrl.trim() : undefined;
  const {
    ready: previewSessionReady,
    switching: previewSwitching,
    previewSiteUrl,
  } = useThemePreviewSession(themeId, siteUrl, themeState.activeTheme);
  const mayUseLiveSite =
    themeId === themeState.activeTheme
      ? Boolean(
          resolveLiveSitePreviewUrl(siteUrl, {
            themeId,
            activeThemeId: themeState.activeTheme,
            previewSessionReady: true,
          }),
        )
      : true;

  const handleModsChange = (mods: ThemeMods) => {
    setDraftMods(mods);
  };

  const handlePreview = (mods: ThemeMods) => {
    setPreviewMods(mods);
    setPreviewRefreshKey((k) => k + 1);
  };

  const handleSave = async (mods: ThemeMods) => {
    if (!themeId) return;
    await modsMutation.mutateAsync({ themeId, mods });
    setPreviewMods(mods);
    setPreviewRefreshKey((k) => k + 1);
  };

  if (isError) {
    return (
      <ModulePlaceholder
        title={t("placeholder.customize")}
        description={t("appearance.loadError")}
      />
    );
  }

  if (settingsLoading || themesLoading) {
    return <Spin fullscreen />;
  }

  if (!activeTheme) {
    return (
      <ModulePlaceholder
        title={t("placeholder.customize")}
        description={t("appearance.noActiveTheme")}
      />
    );
  }

  return (
    <div className={styles.customizeShell}>
      <aside className={styles.customizeSidebar}>
        <div className={styles.customizeSidebarHeader}>
          <Button
            type="link"
            icon={<ChevronLeft size={14} />}
            className={styles.customizeBack}
            onClick={() => void navigate({ to: "/appearance/themes" })}
          >
            {t("appearance.backToThemes")}
          </Button>
        </div>
        <div className={styles.customizeSidebarScroll}>
          <ThemeCustomizerPanel
            theme={activeTheme}
            siteTitle={siteTitle}
            siteDescription={siteDescription}
            mods={draftMods}
            onModsChange={handleModsChange}
            onPreview={handlePreview}
            onSave={handleSave}
            saving={modsMutation.isPending}
          />
        </div>
        <footer className={styles.customizeSidebarFooter}>
          <PreviewDeviceToolbar
            device={device}
            onDeviceChange={setDevice}
            onRefresh={() => setPreviewRefreshKey((k) => k + 1)}
          />
        </footer>
      </aside>

      <div className={styles.customizePreviewPane}>
        <div className={styles.previewWrap}>
          <div className={`${styles.previewFrameWrap} ${deviceFrameClass[device]}`}>
            {mayUseLiveSite && previewSwitching ? (
              <ThemePreviewPaneLoading themeName={activeTheme.name} />
            ) : (
              <ThemePreviewFrame
                themeId={themeId}
                activeThemeId={themeState.activeTheme}
                mods={previewMods}
                siteUrl={siteUrl}
                title={t("appearance.livePreview")}
                previewSiteUrl={previewSiteUrl}
                previewSessionReady={previewSessionReady}
                refreshKey={
                  previewSessionReady
                    ? `${themeId}-${previewRefreshKey}`
                    : String(previewRefreshKey)
                }
                style={{ minHeight: "100%" }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
