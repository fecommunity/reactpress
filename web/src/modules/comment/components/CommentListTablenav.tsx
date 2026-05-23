import { Button, Input, Select } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./comment-list.module.css";

export type CommentBulkAction = "approve" | "unapprove" | "delete";

export type CommentListTablenavProps = {
  bulkAction?: CommentBulkAction;
  onBulkActionChange: (action: CommentBulkAction | undefined) => void;
  onBulkApply: () => void;
  bulkApplying?: boolean;
  bulkDisabled?: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  position?: "top" | "bottom";
  compact?: boolean;
};

export function CommentListTablenav({
  bulkAction,
  onBulkActionChange,
  onBulkApply,
  bulkApplying = false,
  bulkDisabled = false,
  total,
  page,
  pageSize,
  onPageChange,
  position = "top",
  compact = false,
}: CommentListTablenavProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goPage = (next: number) => {
    onPageChange(Math.min(totalPages, Math.max(1, next)));
  };

  const bulkOptions = [
    { value: "approve", label: t("comment.approve") },
    { value: "unapprove", label: t("comment.unapprove") },
    { value: "delete", label: t("common.delete") },
  ];

  return (
    <div
      className={`${styles.tablenav} ${position === "top" ? styles.tablenavTop : styles.tablenavBottom} ${compact ? styles.tablenavCompact : ""}`}
    >
      {!compact ? (
        <div className={styles.tablenavLeft}>
          <Select
            placeholder={t("comment.bulkActions")}
            style={{ width: 160 }}
            value={bulkAction}
            onChange={(value) => onBulkActionChange(value)}
            options={bulkOptions}
            allowClear
          />
          <Button
            disabled={!bulkAction || bulkDisabled}
            loading={bulkApplying}
            onClick={onBulkApply}
          >
            {t("comment.apply")}
          </Button>
        </div>
      ) : null}
      <div className={styles.tablenavRight}>
        <span className={styles.itemCount}>{t("comment.itemsCount", { count: total })}</span>
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
