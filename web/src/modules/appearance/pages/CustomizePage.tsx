import { getThemeConfigurationSeed, type ThemeMods } from "@fecommunity/reactpress-toolkit/theme";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Spin } from "antd";
import { ChevronLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useSiteThemeState } from "@/hooks/useSiteThemeState";
import {
  useThemeConfiguration,
  useThemeConfigurationMutation,
  useThemeConfigurationSchema,
} from "@/hooks/useThemeConfiguration";
import { useThemePreviewSession } from "@/hooks/useThemePreviewSession";
import { useThemeMutations, useThemes } from "@/hooks/useThemes";
import {
  type PreviewDevice,
  PreviewDeviceToolbar,
} from "@/modules/appearance/components/PreviewDeviceToolbar";
import { ThemeAppearancePanel } from "@/modules/appearance/components/ThemeAppearancePanel";
import {
  ThemeConfigurationForm,
  type ThemeConfigurationFormHandle,
} from "@/modules/appearance/components/ThemeConfigurationForm";
import { ThemePreviewFrame } from "@/modules/appearance/components/ThemePreviewFrame";
import { ThemePreviewPaneLoading } from "@/modules/appearance/components/ThemePreviewPaneLoading";
import styles from "@/modules/appearance/components/themes-page.module.css";
import { ThemeAdminLocaleProvider } from "@/modules/appearance/context/ThemeAdminLocaleContext";
import { Route } from "@/routes/_auth/appearance/customize/index";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { buildClearThemeModsPayload } from "@/shared/theme/clearThemeMods";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";

const deviceFrameClass: Record<PreviewDevice, string> = {
  desktop: styles.previewFrameWrapDesktop,
  tablet: styles.previewFrameWrapTablet,
  mobile: styles.previewFrameWrapMobile,
};

