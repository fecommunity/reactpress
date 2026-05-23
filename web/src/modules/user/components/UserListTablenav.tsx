import { Button, Select } from "antd";
import { useTranslation } from "react-i18next";
import { ListPaginationNav } from "@/shared/components/ListPaginationNav";
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
            style={{ width: 200, minWidth: 200 }}
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
