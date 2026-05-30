import { Button, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import styles from "@/modules/comment/components/comment-list.module.css";
import type { UserRoleCounts } from "@/modules/user/userListApi";

type UserListSubHeaderProps = {
  role: string;
  counts?: UserRoleCounts;
  onRoleChange: (role: string) => void;
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
  onCreateClick: () => void;
};

export function UserListSubHeader({
  role,
  counts,
  onRoleChange,
  keywordInput,
  onKeywordChange,
  onSearch,
  onCreateClick,
}: UserListSubHeaderProps) {
  const { t } = useTranslation();
  const active = role || "";

  const tabs = [
    { key: "", label: t("users.roleAll"), count: counts?.all },
    { key: "admin", label: t("users.roleAdmin"), count: counts?.admin },
    { key: "visitor", label: t("users.roleSubscriber"), count: counts?.visitor },
  ] as const;

  return (
    <>
      <div className={styles.pageHeader}>
        <Typography.Title level={2} className={`${styles.pageTitle} admin-page-title`}>
          {t("menu.users")}
        </Typography.Title>
        <Button onClick={onCreateClick}>{t("users.addUser")}</Button>
      </div>
      <div className={styles.statusRow}>
        <ul className={styles.statusViews} aria-label={t("users.roleFilter")}>
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <li key={tab.key || "all"}>
                <button
                  type="button"
                  className={`${styles.statusLink} ${isActive ? styles.statusLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  disabled={isActive}
                  onClick={() => onRoleChange(tab.key)}
                >
                  {tab.label}
                  {tab.count != null ? ` (${tab.count})` : ""}
                </button>
              </li>
            );
          })}
        </ul>
        <div className={styles.searchGroup}>
          <Input
            className={styles.searchInput}
            value={keywordInput}
            onChange={(e) => onKeywordChange(e.target.value)}
            onPressEnter={onSearch}
            aria-label={t("users.searchUsers")}
          />
          <Button className={styles.searchButton} onClick={onSearch}>
            {t("users.searchUsers")}
          </Button>
        </div>
      </div>
    </>
  );
}
