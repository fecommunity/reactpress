import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { App, Avatar, Table, theme } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDate, localeToIntlTag } from "@/i18n/format";
import { articleListThemeVars } from "@/modules/article/components/articleListThemeVars";
import {
  type CommentListSearch,
  type CommentRow,
  fetchArticleTitleMap,
  fetchCommentCountsByArticle,
  fetchComments,
  fetchCommentStatusCounts,
} from "@/modules/comment/commentListApi";
import styles from "@/modules/comment/components/comment-list.module.css";
import { CommentListSubHeader } from "@/modules/comment/components/CommentListSubHeader";
import {
  type CommentBulkAction,
  CommentListTablenav,
} from "@/modules/comment/components/CommentListTablenav";
import { PENDING_COMMENT_COUNT_QUERY_KEY } from "@/modules/comment/pendingCommentCountApi";
import { getToolkitClient } from "@/shared/client";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { useSettingsStore } from "@/stores/settings";
import { httpClient } from "@/utils/http";

export type { CommentListSearch };

interface CommentListPageProps {
  search: CommentListSearch;
  routePath: string;
}

function invalidateCommentQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["comments"] });
  void queryClient.invalidateQueries({ queryKey: ["comment-status-counts"] });
  void queryClient.invalidateQueries({ queryKey: PENDING_COMMENT_COUNT_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: ["article-comment-counts"] });
}

