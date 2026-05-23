import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Table, Typography, theme } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getToolkitClient } from "@/shared/client";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { PageListSubHeader } from "@/modules/page/components/PageListSubHeader";
import { PageListTablenav } from "@/modules/page/components/PageListTablenav";
import styles from "@/modules/article/components/article-list.module.css";
import { articleListThemeVars } from "@/modules/article/components/articleListThemeVars";
import {
  fetchPageMonthOptions,
  fetchPageStatusCounts,
  fetchPages,
  resolvePageAuthor,
  type PageListRow,
  type PageListSearch,
} from "@/modules/page/pageListApi";
import { formatDateTime } from "@/i18n/format";
import { useSettingsStore } from "@/stores/settings";

export type { PageListSearch };

interface PageListPageProps {
  search: PageListSearch;
  routePath: string;
}

export function PageListPage({ search, routePath }: PageListPageProps) {
  const navigate = useNavigate({ from: routePath as "/" });
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const defaultAuthor = t("article.defaultAuthor");
  const locale = useSettingsStore((s) => s.locale);
  const listThemeStyle = useMemo(() => articleListThemeVars(token), [token]);
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState(search.keyword);
  const [monthDraft, setMonthDraft] = useState(search.month || undefined);

  useEffect(() => {
    setKeywordInput(search.keyword);
  }, [search.keyword]);

  useEffect(() => {
    setMonthDraft(search.month || undefined);
  }, [search.month]);

  const { data: monthOptions = [] } = useQuery({
    queryKey: ["page-month-options", locale],
    queryFn: () => fetchPageMonthOptions(locale),
    staleTime: 60_000,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pages", search, defaultAuthor],
    queryFn: () => fetchPages(search, defaultAuthor),
    staleTime: 30_000,
  });

  const { data: statusCounts } = useQuery({
    queryKey: ["page-status-counts"],
    queryFn: fetchPageStatusCounts,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const api = await getToolkitClient();
      await api.page.deleteById(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pages"] });
      void queryClient.invalidateQueries({ queryKey: ["page-status-counts"] });
      void queryClient.invalidateQueries({ queryKey: ["page-month-options"] });
      message.success(t("page.deletedSuccess"));
    },
    onError: () => message.error(t("common.deleteFailed")),
  });

  const applySearch = useCallback(
    (patch: Partial<PageListSearch>) => {
      void navigate({
        search: (prev: PageListSearch) => ({ ...prev, page: 1, ...patch }),
      });
    },
    [navigate],
  );

  const runSearch = () => applySearch({ keyword: keywordInput.trim() });

  const runFilter = () => applySearch({ month: monthDraft ?? "" });

  const filterByAuthor = useCallback(
    (record: PageListRow) => {
      const author = resolvePageAuthor(record, defaultAuthor);
      applySearch({ author });
    },
    [applySearch, defaultAuthor],
  );

  const confirmDelete = useCallback(
    (record: PageListRow) => {
      modal.confirm({
        title: t("common.deleteConfirmTitle"),
        content: t("common.deleteConfirmContent"),
        okText: t("common.delete"),
        okType: "danger",
        cancelText: t("common.cancel"),
        onOk: () => deleteMutation.mutateAsync(record.id),
      });
    },
    [deleteMutation, modal, t],
  );

  const columns = useMemo(
    () => [
      {
        title: t("page.name"),
        dataIndex: "name",
        className: styles.colTitle,
        render: (name: string, record: PageListRow) => (
          <div>
            <Link to="/page/editor/$id" params={{ id: record.id }} className={styles.cellLink}>
              <Typography.Text strong={record.status !== "draft"}>{name}</Typography.Text>
            </Link>
            <div className="row-actions">
              <Link to="/page/editor/$id" params={{ id: record.id }} className={styles.rowAction}>
                {t("common.edit")}
              </Link>
              <span className={styles.rowActionSep}>|</span>
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
        title: t("page.path"),
        dataIndex: "path",
        width: 140,
        ellipsis: true,
      },
      {
        title: t("article.colAuthor"),
        key: "author",
        width: 120,
        render: (_: unknown, record: PageListRow) => {
          const author = resolvePageAuthor(record, defaultAuthor);
          return (
            <button
              type="button"
              className={styles.filterLink}
              onClick={() => filterByAuthor(record)}
            >
              {author}
            </button>
          );
        },
      },
      {
        title: t("article.colDate"),
        dataIndex: "publishAt",
        width: 160,
        render: (_: string | null, record: PageListRow) => {
          const isDraft = record.status === "draft";
          const statusLabel = isDraft ? t("article.draft") : t("article.published");
          const dateValue = record.publishAt;
          return (
            <div>
              <span className={styles.dateStatus}>{statusLabel}</span>
              <span className={styles.dateTime}>
                {dateValue ? formatDateTime(dateValue, locale) : "—"}
              </span>
            </div>
          );
        },
      },
    ],
    [confirmDelete, defaultAuthor, filterByAuthor, locale, t],
  );

  const total = data?.total ?? 0;

  const tablenavProps = {
    monthValue: monthDraft,
    onMonthChange: setMonthDraft,
    monthOptions,
    onFilter: runFilter,
    total,
    page: search.page,
    pageSize: search.pageSize,
    onPageChange: (page: number) => {
      void navigate({ search: (prev: PageListSearch) => ({ ...prev, page }) });
    },
  };

  if (isError) {
    return <ModulePlaceholder title={t("page.listTitle")} description={t("page.loadError")} />;
  }

  return (
    <div className={styles.wrap} style={listThemeStyle}>
      <PageListSubHeader
        status={search.status}
        counts={statusCounts}
        onStatusChange={(status) => applySearch({ status })}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={runSearch}
      />
      <PageListTablenav position="top" {...tablenavProps} />
      <div className={styles.tableCard}>
        <Table<PageListRow>
          rowKey="id"
          size="small"
          loading={isLoading}
          dataSource={data?.list ?? []}
          pagination={false}
          columns={columns}
        />
      </div>
      <PageListTablenav position="bottom" compact {...tablenavProps} />
    </div>
  );
}
