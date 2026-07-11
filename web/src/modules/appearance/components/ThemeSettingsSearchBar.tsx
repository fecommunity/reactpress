import { Input } from "antd";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import styles from "@/modules/appearance/components/theme-settings-editor.module.css";
import { useThemeSettingsSearch } from "@/modules/appearance/context/ThemeSettingsSearchContext";

export function ThemeSettingsSearchBar() {
  const { t } = useTranslation();
  const { query, setQuery } = useThemeSettingsSearch();

  return (
    <div className={styles.searchWrap}>
      <Input
        className={styles.searchInput}
        allowClear
        prefix={<Search size={15} className={styles.searchIcon} />}
        placeholder={t("appearance.themeSettingsSearchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t("appearance.themeSettingsSearchPlaceholder")}
        data-testid="theme-settings-search"
      />
    </div>
  );
}
