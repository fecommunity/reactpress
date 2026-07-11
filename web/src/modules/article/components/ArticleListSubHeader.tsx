import { Link } from "@tanstack/react-router";
import { Button, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./article-list.module.css";

export type ArticleStatusCounts = {
  all: number;
  publish: number;
  draft: number;
};

type ArticleListSubHeaderProps = {
  status: string;
  counts?: ArticleStatusCounts;
  onStatusChange: (status: string) => void;
  keywordInput: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
};

export function ArticleListSubHeader({
  status,
  counts,
  onStatusChange,
  keywordInput,
  onKeywordChange,
  onSearch,
}: ArticleListSubHeaderProps) {
  const { t } = useTranslation();
  const active = status || "";

  const tabs = [
    { key: "", label: t("article.statusAll"), count: counts?.all },
    { key: "publish", label: t("article.published"), count: counts?.publish },
    { key: "draft", label: t("article.draft"), count: counts?.draft },
  ] as const;

  return (
    <>
      <div className={styles.pageHeader}>
        <Typography.Title level={2} className={`${styles.pageTitle} admin-page-title`}>
          {t("article.title")}
        </Typography.Title>
        <Link to="/article/editor">
          <Button>{t("article.writeArticle")}</Button>
        </Link>
      </div>
      <div className={styles.statusRow}>
        <ul className={styles.statusViews} aria-label={t("article.statusFilter")}>
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <li key={tab.key || "all"}>
                <button
                  type="button"
                  className={`${styles.statusLink} ${isActive ? styles.statusLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  disabled={isActive}
                  onClick={() => onStatusChange(tab.key)}
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
            aria-label={t("article.searchArticles")}
          />
          <Button className={styles.searchButton} onClick={onSearch}>
            {t("article.searchArticles")}
          </Button>
        </div>
      </div>
    </>
  );
}
