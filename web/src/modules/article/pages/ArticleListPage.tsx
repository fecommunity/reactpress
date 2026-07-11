import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { App, Table, theme, Typography } from "antd";
import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "@/i18n/format";
import {
  type ArticleListRow,
  type ArticleListSearch,
  fetchArticleCategories,
  fetchArticleMonthOptions,
  fetchArticles,
  fetchArticleTags,
  resolveArticleAuthor,
} from "@/modules/article/articleListApi";
import styles from "@/modules/article/components/article-list.module.css";
import { ArticleListSubHeader } from "@/modules/article/components/ArticleListSubHeader";
import { ArticleListTablenav } from "@/modules/article/components/ArticleListTablenav";
import { articleListThemeVars } from "@/modules/article/components/articleListThemeVars";
import { defaultCommentSearch } from "@/routes/searchDefaults";
import { getToolkitClient } from "@/shared/client";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { useSettingsStore } from "@/stores/settings";

export type { ArticleListSearch };

interface ArticleListPageProps {
  search: ArticleListSearch;
  routePath: string;
}

async function fetchStatusCounts(): Promise<{ all: number; publish: number; draft: number }> {
  const api = await getToolkitClient();
  const fetchTotal = async (status?: string) => {
    const query: Record<string, string | number> = { page: 1, pageSize: 1 };
    if (status) query.status = status;
    const res = await api.article.findAll({ query } as Parameters<typeof api.article.findAll>[0]);
    const tuple = res as unknown as [unknown[], number];
    return tuple[1] ?? 0;
  };
  const [all, publish, draft] = await Promise.all([
    fetchTotal(),
    fetchTotal("publish"),
    fetchTotal("draft"),
  ]);
  return { all, publish, draft };
}

async function fetchCommentCountsByArticle(): Promise<Record<string, number>> {
  const api = await getToolkitClient();
  const res = await api.comment.findAll({
    query: { page: 1, pageSize: 500 },
  } as Parameters<typeof api.comment.findAll>[0]);
  const tuple = res as unknown as [{ hostId: string }[], number];
  const list = tuple[0] ?? [];
  const counts: Record<string, number> = {};
  for (const c of list) {
    if (c.hostId) counts[c.hostId] = (counts[c.hostId] ?? 0) + 1;
  }
  return counts;
}

