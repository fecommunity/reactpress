import { Button, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import listStyles from "@/modules/comment/components/comment-list.module.css";

export type PluginFilter = "all" | "active" | "inactive" | "available";

export type PluginFilterCounts = {
  all: number;
  active: number;
  inactive: number;
  available: number;
};

type PluginListSubHeaderProps = {
  filter: PluginFilter;
  counts: PluginFilterCounts;
  onFilterChange: (filter: PluginFilter) => void;
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
};

export function PluginListSubHeader({
  filter,
  counts,
  onFilterChange,
  keywordInput,
  onKeywordChange,
  onSearch,
  onRefresh,
  refreshing = false,
}: PluginListSubHeaderProps) {
  const { t } = useTranslation();

  const tabs: { key: PluginFilter; label: string; count: number }[] = [
    { key: "all", label: t("plugins.filterAll"), count: counts.all },
    { key: "active", label: t("plugins.filterActive"), count: counts.active },
    { key: "inactive", label: t("plugins.filterInactive"), count: counts.inactive },
    { key: "available", label: t("plugins.filterAvailable"), count: counts.available },
  ];

  return (
    <>
      <div className={listStyles.pageHeader}>
        <Typography.Title level={2} className={`${listStyles.pageTitle} admin-page-title`}>
          {t("placeholder.plugins")}
        </Typography.Title>
        <Button loading={refreshing} onClick={onRefresh}>
          {t("plugins.refresh")}
        </Button>
      </div>
      <div className={listStyles.statusRow}>
        <ul className={listStyles.statusViews} aria-label={t("plugins.filterLabel")}>
          {tabs.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <li key={tab.key}>
                <button
                  type="button"
                  className={`${listStyles.statusLink} ${isActive ? listStyles.statusLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  disabled={isActive}
                  onClick={() => onFilterChange(tab.key)}
                >
                  {tab.label} ({tab.count})
                </button>
              </li>
            );
          })}
        </ul>
        <div className={listStyles.searchGroup}>
          <Input
            className={listStyles.searchInput}
            value={keywordInput}
            onChange={(e) => onKeywordChange(e.target.value)}
            onPressEnter={onSearch}
            placeholder={t("plugins.searchPlaceholder")}
            aria-label={t("plugins.searchPlaceholder")}
          />
          <Button className={listStyles.searchButton} onClick={onSearch}>
            {t("plugins.search")}
          </Button>
        </div>
      </div>
    </>
  );
}