export function CommentListPage({ search, routePath }: CommentListPageProps) {
  const navigate = useNavigate({ from: routePath as "/" });
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const listThemeStyle = useMemo(() => articleListThemeVars(token), [token]);
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState(search.keyword);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<CommentBulkAction | undefined>();

  useEffect(() => {
    setKeywordInput(search.keyword);
  }, [search.keyword]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments", search],
    queryFn: () => fetchComments(search),
    staleTime: 30_000,
  });

  const { data: statusCounts } = useQuery({
    queryKey: ["comment-status-counts"],
    queryFn: fetchCommentStatusCounts,
    staleTime: 30_000,
  });

  const { data: articleTitles = {} } = useQuery({
    queryKey: ["comment-article-titles"],
    queryFn: fetchArticleTitleMap,
    staleTime: 60_000,
  });

  const { data: commentCounts = {} } = useQuery({
    queryKey: ["article-comment-counts"],
    queryFn: fetchCommentCountsByArticle,
    staleTime: 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, pass }: { id: string; pass: boolean }) => {
      await httpClient.patch(`/comment/${id}`, { pass });
    },
    onSuccess: () => {
      invalidateCommentQueries(queryClient);
      message.success(t("comment.statusUpdated"));
    },
    onError: () => {
      message.error(t("common.updateFailed"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const api = await getToolkitClient();
      await api.comment.deleteById(id);
    },
    onSuccess: () => {
      invalidateCommentQueries(queryClient);
      message.success(t("comment.deletedSuccess"));
    },
    onError: () => {
      message.error(t("common.deleteFailed"));
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, action }: { ids: string[]; action: CommentBulkAction }) => {
      const api = await getToolkitClient();
      if (action === "delete") {
        await Promise.all(ids.map((id) => api.comment.deleteById(id)));
        return;
      }
      const pass = action === "approve";
      await Promise.all(ids.map((id) => httpClient.patch(`/comment/${id}`, { pass })));
    },
    onSuccess: () => {
      invalidateCommentQueries(queryClient);
      setSelectedRowKeys([]);
      setBulkAction(undefined);
      message.success(t("comment.bulkSuccess"));
    },
    onError: () => {
      message.error(t("common.updateFailed"));
    },
  });

  const applySearch = useCallback(
    (patch: Partial<CommentListSearch>) => {
      void navigate({
        search: (prev: CommentListSearch) => ({ ...prev, page: 1, ...patch }),
      });
    },
    [navigate],
  );

  const confirmDelete = useCallback(
    (record: CommentRow) => {
      modal.confirm({
        title: t("comment.deleteTitle"),
        content: t("common.deleteConfirmContent"),
        okText: t("common.delete"),
        okType: "danger",
        cancelText: t("common.cancel"),
        onOk: () => deleteMutation.mutateAsync(record.id),
      });
    },
    [deleteMutation, modal, t],
  );

  const filterByAuthor = useCallback(
    (record: CommentRow) => {
      applySearch({ keyword: record.name });
      setKeywordInput(record.name);
    },
    [applySearch],
  );

  const runSearch = () => applySearch({ keyword: keywordInput.trim() });

  const runBulkApply = () => {
    if (!bulkAction || selectedRowKeys.length === 0) return;
    if (bulkAction === "delete") {
      modal.confirm({
        title: t("comment.deleteTitle"),
        content: t("comment.bulkDeleteConfirm", { count: selectedRowKeys.length }),
        okText: t("common.delete"),
        okType: "danger",
        cancelText: t("common.cancel"),
        onOk: () => bulkMutation.mutateAsync({ ids: selectedRowKeys, action: bulkAction }),
      });
      return;
    }
    bulkMutation.mutate({ ids: selectedRowKeys, action: bulkAction });
  };

  const formatSubmitted = useCallback(
    (value: string) => {
      const date = new Date(value);
      const time = date.toLocaleTimeString(localeToIntlTag(locale), {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { date: formatDate(value, locale), time };
    },
    [locale],
  );

  const columns = useMemo(
    () => [
      {
        title: t("comment.colAuthor"),
        key: "author",
        width: 220,
        render: (_: unknown, record: CommentRow) => (
          <div className={styles.authorCell}>
            <Avatar size={32} className={styles.authorAvatar}>
              {record.name.slice(0, 1).toUpperCase()}
            </Avatar>
            <div className={styles.authorMeta}>
              <button
                type="button"
                className={styles.filterLink}
                onClick={() => filterByAuthor(record)}
              >
                <span className={styles.authorName}>{record.name}</span>
              </button>
              <a className={styles.authorEmail} href={`mailto:${record.email}`}>
                {record.email}
              </a>
            </div>
          </div>
        ),
      },
      {
        title: t("comment.colComment"),
        dataIndex: "content",
        className: styles.colComment,
        render: (content: string, record: CommentRow) => (
          <div className={styles.commentContent}>
            <div>{content}</div>
            <div className="row-actions">
              {!record.pass ? (
                <>
                  <button
                    type="button"
                    className={styles.rowAction}
                    onClick={() => updateMutation.mutate({ id: record.id, pass: true })}
                  >
                    {t("comment.approve")}
                  </button>
                  <span className={styles.rowActionSep}>|</span>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.rowAction}
                    onClick={() => updateMutation.mutate({ id: record.id, pass: false })}
                  >
                    {t("comment.unapprove")}
                  </button>
                  <span className={styles.rowActionSep}>|</span>
                </>
              )}
              <button
                type="button"
                className={`${styles.rowAction} ${styles.rowActionDanger}`}
                onClick={() => confirmDelete(record)}
              >
                {t("common.delete")}
              </button>
            </div>
          </div>
        ),
      },
      {
        title: t("comment.colInResponseTo"),
        key: "response",
        width: 220,
        render: (_: unknown, record: CommentRow) => {
          const title = articleTitles[record.hostId] ?? record.url ?? "—";
          const count = commentCounts[record.hostId];
          return (
            <div>
              <span className={styles.responseTitle}>{title}</span>
              <div className={styles.responseMeta}>
                {record.url ? (
                  <a
                    className={styles.filterLink}
                    href={record.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("comment.viewPost")}
                  </a>
                ) : null}
                {count ? <span className={styles.responseBadge}>{count}</span> : null}
              </div>
            </div>
          );
        },
      },
      {
        title: t("comment.colSubmitted"),
        dataIndex: "createAt",
        width: 140,
        render: (value: string) => {
          const { date, time } = formatSubmitted(value);
          return (
            <div>
              <span className={styles.submittedDate}>{date}</span>
              <span className={styles.submittedTime}>{time}</span>
            </div>
          );
        },
      },
    ],
    [
      articleTitles,
      commentCounts,
      confirmDelete,
      filterByAuthor,
      formatSubmitted,
      t,
      updateMutation,
    ],
  );

  const total = data?.total ?? 0;

  const tablenavProps = {
    bulkAction,
    onBulkActionChange: setBulkAction,
    onBulkApply: runBulkApply,
    bulkApplying: bulkMutation.isPending,
    bulkDisabled: selectedRowKeys.length === 0,
    total,
    page: search.page,
    pageSize: search.pageSize,
    onPageChange: (page: number) => {
      void navigate({ search: (prev: CommentListSearch) => ({ ...prev, page }) });
    },
  };

  if (isError) {
    return (
      <ModulePlaceholder title={t("comment.manageTitle")} description={t("comment.loadError")} />
    );
  }

  return (
    <div className={styles.wrap} style={listThemeStyle}>
      <CommentListSubHeader
        pass={search.pass}
        counts={statusCounts}
        onPassChange={(pass) => applySearch({ pass })}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={runSearch}
      />
      <CommentListTablenav position="top" {...tablenavProps} />
      <div className={styles.tableCard}>
        <Table<CommentRow>
          rowKey="id"
          size="small"
          loading={isLoading}
          dataSource={data?.list ?? []}
          pagination={false}
          rowClassName={(record) => (!record.pass ? "rowPending" : "")}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as string[]),
          }}
          columns={columns}
        />
      </div>
      <CommentListTablenav position="bottom" compact {...tablenavProps} />
    </div>
  );
}