export function ArticleListPage({ search, routePath }: ArticleListPageProps) {
  const navigate = useNavigate({ from: routePath as "/" });
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const defaultAuthor = t("article.defaultAuthor");
  const locale = useSettingsStore((s) => s.locale);
  const listThemeStyle = useMemo(() => articleListThemeVars(token), [token]);
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState(search.keyword);
  const [categoryDraft, setCategoryDraft] = useState(search.category || undefined);
  const [tagDraft, setTagDraft] = useState(search.tag || undefined);
  const [monthDraft, setMonthDraft] = useState(search.month || undefined);

  useEffect(() => {
    setKeywordInput(search.keyword);
  }, [search.keyword]);

  useEffect(() => {
    setCategoryDraft(search.category || undefined);
  }, [search.category]);

  useEffect(() => {
    setTagDraft(search.tag || undefined);
  }, [search.tag]);

  useEffect(() => {
    setMonthDraft(search.month || undefined);
  }, [search.month]);

  const { data: categories = [] } = useQuery({
    queryKey: ["article-categories"],
    queryFn: fetchArticleCategories,
    staleTime: 60_000,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["article-tags"],
    queryFn: fetchArticleTags,
    staleTime: 60_000,
  });

  const { data: monthOptions = [] } = useQuery({
    queryKey: ["article-month-options", locale],
    queryFn: () => fetchArticleMonthOptions(locale),
    staleTime: 60_000,
  });

  const categorySelectOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.label })),
    [categories],
  );

  const tagSelectOptions = useMemo(
    () => tags.map((tag) => ({ value: tag.value, label: tag.label })),
    [tags],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["articles", search, categories, defaultAuthor],
    queryFn: () => fetchArticles(search, categories, defaultAuthor),
    staleTime: 30_000,
  });

  const { data: statusCounts } = useQuery({
    queryKey: ["article-status-counts"],
    queryFn: fetchStatusCounts,
    staleTime: 30_000,
  });

  const { data: commentCounts = {} } = useQuery({
    queryKey: ["article-comment-counts"],
    queryFn: fetchCommentCountsByArticle,
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const api = await getToolkitClient();
      await api.article.deleteById(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      void queryClient.invalidateQueries({ queryKey: ["article-status-counts"] });
      void queryClient.invalidateQueries({ queryKey: ["article-month-options"] });
      message.success(t("article.deletedSuccess"));
    },
    onError: () => {
      message.error(t("common.deleteFailed"));
    },
  });

  const applySearch = useCallback(
    (patch: Partial<ArticleListSearch>) => {
      void navigate({
        search: (prev: ArticleListSearch) => ({ ...prev, page: 1, ...patch }),
      });
    },
    [navigate],
  );

  const applyListFilter = useCallback(
    (patch: Partial<ArticleListSearch>) => {
      if (patch.category !== undefined) {
        setCategoryDraft(patch.category || undefined);
        if (patch.category) setTagDraft(undefined);
      }
      if (patch.tag !== undefined) {
        setTagDraft(patch.tag || undefined);
        if (patch.tag) setCategoryDraft(undefined);
      }
      if (patch.month !== undefined) setMonthDraft(patch.month || undefined);
      applySearch(patch);
    },
    [applySearch],
  );

  const resolveCategoryId = useCallback(
    (category: ArticleListRow["category"]) => {
      if (!category) return undefined;
      if (category.id) return category.id;
      return categories.find((c) => c.value === category.value)?.id;
    },
    [categories],
  );

  const filterByCategory = useCallback(
    (category: ArticleListRow["category"]) => {
      const id = resolveCategoryId(category);
      if (!id) return;
      applyListFilter({ category: id, tag: "" });
    },
    [applyListFilter, resolveCategoryId],
  );

  const filterByTag = useCallback(
    (tagValue: string) => {
      applyListFilter({ tag: tagValue, category: "" });
    },
    [applyListFilter],
  );

  const filterByAuthor = useCallback(
    (record: ArticleListRow) => {
      const author = resolveArticleAuthor(record, defaultAuthor);
      applyListFilter({ author });
    },
    [applyListFilter, defaultAuthor],
  );

  const confirmDelete = useCallback(
    (record: ArticleListRow) => {
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

  const runSearch = () => applySearch({ keyword: keywordInput.trim() });

  const runFilter = () =>
    applySearch({
      category: categoryDraft ?? "",
      tag: tagDraft ?? "",
      month: monthDraft ?? "",
    });

  const columns = useMemo(() => {
    const categoryLabel = (category: ArticleListRow["category"]) => {
      if (!category) return null;
      if (category.label) return category.label;
      if (category.labelKey) return t(category.labelKey);
      const fromList = categories.find((c) => c.id === category.id || c.value === category.value);
      return fromList?.label ?? category.value ?? null;
    };

    return [
      {
        title: t("article.colTitle"),
        dataIndex: "title",
        className: styles.colTitle,
        render: (title: string, record: ArticleListRow) => (
          <div>
            <Link to="/article/editor/$id" params={{ id: record.id }} className={styles.cellLink}>
              <Typography.Text strong={record.status !== "draft"}>{title}</Typography.Text>
            </Link>
            <div className="row-actions">
              <Link
                to="/article/editor/$id"
                params={{ id: record.id }}
                className={styles.rowAction}
              >
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
        title: t("article.colAuthor"),
        key: "author",
        width: 120,
        render: (_: unknown, record: ArticleListRow) => {
          const author = resolveArticleAuthor(record, defaultAuthor);
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
        title: t("article.colCategories"),
        dataIndex: "category",
        width: 140,
        render: (category: ArticleListRow["category"]) => {
          const label = categoryLabel(category);
          if (!label) return "—";
          return (
            <button
              type="button"
              className={styles.filterLink}
              onClick={() => filterByCategory(category)}
            >
              {label}
            </button>
          );
        },
      },
      {
        title: t("article.colTags"),
        dataIndex: "tags",
        width: 200,
        render: (tags: ArticleListRow["tags"]) => {
          if (!tags?.length) return "—";
          return (
            <>
              {tags.map((tag, i) => (
                <span key={tag.value}>
                  {i > 0 ? ", " : ""}
                  <button
                    type="button"
                    className={styles.filterLink}
                    onClick={() => filterByTag(tag.value)}
                  >
                    {tag.label}
                  </button>
                </span>
              ))}
            </>
          );
        },
      },
      {
        title: (
          <span className={styles.colComments} title={t("article.colComments")}>
            <MessageCircle size={14} aria-hidden />
          </span>
        ),
        key: "comments",
        width: 56,
        align: "center" as const,
        className: styles.colComments,
        render: (_: unknown, record: ArticleListRow) => {
          const count = commentCounts[record.id];
          if (!count) return "—";
          return (
            <Link to="/article/comment" search={defaultCommentSearch}>
              {count}
            </Link>
          );
        },
      },
      {
        title: t("article.colDate"),
        dataIndex: "publishAt",
        width: 200,
        render: (_: string | null, record: ArticleListRow) => {
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
    ];
  }, [
    categories,
    commentCounts,
    confirmDelete,
    defaultAuthor,
    filterByAuthor,
    filterByCategory,
    filterByTag,
    locale,
    t,
  ]);

  const total = data?.total ?? 0;

  const tablenavProps = {
    monthValue: monthDraft,
    onMonthChange: setMonthDraft,
    monthOptions,
    categoryValue: categoryDraft,
    onCategoryChange: setCategoryDraft,
    categoryOptions: categorySelectOptions,
    tagValue: tagDraft,
    onTagChange: setTagDraft,
    tagOptions: tagSelectOptions,
    onFilter: runFilter,
    total,
    page: search.page,
    pageSize: search.pageSize,
    onPageChange: (page: number) => {
      void navigate({ search: (prev: ArticleListSearch) => ({ ...prev, page }) });
    },
  };

  if (isError) {
    return (
      <ModulePlaceholder title={t("article.listTitle")} description={t("article.listLoadError")} />
    );
  }

  return (
    <div className={styles.wrap} style={listThemeStyle}>
      <ArticleListSubHeader
        status={search.status}
        counts={statusCounts}
        onStatusChange={(status) => applySearch({ status })}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={runSearch}
      />
      <ArticleListTablenav position="top" {...tablenavProps} />
      <div className={styles.tableCard}>
        <Table<ArticleListRow>
          rowKey="id"
          size="small"
          loading={isLoading}
          dataSource={data?.list ?? []}
          pagination={false}
          columns={columns}
        />
      </div>
      <ArticleListTablenav position="bottom" compact {...tablenavProps} />
    </div>
  );
}
