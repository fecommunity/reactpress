import { App, Badge, Button, Spin, Typography } from "antd";
import { RefreshCw } from "lucide-react";
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
  const { data: themes, isLoading, isError, error, refetch, isFetching } = useThemes();
  const { installMutation, installNpmMutation } = useThemeMutations();
  const { activateAndWait, activatingId, activationStatusText } = useThemeActivation();
  const [filter, setFilter] = useState<ThemeCatalogFilter>("all");
  const [search, setSearch] = useState("");

  const activeTheme = useMemo(() => themes?.find((th) => th.active), [themes]);
  const catalogBase = useMemo(() => themes?.filter((th) => !th.active) ?? [], [themes]);

  const catalog = useMemo(() => {
    const filtered = catalogBase.filter((theme) => {
      if (filter === "installed" && !theme.installed) return false;
      if (filter === "available" && theme.installed) return false;
      return matchesSearch(theme, search);
    });
    return [...filtered].sort((a, b) => {
      const aFeatured = a.catalog?.featured && !a.installed ? 1 : 0;
      const bFeatured = b.catalog?.featured && !b.installed ? 1 : 0;
      return bFeatured - aFeatured;
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

  const handleInstallNpm = async (spec: string) => {
    const resolved = spec.trim();
    if (!resolved) return;
    try {
      await installNpmMutation.mutateAsync(resolved);
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
      <header className={`admin-page-header ${styles.pageHeader}`}>
        <div className={styles.pageHeaderMain}>
          <div className={styles.pageHeaderTitleRow}>
            <Typography.Title level={2} className={`${styles.pageTitle} admin-page-title`}>
              {t("placeholder.themes")}
            </Typography.Title>
            <Badge
              count={themes?.length ?? 0}
              className={styles.themeCountBadge}
              showZero
              color="#646970"
            />
          </div>
          <Typography.Paragraph className={styles.pageDesc} type="secondary">
            {t("appearance.themesDesc")}
          </Typography.Paragraph>
        </div>
        <Button icon={<RefreshCw size={14} />} loading={isFetching} onClick={() => void refetch()}>
          {t("appearance.refreshCatalog")}
        </Button>
      </header>

      {activeTheme ? <ActiveThemePanel theme={activeTheme} /> : null}

      <section id="theme-catalog" className={styles.catalogSection}>
        <div className={styles.sectionHeader}>
          <Typography.Title level={4} className={styles.catalogHeading}>
            {t("appearance.catalogTitle")}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className={styles.sectionDesc}>
            {t("appearance.catalogDesc")}
          </Typography.Paragraph>
        </div>
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
