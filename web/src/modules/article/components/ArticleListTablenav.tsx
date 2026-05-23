import { Button, Input, Select } from "antd";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "@/modules/article/articleListApi";
import { ListPaginationNav } from "@/shared/components/ListPaginationNav";
import styles from "./article-list.module.css";

export type ArticleListTablenavProps = {
  monthValue?: string;
  onMonthChange: (value: string | undefined) => void;
  monthOptions: SelectOption[];
  categoryValue?: string;
  onCategoryChange: (value: string | undefined) => void;
  categoryOptions: SelectOption[];
  tagValue?: string;
  onTagChange: (value: string | undefined) => void;
  tagOptions: SelectOption[];
  onFilter: () => void;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  position?: "top" | "bottom";
  /** Bottom bar: pagination only (WordPress-style). */
  compact?: boolean;
};

export function ArticleListTablenav({
  monthValue,
  onMonthChange,
  monthOptions,
  categoryValue,
  onCategoryChange,
  categoryOptions,
  tagValue,
  onTagChange,
  tagOptions,
  onFilter,
  total,
  page,
  pageSize,
  onPageChange,
  position = "top",
  compact = false,
}: ArticleListTablenavProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`${styles.tablenav} ${position === "top" ? styles.tablenavTop : styles.tablenavBottom} ${compact ? styles.tablenavCompact : ""}`}
    >
      {!compact ? (
        <div className={styles.tablenavLeft}>
          <Select
            allowClear
            placeholder={t("article.allDates")}
            style={{ width: 160 }}
            value={monthValue || undefined}
            onChange={(v) => onMonthChange(v)}
            options={monthOptions}
          />
          <Select
            allowClear
            placeholder={t("article.allCategories")}
            style={{ width: 160 }}
            value={categoryValue || undefined}
            onChange={(v) => onCategoryChange(v)}
            options={categoryOptions}
          />
          <Select
            allowClear
            placeholder={t("article.allTags")}
            style={{ width: 160 }}
            value={tagValue || undefined}
            onChange={(v) => onTagChange(v)}
            options={tagOptions}
          />
          <Button onClick={onFilter}>{t("article.filter")}</Button>
        </div>
      ) : null}
      <div className={styles.tablenavRight}>
        <span className={styles.itemCount}>{t("article.itemsCount", { count: total })}</span>
        <ListPaginationNav
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={onPageChange}
          classNames={{
            pagination: styles.pagination,
            pageNavBtn: styles.pageNavBtn,
            pageInput: styles.pageInput,
            pageOf: styles.pageOf,
          }}
        />
      </div>
    </div>
  );
}
