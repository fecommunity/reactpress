import { Button, Input, Select, theme } from "antd";
import { Plus, UserRound } from "lucide-react";
import { forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FilterToolbar } from "@/components/FilterToolbar";

/** Search + role slot `minWidth` for FilterToolbar collapse math */
const FILTER_CONTROL_WIDTH = 220;

export type ToolbarProps = {
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: (keyword: string) => void;
  onClearSearch: () => void;
  roleValue: string | undefined;
  onRoleChange: (role: string) => void;
  onCreateClick: () => void;
};

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  {
    keywordInput,
    onKeywordChange,
    onSearch,
    onClearSearch,
    roleValue,
    onRoleChange,
    onCreateClick,
  },
  ref,
) {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const slots = useMemo(
    () => [
      {
        key: "keyword",
        minWidth: FILTER_CONTROL_WIDTH,
        children: (
          <Input.Search
            allowClear
            placeholder={t("users.searchPlaceholder")}
            style={{ width: FILTER_CONTROL_WIDTH }}
            value={keywordInput}
            onChange={(e) => onKeywordChange(e.target.value)}
            onSearch={(v) => onSearch(v)}
            onClear={onClearSearch}
          />
        ),
      },
      {
        key: "role",
        minWidth: FILTER_CONTROL_WIDTH,
        children: (
          <Select
            allowClear
            placeholder={t("users.role")}
            style={{ width: FILTER_CONTROL_WIDTH }}
            prefix={<UserRound size={token.fontSize} />}
            value={roleValue}
            onChange={(v) => onRoleChange(v ?? "")}
            options={[
              { label: t("users.roleAdmin"), value: "admin" },
              { label: t("users.roleEditor"), value: "editor" },
            ]}
          />
        ),
      },
    ],
    [
      keywordInput,
      onClearSearch,
      onKeywordChange,
      onRoleChange,
      onSearch,
      roleValue,
      t,
      token.fontSize,
    ],
  );

  return (
    <FilterToolbar
      ref={ref}
      slots={slots}
      actions={
        <Button type="primary" icon={<Plus size={token.fontSize} />} onClick={onCreateClick}>
          {t("users.createUser")}
        </Button>
      }
      moreFiltersLabel={t("common.moreFilters")}
      moreFiltersTitle={t("common.moreFilters")}
    />
  );
});
