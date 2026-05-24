import { App, Button, Spin, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { getThemeStateFromGlobalSetting } from "@fecommunity/reactpress-toolkit/extension";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useThemes, useThemeMutations } from "@/hooks/useThemes";
import { ThemePreviewFrame } from "@/modules/appearance/components/ThemePreviewFrame";
import { canUseLiveSitePreview } from "@/shared/theme/previewUrl";
import styles from "@/modules/appearance/components/themes-page.module.css";

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

  const previewMods = current?.id ? (themeState.mods[current.id] ?? {}) : {};
  const siteUrl = typeof settings?.systemUrl === "string" ? settings.systemUrl.trim() : undefined;
  const isLivePreview = current?.id
    ? canUseLiveSitePreview(current.id, themeState.activeTheme, siteUrl)
    : false;

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
        <div className={styles.previewSidebarToolbar}>
          <Button
            disabled={currentIndex <= 0}
            aria-label={t("appearance.prevTheme")}
            onClick={() => goTo(currentIndex - 1)}
          >
            ←
          </Button>
          <Button
            disabled={currentIndex >= list.length - 1}
            aria-label={t("appearance.nextTheme")}
            onClick={() => goTo(currentIndex + 1)}
          >
            →
          </Button>
          <div className={styles.previewSidebarToolbarSpacer}>
            <LanguageSwitcher size="small" compact />
            <Button onClick={() => void navigate({ to: "/appearance/themes" })}>
              {t("appearance.closePreview")}
            </Button>
          </div>
        </div>

        <div className={styles.previewSidebarMeta}>
          <Typography.Text type="secondary">{t("appearance.previewPanelTitle")}</Typography.Text>
          <div className={styles.previewSidebarTags}>
            {current.active ? <Tag color="blue">{t("appearance.active")}</Tag> : null}
            {current.installed ? (
              <Tag color="default">{t("appearance.installed")}</Tag>
            ) : (
              <Tag>{t("appearance.notInstalled")}</Tag>
            )}
          </div>
          <Typography.Title level={4} className={styles.previewSidebarTitle}>
            {current.name}
          </Typography.Title>
          {current.author ? (
            <Typography.Text type="secondary">
              {t("appearance.author", { author: current.author })}
            </Typography.Text>
          ) : null}
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            {t("appearance.version", { version: current.version })}
          </Typography.Text>
          {current.description ? (
            <Typography.Paragraph style={{ marginTop: 12, marginBottom: 12 }}>
              {current.description}
            </Typography.Paragraph>
          ) : null}
          {current.tags && current.tags.length > 0 ? (
            <div style={{ marginBottom: 12 }}>
              <Typography.Text type="secondary">{t("appearance.tags")}: </Typography.Text>
              {current.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          ) : null}
          <Typography.Text type="secondary" style={{ display: "block" }}>
            {isLivePreview ? t("appearance.previewLiveHint") : t("appearance.previewStubHint")}
          </Typography.Text>
        </div>

        <div className={styles.previewSidebarActions}>
          {!current.installed ? (
            <Button
              type="primary"
              loading={installMutation.isPending}
              onClick={() => void handleInstall()}
            >
              {t("appearance.install")}
            </Button>
          ) : null}
          {!current.active && current.installed ? (
            <Button
              type="primary"
              loading={activateMutation.isPending}
              onClick={() => void handleActivate()}
            >
              {t("appearance.activate")}
            </Button>
          ) : null}
          {current.installed && !current.active ? (
            <Button onClick={() => void handleInstall()} loading={installMutation.isPending}>
              {t("appearance.reinstall")}
            </Button>
          ) : null}
          {current.active ? (
            <Button onClick={() => void navigate({ to: "/appearance/customize" })}>
              {t("appearance.customize")}
            </Button>
          ) : null}
        </div>
      </aside>

      <div className={styles.previewWrap} style={{ height: "100vh" }}>
        <ThemePreviewFrame
          themeId={current.id}
          activeThemeId={themeState.activeTheme}
          mods={previewMods}
          siteUrl={siteUrl}
          title={current.name}
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
}
