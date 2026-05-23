import { Button, Input, Select } from "antd";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "@/modules/page/pageListApi";
import styles from "@/modules/article/components/article-list.module.css";

export type PageListTablenavProps = {
  monthValue?: string;
  onMonthChange: (value: string | undefined) => void;
  monthOptions: SelectOption[];
  onFilter: () => void;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  position?: "top" | "bottom";
  compact?: boolean;
};

export function PageListTablenav({
  monthValue,
  onMonthChange,
  monthOptions,
  onFilter,
  total,
  page,
  pageSize,
  onPageChange,
  position = "top",
  compact = false,
}: PageListTablenavProps) {
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
            placeholder={t("page.allDates")}
            style={{ width: 160 }}
            value={monthValue || undefined}
            onChange={(v) => onMonthChange(v)}
            options={monthOptions}
          />
          <Button onClick={onFilter}>{t("page.filter")}</Button>
        </div>
      ) : null}
      <div className={styles.tablenavRight}>
        <span className={styles.itemCount}>{t("page.itemsCount", { count: total })}</span>
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
          <span className={styles.pageOf}>
            {t("article.pageOf", { total: totalPages })}
          </span>
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
