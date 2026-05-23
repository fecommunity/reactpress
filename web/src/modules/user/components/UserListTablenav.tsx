import { Button, Input, Select } from "antd";
import { useTranslation } from "react-i18next";
import styles from "@/modules/comment/components/comment-list.module.css";

export type UserBulkAction = "disable" | "enable" | "delete";

export type UserListTablenavProps = {
  bulkAction?: UserBulkAction;
  onBulkActionChange: (action: UserBulkAction | undefined) => void;
  onBulkApply: () => void;
  bulkApplying?: boolean;
  showDeleteBulk?: boolean;
  roleChange?: string;
  onRoleChangeSelect: (role: string | undefined) => void;
  onRoleChangeApply: () => void;
  roleChangeApplying?: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  position?: "top" | "bottom";
  compact?: boolean;
};

export function UserListTablenav({
  bulkAction,
  onBulkActionChange,
  onBulkApply,
  bulkApplying = false,
  showDeleteBulk = false,
  roleChange,
  onRoleChangeSelect,
  onRoleChangeApply,
  roleChangeApplying = false,
  total,
  page,
  pageSize,
  onPageChange,
  position = "top",
  compact = false,
}: UserListTablenavProps) {
  const { t } = useTranslation();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goPage = (next: number) => {
    onPageChange(Math.min(totalPages, Math.max(1, next)));
  };

  const bulkOptions = [
    { value: "disable" as const, label: t("users.disable") },
    { value: "enable" as const, label: t("users.enable") },
    ...(showDeleteBulk ? [{ value: "delete" as const, label: t("common.delete") }] : []),
  ];

  const roleOptions = [
    { value: "admin", label: t("users.roleAdmin") },
    { value: "visitor", label: t("users.roleSubscriber") },
    { value: "editor", label: t("users.roleEditor") },
  ];

  return (
    <div
      className={`${styles.tablenav} ${position === "top" ? styles.tablenavTop : styles.tablenavBottom} ${compact ? styles.tablenavCompact : ""}`}
    >
      {!compact ? (
        <div className={styles.tablenavLeft}>
          <Select
            placeholder={t("users.bulkActions")}
            style={{ width: 160 }}
            value={bulkAction}
            onChange={(value) => onBulkActionChange(value)}
            options={bulkOptions}
            allowClear
          />
          <Button disabled={!bulkAction} loading={bulkApplying} onClick={onBulkApply}>
            {t("users.apply")}
          </Button>
          <Select
            placeholder={t("users.changeRoleTo")}
            style={{ width: 180 }}
            value={roleChange}
            onChange={(value) => onRoleChangeSelect(value)}
            options={roleOptions}
            allowClear
          />
          <Button disabled={!roleChange} loading={roleChangeApplying} onClick={onRoleChangeApply}>
            {t("users.changeRole")}
          </Button>
        </div>
      ) : null}
      <div className={styles.tablenavRight}>
        <span className={styles.itemCount}>{t("users.itemsCount", { count: total })}</span>
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
