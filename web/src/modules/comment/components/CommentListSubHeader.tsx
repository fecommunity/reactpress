import { Button, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { CommentStatusCounts } from "@/modules/comment/commentListApi";
import styles from "./comment-list.module.css";

type CommentListSubHeaderProps = {
  pass: string;
  counts?: CommentStatusCounts;
  onPassChange: (pass: string) => void;
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
};

export function CommentListSubHeader({
  pass,
  counts,
  onPassChange,
  keywordInput,
  onKeywordChange,
  onSearch,
}: CommentListSubHeaderProps) {
  const { t } = useTranslation();
  const active = pass || "";

  const tabs = [
    { key: "", label: t("comment.statusAll"), count: counts?.all },
    { key: "0", label: t("comment.pending"), count: counts?.pending },
    { key: "1", label: t("comment.approved"), count: counts?.approved },
  ] as const;

  return (
    <>
      <div className={styles.pageHeader}>
        <Typography.Title level={2} className={`${styles.pageTitle} admin-page-title`}>
          {t("comment.title")}
        </Typography.Title>
      </div>
      <div className={styles.statusRow}>
        <ul className={styles.statusViews} aria-label={t("comment.statusFilter")}>
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <li key={tab.key || "all"}>
                <button
                  type="button"
                  className={`${styles.statusLink} ${isActive ? styles.statusLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  disabled={isActive}
                  onClick={() => onPassChange(tab.key)}
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
            aria-label={t("comment.searchComments")}
          />
          <Button className={styles.searchButton} onClick={onSearch}>
            {t("comment.searchComments")}
          </Button>
        </div>
      </div>
    </>
  );
}
