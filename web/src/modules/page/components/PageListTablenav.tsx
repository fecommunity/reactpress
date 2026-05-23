import { Button, Select } from "antd";
import { useTranslation } from "react-i18next";
import type { SelectOption } from "@/modules/page/pageListApi";
import { ListPaginationNav } from "@/shared/components/ListPaginationNav";
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

  return (
    <div
      className={`${styles.tablenav} ${position === "top" ? styles.tablenavTop : styles.tablenavBottom} ${compact ? styles.tablenavCompact : ""}`}
    >
      {!compact ? (
        <div className={styles.tablenavLeft}>
          <Select
            allowClear
            placeholder={t("page.allDates")}
            style={{ width: 200, minWidth: 200 }}
            value={monthValue || undefined}
            onChange={(v) => onMonthChange(v)}
            options={monthOptions}
          />
          <Button onClick={onFilter}>{t("page.filter")}</Button>
        </div>
      ) : null}
      <div className={styles.tablenavRight}>
        <span className={styles.itemCount}>{t("page.itemsCount", { count: total })}</span>
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
