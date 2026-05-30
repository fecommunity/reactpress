import { getThemeStateFromGlobalSetting } from "@fecommunity/reactpress-toolkit/extension";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Spin } from "antd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useThemeListItemMeta } from "@/hooks/useThemeListItemMeta";
import { useThemePreviewSession } from "@/hooks/useThemePreviewSession";
import { useThemeMutations, useThemes } from "@/hooks/useThemes";
import { ThemePreviewFrame } from "@/modules/appearance/components/ThemePreviewFrame";
import { ThemePreviewPaneLoading } from "@/modules/appearance/components/ThemePreviewPaneLoading";
import styles from "@/modules/appearance/components/themes-page.module.css";
import { resolveLiveSitePreviewUrl } from "@/shared/theme/previewUrl";

export function ThemePreviewPage({ themeIdFromSearch }: { themeIdFromSearch?: string }) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { data: themes, isLoading } = useThemes();
  const { data: settings } = useSiteSettings();
  const { installMutation, activateMutation } = useThemeMutations();

  const themeState = useMemo(() => {
    try {
      const raw = settings?.globalSetting;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return getThemeStateFromGlobalSetting(parsed);
    } catch {
      return getThemeStateFromGlobalSetting(null);
    }
  }, [settings?.globalSetting]);

  const list = themes ?? [];
  const currentIndex = Math.max(
    0,
    list.findIndex((th) => th.id === (themeIdFromSearch ?? themeState.activeTheme)),
  );
  const current = list[currentIndex];
  const { description, tags } = useThemeListItemMeta(current);
  const canSwitchTheme = list.length > 1;

  const previewMods = current?.id ? (themeState.mods[current.id] ?? {}) : {};
  const siteUrl = typeof settings?.systemUrl === "string" ? settings.systemUrl.trim() : undefined;
  const {
    ready: previewSessionReady,
    switching: previewSwitching,
    previewSiteUrl,
  } = useThemePreviewSession(current?.id, siteUrl, themeState.activeTheme);
  const isLivePreview = current?.id
    ? Boolean(
        resolveLiveSitePreviewUrl(siteUrl, {
          themeId: current.id,
          activeThemeId: themeState.activeTheme,
          previewSiteUrl,
          previewSessionReady,
        }),
      )
    : false;
  const mayUseLiveSite =
    current?.id === themeState.activeTheme
      ? Boolean(
          resolveLiveSitePreviewUrl(siteUrl, {
            themeId: current.id,
            activeThemeId: themeState.activeTheme,
            previewSessionReady: true,
          }),
        )
      : true;

  const goTo = (index: number) => {
    const next = list[index];
    if (!next) return;
    void navigate({ to: "/appearance/themes/preview", search: { theme: next.id } });
  };

  const handleInstall = async () => {
    if (!current) return;
    try {
      await installMutation.mutateAsync(current.id);
      message.success(t("appearance.installSuccessHint"), 6);
    } catch {
      message.error(t("appearance.actionFailed"));
    }
  };

  const handleActivate = async () => {
    if (!current) return;
    try {
      const state = await activateMutation.mutateAsync(current.id);
      const activatedSiteUrl =
        typeof state === "object" && state && "siteUrl" in state
          ? String((state as { siteUrl?: string }).siteUrl ?? "")
          : "";
      message.success(
        activatedSiteUrl
          ? t("appearance.activateSuccessWithSite", { url: activatedSiteUrl })
          : t("appearance.activateSuccess"),
      );
    } catch {
      message.error(t("appearance.actionFailed"));
    }
  };

  if (isLoading || !current) {
    return <Spin fullscreen />;
  }

  return (
    <div className={styles.previewShell}>
      <aside className={styles.previewSidebar}>
        <div className={styles.previewSidebarHeader}>
          <Button
            type="link"
            icon={<ChevronLeft size={14} />}
            className={styles.customizeBack}
            onClick={() => void navigate({ to: "/appearance/themes" })}
          >
            {t("appearance.backToThemes")}
          </Button>
        </div>

        <div className={styles.previewSidebarScroll}>
          {canSwitchTheme ? (
            <div
              className={styles.previewSidebarNav}
              role="toolbar"
              aria-label={t("appearance.previewPanelTitle")}
            >
              <button
                type="button"
                className={styles.sidebarToolBtn}
                disabled={currentIndex <= 0}
                aria-label={t("appearance.prevTheme")}
                onClick={() => goTo(currentIndex - 1)}
              >
                <ChevronLeft size={16} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.sidebarToolBtn}
                disabled={currentIndex >= list.length - 1}
                aria-label={t("appearance.nextTheme")}
                onClick={() => goTo(currentIndex + 1)}
              >
                <ChevronRight size={16} aria-hidden />
              </button>
              <span className={styles.previewThemeIndex}>
                {currentIndex + 1} / {list.length}
              </span>
            </div>
          ) : null}

          <div className={styles.previewSidebarMeta}>
            <span className={styles.sidebarMuted}>{t("appearance.previewPanelTitle")}</span>

            <div className={styles.previewBadgeRow}>
              {current.active ? (
                <span className={styles.previewActiveBadge}>{t("appearance.activeTheme")}</span>
              ) : null}
              <span className={styles.previewStatusBadge}>
                {current.installed ? t("appearance.installed") : t("appearance.notInstalled")}
              </span>
            </div>

            <h2 className={styles.previewSidebarTitle}>{current.name}</h2>

            {current.author ? (
              <span className={styles.sidebarMuted}>
                {t("appearance.author", { author: current.author })}
              </span>
            ) : null}
            <span className={styles.sidebarMuted} style={{ marginTop: 8 }}>
              {t("appearance.version", { version: current.version })}
            </span>
            {description ? (
              <p className={styles.sidebarBody} style={{ margin: "12px 0" }}>
                {description}
              </p>
            ) : null}
            {tags.length > 0 ? (
              <div className={styles.previewFeatureTags}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.featureTag}>
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <span className={styles.sidebarHint}>
              {previewSwitching
                ? t("appearance.previewSwitchingSidebar")
                : isLivePreview
                  ? t("appearance.previewLiveHint")
                  : t("appearance.previewStubHint")}
            </span>
          </div>
        </div>

        <div className={styles.previewSidebarActions}>
          {!current.installed ? (
            <Button
              type="primary"
              block
              loading={installMutation.isPending}
              onClick={() => void handleInstall()}
            >
              {t("appearance.install")}
            </Button>
          ) : null}
          {!current.active && current.installed ? (
            <Button
              type="primary"
              block
              loading={activateMutation.isPending}
              onClick={() => void handleActivate()}
            >
              {t("appearance.activate")}
            </Button>
          ) : null}
          {current.installed && !current.active ? (
            <Button block onClick={() => void handleInstall()} loading={installMutation.isPending}>
              {t("appearance.reinstall")}
            </Button>
          ) : null}
          {current.active ? (
            <Button
              type="primary"
              block
              onClick={() => void navigate({ to: "/appearance/customize" })}
            >
              {t("appearance.customize")}
            </Button>
          ) : null}
        </div>
      </aside>

      <div className={styles.previewMain}>
        {mayUseLiveSite && previewSwitching ? (
          <ThemePreviewPaneLoading themeName={current.name} />
        ) : (
          <ThemePreviewFrame
            themeId={current.id}
            activeThemeId={themeState.activeTheme}
            mods={previewMods}
            siteUrl={siteUrl}
            title={current.name}
            previewSiteUrl={previewSiteUrl}
            previewSessionReady={previewSessionReady}
            refreshKey={previewSessionReady ? current.id : undefined}
            style={{ flex: 1, minHeight: 0, height: "100%" }}
          />
        )}
      </div>
    </div>
  );
}
