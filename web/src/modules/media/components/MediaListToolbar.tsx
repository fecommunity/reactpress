import { Button, Input, Select } from "antd";
import { LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { MediaViewMode, SelectOption } from "@/modules/media/mediaListApi";

import styles from "./media-list.module.css";

export type MediaListToolbarProps = {
  view: MediaViewMode;
  onViewChange: (view: MediaViewMode) => void;
  typeValue?: string;
  onTypeChange: (value: string | undefined) => void;
  typeOptions: SelectOption[];
  monthValue?: string;
  onMonthChange: (value: string | undefined) => void;
  monthOptions: SelectOption[];
  onFilter: () => void;
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
};

export function MediaListToolbar({
  view,
  onViewChange,
  typeValue,
  onTypeChange,
  typeOptions,
  monthValue,
  onMonthChange,
  monthOptions,
  onFilter,
  keywordInput,
  onKeywordChange,
  onSearch,
}: MediaListToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <div className={styles.viewModes} role="group" aria-label={t("media.viewMode")}>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${view === "list" ? styles.viewModeBtnActive : ""}`}
            aria-pressed={view === "list"}
            title={t("media.listView")}
            onClick={() => onViewChange("list")}
          >
            <List size={16} aria-hidden />
          </button>
          <button
            type="button"
            className={`${styles.viewModeBtn} ${view === "grid" ? styles.viewModeBtnActive : ""}`}
            aria-pressed={view === "grid"}
            title={t("media.gridView")}
            onClick={() => onViewChange("grid")}
          >
            <LayoutGrid size={16} aria-hidden />
          </button>
        </div>
        <Select
          allowClear
          placeholder={t("media.allTypes")}
          style={{ width: 168 }}
          value={typeValue || undefined}
          onChange={(v) => onTypeChange(v)}
          options={typeOptions}
        />
        <Select
          allowClear
          placeholder={t("media.allDates")}
          style={{ width: 140 }}
          value={monthValue || undefined}
          onChange={(v) => onMonthChange(v)}
          options={monthOptions}
        />
        <Button onClick={onFilter}>{t("media.filter")}</Button>
      </div>
      <div className={styles.toolbarRight}>
        <div className={styles.searchGroup}>
          <Input
            className={styles.searchInput}
            value={keywordInput}
            onChange={(e) => onKeywordChange(e.target.value)}
            onPressEnter={onSearch}
            aria-label={t("media.searchPlaceholder")}
          />
          <Button className={styles.searchButton} onClick={onSearch}>
            {t("media.search")}
          </Button>
        </div>
      </div>
    </div>
  );
}
