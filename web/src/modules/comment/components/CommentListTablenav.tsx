import { Button, Select } from "antd";
import { useTranslation } from "react-i18next";
import { ListPaginationNav } from "@/shared/components/ListPaginationNav";
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
            style={{ width: 200, minWidth: 200 }}
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
