import { Input, Segmented } from "antd";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import styles from "@/modules/appearance/components/themes-page.module.css";

export type ThemeCatalogFilter = "all" | "installed" | "available";

type Props = {
  total: number;
  filter: ThemeCatalogFilter;
  onFilterChange: (value: ThemeCatalogFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
};

export function ThemeCatalogToolbar({
  total,
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.catalogToolbar}>
      <Segmented
        className={styles.catalogTabs}
        value={filter}
        onChange={(value) => onFilterChange(value as ThemeCatalogFilter)}
        options={[
          { label: t("appearance.filterAll", { count: total }), value: "all" },
          { label: t("appearance.filterInstalled"), value: "installed" },
          { label: t("appearance.filterAvailable"), value: "available" },
        ]}
      />
      <Input
        className={styles.catalogSearch}
        allowClear
        prefix={<Search size={14} />}
        placeholder={t("appearance.searchThemes")}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label={t("appearance.searchThemes")}
      />
    </div>
  );
}
