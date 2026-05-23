import { Button, Input, Select } from "antd";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "@/modules/article/articleListApi";
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
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goPage = (next: number) => {
    onPageChange(Math.min(totalPages, Math.max(1, next)));
  };

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
        <span className={styles.pagination} aria-label={t("common.pagination")}>
          <Button
            type="text"
            size="small"
            className={styles.pageNavBtn}
            disabled={page <= 1}
            onClick={() => goPage(1)}
            aria-label={t("article.firstPage")}
          >
            «
          </Button>
          <Button
            type="text"
            size="small"
            className={styles.pageNavBtn}
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
            aria-label={t("article.prevPage")}
          >
            ‹
          </Button>
          <Input
            className={styles.pageInput}
            size="small"
            value={page}
            onChange={(e) => {
              const n = Number.parseInt(e.target.value, 10);
              if (!Number.isNaN(n)) goPage(n);
            }}
            onPressEnter={(e) => {
              const n = Number.parseInt((e.target as HTMLInputElement).value, 10);
              if (!Number.isNaN(n)) goPage(n);
            }}
          />
          <span className={styles.pageOf}>{t("article.pageOf", { total: totalPages })}</span>
          <Button
            type="text"
            size="small"
            className={styles.pageNavBtn}
            disabled={page >= totalPages}
            onClick={() => goPage(page + 1)}
            aria-label={t("article.nextPage")}
          >
            ›
          </Button>
          <Button
            type="text"
            size="small"
            className={styles.pageNavBtn}
            disabled={page >= totalPages}
            onClick={() => goPage(totalPages)}
            aria-label={t("article.lastPage")}
          >
            »
          </Button>
        </span>
      </div>
    </div>
  );
}
