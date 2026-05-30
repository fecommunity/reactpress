import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Avatar, Card, Skeleton, theme, Typography } from "antd";
import { Flag } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
  fetchArticleTitleMap,
  fetchCommentStatusCounts,
  fetchRecentComments,
} from "@/modules/dashboard/dashboardCommentApi";

import styles from "./recent-comments.module.css";

const { Title, Text } = Typography;

function truncateContent(content: string, maxLength = 80): string {
  const plain = content.replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}…`;
}

function ArticleTitleLink({
  hostId,
  title,
  url,
  hasArticle,
}: {
  hostId: string;
  title: string;
  url?: string;
  hasArticle: boolean;
}) {
  if (hasArticle && hostId) {
    return (
      <Link to="/article/editor/$id" params={{ id: hostId }} className={styles.metaLink}>
        《{title}》
      </Link>
    );
  }
  if (url) {
    return (
      <a href={url} className={styles.metaLink} target="_blank" rel="noreferrer">
        《{title}》
      </a>
    );
  }
  return <span className={styles.metaTitle}>《{title}》</span>;
}

export function RecentCommentsCard() {
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const { data: comments, isPending: commentsLoading } = useQuery({
    queryKey: ["dashboard-recent-comments"],
    queryFn: () => fetchRecentComments(8),
    staleTime: 60_000,
  });

  const { data: statusCounts } = useQuery({
    queryKey: ["comment-status-counts"],
    queryFn: fetchCommentStatusCounts,
    staleTime: 60_000,
  });

  const { data: articleTitles = {} } = useQuery({
    queryKey: ["comment-article-titles"],
    queryFn: fetchArticleTitleMap,
    staleTime: 60_000,
  });

  const filterTabs = useMemo(
    () =>
      [
        { key: "", label: t("comment.statusAll"), count: statusCounts?.all },
        { key: "0", label: t("comment.pending"), count: statusCounts?.pending },
        { key: "1", label: t("comment.approved"), count: statusCounts?.approved },
      ] as const,
    [statusCounts, t],
  );

  return (
    <Card
      className="admin-panel"
      title={
        <Title level={5} style={{ margin: 0 }}>
          {t("dashboard.recentComments")}
        </Title>
      }
      styles={{ body: { padding: 0 } }}
    >
      {commentsLoading ? (
        <div className={styles.skeletonWrap} style={{ padding: token.paddingLG }}>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      ) : (
        <ul className={styles.list} aria-label={t("dashboard.recentComments")}>
          {(comments ?? []).length === 0 ? (
            <li className={styles.empty}>{t("common.noData")}</li>
          ) : (
            (comments ?? []).map((comment) => {
              const articleTitle =
                articleTitles[comment.hostId] ?? comment.url ?? t("dashboard.unknownArticle");
              const pending = !comment.pass;
              const hasArticle = Boolean(articleTitles[comment.hostId]);

              return (
                <li
                  key={comment.id}
                  className={`${styles.item} ${pending ? styles.itemPending : ""}`}
                >
                  <Avatar size={32} shape="square" className={styles.avatar}>
                    {comment.name.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <div className={styles.body}>
                    <div className={styles.meta}>
                      <Text className={styles.metaText}>
                        {t("dashboard.commentMetaPrefix")}{" "}
                        <Link
                          to="/article/comment"
                          search={{
                            page: 1,
                            pageSize: 20,
                            pass: "",
                            keyword: comment.name,
                          }}
                          className={styles.metaLink}
                        >
                          {comment.name}
                        </Link>{" "}
                        {t("dashboard.commentMetaOn")}{" "}
                        <ArticleTitleLink
                          hostId={comment.hostId}
                          title={articleTitle}
                          url={comment.url}
                          hasArticle={hasArticle}
                        />
                        {pending ? (
                          <span className={styles.pendingBadge}>
                            <Flag size={12} aria-hidden />
                            {t("dashboard.commentPending")}
                          </span>
                        ) : null}
                      </Text>
                    </div>
                    <p className={styles.excerpt}>{truncateContent(comment.content)}</p>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      )}
      <div className={styles.footer}>
        <ul className={styles.filterViews} aria-label={t("comment.statusFilter")}>
          {filterTabs.map((tab) => (
            <li key={tab.key || "all"}>
              <Link
                to="/article/comment"
                search={{ page: 1, pageSize: 20, pass: tab.key, keyword: "" }}
                className={styles.filterLink}
              >
                {tab.label}
                {tab.count != null ? ` (${tab.count})` : ""}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