export function CustomizePage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { section: initialSection } = Route.useSearch();
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const { themeState, activeThemeId, siteUrl: resolvedSiteUrl } = useSiteThemeState();
  const { data: themes, isLoading: themesLoading, isError, refetch: refetchThemes } = useThemes();
  const { modsMutation } = useThemeMutations();
  const configFormRef = useRef<ThemeConfigurationFormHandle>(null);

  const themeId = themeState.previewThemeId ?? activeThemeId;
  const { data: schemaData, isLoading: schemaLoading } = useThemeConfigurationSchema(themeId);
  const { data: configData, isLoading: configLoading } = useThemeConfiguration(themeId);
  const saveConfigMutation = useThemeConfigurationMutation(themeId);
  const activeTheme = themes?.find((th) => th.id === themeId);

  const savedMods = useMemo(() => themeState.mods[themeId] ?? {}, [themeState.mods, themeId]);
  const savedConfiguration = configData?.configuration ?? {};

  const [draftMods, setDraftMods] = useState<ThemeMods>(savedMods);
  const siteTitle =
    draftMods.displayTitle?.trim() ||
    (typeof settings?.systemTitle === "string" ? settings.systemTitle.trim() : undefined);
  const siteDescription =
    draftMods.displayTagline?.trim() ||
    (typeof settings?.systemSubTitle === "string" ? settings.systemSubTitle.trim() : undefined);
  /** Shown in iframe only after「预览」or「发布」. */
  const [previewMods, setPreviewMods] = useState<ThemeMods>(savedMods);

  const [draftConfiguration, setDraftConfiguration] =
    useState<Record<string, unknown>>(savedConfiguration);
  const [previewConfiguration, setPreviewConfiguration] =
    useState<Record<string, unknown>>(savedConfiguration);

  useEffect(() => {
    void refetchThemes();
  }, [refetchThemes]);

  useEffect(() => {
    setDraftMods(savedMods);
    setPreviewMods(savedMods);
  }, [themeId, savedMods]);

  useEffect(() => {
    setDraftConfiguration(savedConfiguration);
    setPreviewConfiguration(savedConfiguration);
  }, [themeId, JSON.stringify(savedConfiguration)]);

  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const siteUrl = resolvedSiteUrl;
  const {
    ready: previewSessionReady,
    switching: previewSwitching,
    previewSiteUrl,
    activeThemeId: previewActiveThemeId,
  } = useThemePreviewSession(themeId, siteUrl, activeThemeId);
  const effectiveActiveThemeId = previewActiveThemeId ?? activeThemeId;
  const mayUseLiveSite =
    themeId === effectiveActiveThemeId
      ? Boolean(
          resolveLiveSitePreviewUrl(siteUrl, {
            themeId,
            activeThemeId: effectiveActiveThemeId,
            previewSessionReady: true,
          }),
        )
      : true;

  const bumpPreview = () => setPreviewRefreshKey((k) => k + 1);

  const handleModsChange = (mods: ThemeMods) => {
    setDraftMods(mods);
  };

  const handlePreview = (mods: ThemeMods) => {
    setPreviewMods(mods);
    bumpPreview();
  };

  const handlePreviewConfiguration = () => {
    const fromForm = configFormRef.current?.getValues();
    const values = fromForm && Object.keys(fromForm).length > 0 ? fromForm : draftConfiguration;
    setDraftConfiguration(values);
    setPreviewConfiguration(values);
    bumpPreview();
  };

  const handleSave = async (mods: ThemeMods) => {
    if (!themeId) return;
    await modsMutation.mutateAsync({ themeId, mods });
    setDraftMods(mods);
    setPreviewMods(mods);
    bumpPreview();
  };

  const handleSaveConfiguration = async () => {
    const values = configFormRef.current?.getValues() ?? draftConfiguration;
    await saveConfigMutation.mutateAsync({ configuration: values });
    setDraftConfiguration(values);
    setPreviewConfiguration(values);
    bumpPreview();
  };

  const configLocale = useMemo(() => {
    try {
      const raw = settings?.globalSetting;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed === "object" && "zh" in parsed) return "zh";
      if (parsed && typeof parsed === "object" && "en" in parsed) return "en";
    } catch {
      /* ignore */
    }
    return "zh";
  }, [settings?.globalSetting]);

  const handleRestoreMods = async () => {
    if (!themeId || !activeTheme) return;
    try {
      const payload = buildClearThemeModsPayload(savedMods, activeTheme);
      await modsMutation.mutateAsync({ themeId, mods: payload });
      setDraftMods({});
      setPreviewMods({});
      bumpPreview();
      message.success(t("appearance.restoreSystemDefaultsSuccess"));
    } catch {
      message.error(t("appearance.actionFailed"));
      throw new Error("restore mods failed");
    }
  };

  const handleRestoreConfiguration = async () => {
    if (!themeId) return;
    try {
      const seed = getThemeConfigurationSeed(themeId, configLocale) ?? {};
      const data = await saveConfigMutation.mutateAsync({
        configuration: seed,
        replace: true,
      });
      setDraftConfiguration(data.configuration);
      setPreviewConfiguration(data.configuration);
      bumpPreview();
      message.success(t("appearance.restoreSystemDefaultsSuccess"));
    } catch {
      message.error(t("appearance.actionFailed"));
      throw new Error("restore configuration failed");
    }
  };

  if (isError) {
    return (
      <ModulePlaceholder
        title={t("placeholder.customize")}
        description={t("appearance.loadError")}
      />
    );
  }

  if (settingsLoading || themesLoading || schemaLoading || configLoading) {
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
    <ThemeAdminLocaleProvider themeId={themeId}>
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
            <ThemeAppearancePanel
              theme={activeTheme}
              siteTitle={siteTitle}
              siteDescription={siteDescription}
              siteSettingSeed={settings ?? undefined}
              initialSectionId={initialSection ?? null}
              optionsPanel={
                schemaData?.schema != null ? (
                  <ThemeConfigurationForm
                    ref={configFormRef}
                    embedded
                    deferActions
                    schema={schemaData.schema}
                    configuration={savedConfiguration}
                    saving={saveConfigMutation.isPending}
                    onDraftChange={setDraftConfiguration}
                    onSave={handleSaveConfiguration}
                  />
                ) : undefined
              }
              mods={draftMods}
              savedMods={savedMods}
              onModsChange={handleModsChange}
              onPreview={handlePreview}
              onSave={handleSave}
              saving={modsMutation.isPending}
              onPreviewOptions={handlePreviewConfiguration}
              onSaveOptions={handleSaveConfiguration}
              savingOptions={saveConfigMutation.isPending}
              onRestoreMods={handleRestoreMods}
              onRestoreOptions={handleRestoreConfiguration}
              restoring={modsMutation.isPending || saveConfigMutation.isPending}
            />
          </div>
          <footer className={styles.customizeSidebarFooter}>
            <PreviewDeviceToolbar
              device={device}
              onDeviceChange={setDevice}
              onRefresh={bumpPreview}
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
                  activeThemeId={effectiveActiveThemeId}
                  mods={previewMods}
                  previewConfiguration={previewConfiguration}
                  siteUrl={siteUrl}
                  title={t("appearance.livePreview")}
                  previewSiteUrl={previewSiteUrl}
                  previewSessionReady={previewSessionReady}
                  refreshKey={
                    previewSessionReady
                      ? `${themeId}-${effectiveActiveThemeId}-${previewRefreshKey}`
                      : String(previewRefreshKey)
                  }
                  style={{ minHeight: "100%" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </ThemeAdminLocaleProvider>
  );
}
