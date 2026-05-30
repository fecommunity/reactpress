import { App, Badge, Button, Spin, Typography } from "antd";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useThemes, useThemeMutations } from "@/hooks/useThemes";
import { ActiveThemePanel } from "@/modules/appearance/components/ActiveThemePanel";
import { ThemeCard } from "@/modules/appearance/components/ThemeCard";
import {
  ThemeCatalogToolbar,
  type ThemeCatalogFilter,
} from "@/modules/appearance/components/ThemeCatalogToolbar";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import styles from "@/modules/appearance/components/themes-page.module.css";

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
  const { installMutation, activateMutation } = useThemeMutations();
  const [filter, setFilter] = useState<ThemeCatalogFilter>("all");
  const [search, setSearch] = useState("");

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
        <Button type="default" icon={<Plus size={14} />} onClick={() => void refetch()}>
          {t("appearance.addNewTheme")}
        </Button>
      </header>

      <Typography.Paragraph className={styles.pageIntro} type="secondary">
        {t("appearance.themesDesc")}
      </Typography.Paragraph>

      {activeTheme ? <ActiveThemePanel theme={activeTheme} /> : null}

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
                onInstall={(id) => void handleInstall(id)}
                onActivate={(id) => void handleActivate(id)}
                installing={installMutation.isPending && installMutation.variables === theme.id}
                activating={activateMutation.isPending && activateMutation.variables === theme.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
