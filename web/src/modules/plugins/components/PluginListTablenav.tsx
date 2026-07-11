import { Button, Select } from "antd";
import { useTranslation } from "react-i18next";

import listStyles from "@/modules/comment/components/comment-list.module.css";

export type PluginBulkAction = "activate" | "deactivate" | "uninstall";

export type PluginListTablenavProps = {
  bulkAction?: PluginBulkAction;
  onBulkActionChange: (action: PluginBulkAction | undefined) => void;
  onBulkApply: () => void;
  bulkApplying?: boolean;
  bulkDisabled?: boolean;
  total: number;
  position?: "top" | "bottom";
  compact?: boolean;
};

export function PluginListTablenav({
  bulkAction,
  onBulkActionChange,
  onBulkApply,
  bulkApplying = false,
  bulkDisabled = false,
  total,
  position = "top",
  compact = false,
}: PluginListTablenavProps) {
  const { t } = useTranslation();

  const bulkOptions = [
    { value: "activate", label: t("plugins.activate") },
    { value: "deactivate", label: t("plugins.deactivate") },
    { value: "uninstall", label: t("plugins.uninstall") },
  ];

  return (
    <div
      className={`${listStyles.tablenav} ${position === "top" ? listStyles.tablenavTop : listStyles.tablenavBottom} ${
        compact ? listStyles.tablenavCompact : ""
      }`}
    >
      {!compact ? (
        <div className={listStyles.tablenavLeft}>
          <Select
            placeholder={t("plugins.bulkActions")}
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
            {t("plugins.apply")}
          </Button>
        </div>
      ) : null}
      <div className={listStyles.tablenavRight}>
        <span className={listStyles.itemCount}>{t("plugins.itemsCount", { count: total })}</span>
      </div>
    </div>
  );
}
