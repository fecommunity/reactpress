import { App, Badge, Button, Col, Row, Spin, Tag, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useThemes, useThemeMutations } from "@/hooks/useThemes";
import { ThemeCard } from "@/modules/appearance/components/ThemeCard";
import { ThemeFlowGuide } from "@/modules/appearance/components/ThemeFlowGuide";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import styles from "@/modules/appearance/components/themes-page.module.css";

export function ThemesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { data: themes, isLoading, isError, error, refetch } = useThemes();
  const { installMutation, activateMutation } = useThemeMutations();

  const activeTheme = useMemo(() => themes?.find((th) => th.active), [themes]);
  const catalog = useMemo(() => themes?.filter((th) => !th.active) ?? [], [themes]);

  const handleInstall = async (id: string) => {
    try {
      await installMutation.mutateAsync(id);
      message.success(t("appearance.installSuccessHint"), 6);
    } catch {
      message.error(t("appearance.actionFailed"));
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const state = await activateMutation.mutateAsync(id);
      const siteUrl =
        typeof state === "object" && state && "siteUrl" in state
          ? String((state as { siteUrl?: string }).siteUrl ?? "")
          : "";
      message.success(
        siteUrl
          ? t("appearance.activateSuccessWithSite", { url: siteUrl })
          : t("appearance.activateSuccess"),
        6,
      );
    } catch {
      message.error(t("appearance.actionFailed"));
    }
  };

  if (isError) {
    const authError = error instanceof Error && error.message === "SESSION_EXPIRED";
    return (
      <ModulePlaceholder
        title={t("placeholder.themes")}
        description={authError ? t("appearance.loadErrorAuth") : t("appearance.loadError")}
      />
    );
  }

  if (isLoading) {
    return <Spin />;
  }

  return (
    <>
      <ThemeFlowGuide />

      <div className={styles.pageHeader}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t("placeholder.themes")}
          <Badge count={themes?.length ?? 0} style={{ marginLeft: 8 }} showZero color="#646970" />
        </Typography.Title>
        <Button type="primary" onClick={() => void refetch()}>
          {t("appearance.refreshCatalog")}
        </Button>
      </div>

      {activeTheme && (
        <section className={styles.activePanel}>
          <div>
            {activeTheme.screenshotUrl ? (
              <img
                className={styles.previewShot}
                src={activeTheme.screenshotUrl}
                alt={activeTheme.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className={styles.previewPlaceholder}>{activeTheme.name}</div>
            )}
          </div>
          <div>
            <Tag color="default">{t("appearance.activeTheme")}</Tag>
            <Typography.Title level={3} style={{ marginTop: 8 }}>
              {activeTheme.name}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t("appearance.version", { version: activeTheme.version })}
            </Typography.Text>
            {activeTheme.author && (
              <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
                {t("appearance.author", { author: activeTheme.author })}
              </Typography.Paragraph>
            )}
            {activeTheme.description && (
              <Typography.Paragraph>{activeTheme.description}</Typography.Paragraph>
            )}
            {activeTheme.tags && activeTheme.tags.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary">{t("appearance.tags")}: </Typography.Text>
                {activeTheme.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
            <Button
              type="primary"
              onClick={() => void navigate({ to: "/appearance/customize" })}
              style={{ marginRight: 8 }}
            >
              {t("appearance.customize")}
            </Button>
            <Button
              onClick={() =>
                void navigate({
                  to: "/appearance/themes/preview",
                  search: { theme: activeTheme.id },
                })
              }
            >
              {t("appearance.preview")}
            </Button>
          </div>
        </section>
      )}

      <Typography.Title level={5}>{t("appearance.catalogTitle")}</Typography.Title>
      <Typography.Paragraph type="secondary">{t("appearance.catalogDesc")}</Typography.Paragraph>
      <Row gutter={[16, 16]} className={styles.themeGrid}>
        {catalog.map((theme) => (
          <Col xs={24} sm={12} md={8} lg={6} key={theme.id}>
            <ThemeCard
              theme={theme}
              onInstall={(id) => void handleInstall(id)}
              onActivate={(id) => void handleActivate(id)}
              installing={installMutation.isPending && installMutation.variables === theme.id}
              activating={activateMutation.isPending && activateMutation.variables === theme.id}
            />
          </Col>
        ))}
      </Row>
    </>
  );
}
