import { App, Badge, Button, Input, Modal, Spin, Typography } from "antd";
import { Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useThemeActivation } from "@/hooks/useThemeActivation";
import { useThemeMutations, useThemes } from "@/hooks/useThemes";
import { ActiveThemePanel } from "@/modules/appearance/components/ActiveThemePanel";
import { ThemeCard } from "@/modules/appearance/components/ThemeCard";
import {
  type ThemeCatalogFilter,
  ThemeCatalogToolbar,
} from "@/modules/appearance/components/ThemeCatalogToolbar";
import styles from "@/modules/appearance/components/themes-page.module.css";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";

function matchesSearch(theme: { name: string; description?: string; tags?: string[] }, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (theme.name.toLowerCase().includes(needle)) return true;
  if (theme.description?.toLowerCase().includes(needle)) return true;
  return theme.tags?.some((tag) => tag.toLowerCase().includes(needle)) ?? false;
}

export function ThemesPage() {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { data: themes, isLoading, isError, error, refetch } = useThemes();
  const { installMutation, installNpmMutation } = useThemeMutations();
  const { activateAndWait, activatingId, activationStatusText } = useThemeActivation();
  const [filter, setFilter] = useState<ThemeCatalogFilter>("all");
  const [search, setSearch] = useState("");
  const [npmModalOpen, setNpmModalOpen] = useState(false);
  const [npmSpec, setNpmSpec] = useState("@fecommunity/reactpress-theme-starter@1.0.0-beta.0");

  const activeTheme = useMemo(() => themes?.find((th) => th.active), [themes]);
  const catalogBase = useMemo(() => themes?.filter((th) => !th.active) ?? [], [themes]);

  const catalog = useMemo(() => {
    return catalogBase.filter((theme) => {
      if (filter === "installed" && !theme.installed) return false;
      if (filter === "available" && theme.installed) return false;
      return matchesSearch(theme, search);
    });
  }, [catalogBase, filter, search]);

  const handleInstall = async (id: string) => {
    try {
      await installMutation.mutateAsync(id);
      message.success(t("appearance.installSuccessHint"), 6);
    } catch {
      message.error(t("appearance.actionFailed"));
    }
  };

  const handleInstallNpm = async (spec?: string) => {
    const resolved = (spec ?? npmSpec).trim();
    if (!resolved) return;
    try {
      await installNpmMutation.mutateAsync(resolved);
      setNpmModalOpen(false);
      message.success(t("appearance.installSuccessHint"), 6);
    } catch {
      message.error(t("appearance.actionFailed"));
    }
  };

  const handleInstallTheme = (theme: NonNullable<typeof themes>[number]) => {
    if (theme.catalog?.npm && !theme.installed) {
      void handleInstallNpm(theme.catalog.npm);
      return;
    }
    void handleInstall(theme.id);
  };

  const featuredCatalog = useMemo(
    () => catalogBase.filter((theme) => theme.catalog?.featured && !theme.installed),
    [catalogBase],
  );

  const handleActivate = (id: string) => {
    void activateAndWait(id);
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
    return (
      <div className={styles.themesPage}>
        <Spin />
      </div>
    );
  }

  return (
    <div className={styles.themesPage}>
      <header className={styles.pageHeader}>
        <div className={styles.pageHeaderTitle}>
          <Typography.Title level={2} className={styles.pageTitle}>
            {t("placeholder.themes")}
          </Typography.Title>
          <Badge
            count={themes?.length ?? 0}
            className={styles.themeCountBadge}
            showZero
            color="#646970"
          />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button type="default" icon={<Plus size={14} />} onClick={() => setNpmModalOpen(true)}>
            {t("appearance.addNewTheme")}
          </Button>
          <Button type="text" icon={<RefreshCw size={14} />} onClick={() => void refetch()}>
            {t("appearance.refreshCatalog")}
          </Button>
        </div>
      </header>

      <Modal
        title={t("appearance.installNpmTitle")}
        open={npmModalOpen}
        onCancel={() => setNpmModalOpen(false)}
        onOk={() => void handleInstallNpm()}
        okText={t("appearance.installNpmSubmit")}
        confirmLoading={installNpmMutation.isPending}
        destroyOnClose
      >
        <Typography.Paragraph type="secondary">
          {t("appearance.installNpmDesc")}
        </Typography.Paragraph>
        <Input
          value={npmSpec}
          onChange={(e) => setNpmSpec(e.target.value)}
          placeholder={t("appearance.installNpmSpecPlaceholder")}
          onPressEnter={() => void handleInstallNpm()}
        />
      </Modal>

      <Typography.Paragraph className={styles.pageIntro} type="secondary">
        {t("appearance.themesDesc")}
      </Typography.Paragraph>

      {activeTheme ? <ActiveThemePanel theme={activeTheme} /> : null}

      {featuredCatalog.length > 0 ? (
        <section className={styles.catalogSection}>
          <Typography.Title level={4} className={styles.catalogHeading}>
            {t("appearance.officialThemesTitle")}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className={styles.pageIntro}>
            {t("appearance.officialThemesDesc")}
          </Typography.Paragraph>
          <div className={styles.themeGrid}>
            {featuredCatalog.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onInstall={() => handleInstallTheme(theme)}
                onActivate={(id) => handleActivate(id)}
                installing={
                  (installNpmMutation.isPending &&
                    installNpmMutation.variables === theme.catalog?.npm) ||
                  (installMutation.isPending && installMutation.variables === theme.id)
                }
                activating={activatingId === theme.id}
                activatingLabel={activatingId === theme.id ? activationStatusText : undefined}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section id="theme-catalog" className={styles.catalogSection}>
        <Typography.Title level={4} className={styles.catalogHeading}>
          {t("appearance.catalogTitle")}
        </Typography.Title>
        <ThemeCatalogToolbar
          total={catalogBase.length}
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />
        {catalog.length === 0 ? (
          <Typography.Text type="secondary" className={styles.catalogEmpty}>
            {t("appearance.catalogEmpty")}
          </Typography.Text>
        ) : (
          <div className={styles.themeGrid}>
            {catalog.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onInstall={() => handleInstallTheme(theme)}
                onActivate={(id) => handleActivate(id)}
                installing={
                  (installNpmMutation.isPending &&
                    installNpmMutation.variables === theme.catalog?.npm) ||
                  (installMutation.isPending && installMutation.variables === theme.id)
                }
                activating={activatingId === theme.id}
                activatingLabel={activatingId === theme.id ? activationStatusText : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
