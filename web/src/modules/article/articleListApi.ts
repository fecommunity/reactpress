import type { AppLocale } from "@/i18n";
import { formatYearMonth } from "@/i18n/format";
import { ARTICLE_CATEGORY_OPTIONS, ARTICLE_TAG_OPTIONS } from "@/modules/article/constants";
import { getToolkitClient } from "@/shared/client";

export interface ArticleListSearch {
  page: number;
  pageSize: number;
  status: string;
  keyword: string;
  category: string;
  tag: string;
  month: string;
  author: string;
}

export type ArticleListRow = {
  id: string;
  title: string;
  status: string;
  views?: number;
  publishAt?: string | null;
  author?: string | { label?: string; username?: string };
  category?: { id?: string; label?: string; labelKey?: string; value?: string } | null;
  tags?: { label: string; value: string }[];
};

export type ArticleCategoryItem = {
  id: string;
  label: string;
  value: string;
};

export type ArticleTagItem = {
  id: string;
  label: string;
  value: string;
};

export type SelectOption = { label: string; value: string };

function normalizeCategories(list: ArticleCategoryItem[]): ArticleCategoryItem[] {
  return list.map((c) => ({
    id: String(c.id),
    label: c.label,
    value: c.value,
  }));
}

function normalizeTags(list: ArticleTagItem[]): ArticleTagItem[] {
  return list.map((t) => ({
    id: String(t.id),
    label: t.label,
    value: t.value,
  }));
}

export function resolveArticleAuthor(article: ArticleListRow, defaultAuthor: string): string {
  const raw = article.author;
  if (typeof raw === "string" && raw) return raw;
  if (raw && typeof raw === "object") {
    return raw.label ?? raw.username ?? defaultAuthor;
  }
  return defaultAuthor;
}

function applyClientFilters(
  list: ArticleListRow[],
  search: ArticleListSearch,
  defaultAuthor: string,
): ArticleListRow[] {
  let result = list;
  if (search.keyword) {
    result = result.filter((a) => a.title?.includes(search.keyword));
  }
  if (search.month) {
    result = result.filter((a) => a.publishAt?.startsWith(search.month));
  }
  if (search.author) {
    result = result.filter((a) => resolveArticleAuthor(a, defaultAuthor) === search.author);
  }
  if (search.category) {
    result = result.filter(
      (a) => a.category?.id === search.category || a.category?.value === search.category,
    );
  }
  return result;
}

export async function fetchArticleCategories(): Promise<ArticleCategoryItem[]> {
  try {
    const api = await getToolkitClient();
    const res = await api.category.findAll();
    const list = Array.isArray(res) ? (res as ArticleCategoryItem[]) : [];
    if (list.length > 0) return normalizeCategories(list);
  } catch {
    /* fall through */
  }
  return normalizeCategories(
    ARTICLE_CATEGORY_OPTIONS.map((c) => ({ id: c.id, label: c.label, value: c.value })),
  );
}

export async function fetchArticleTags(): Promise<ArticleTagItem[]> {
  try {
    const api = await getToolkitClient();
    const res = await api.tag.findAll();
    const list = Array.isArray(res) ? (res as ArticleTagItem[]) : [];
    if (list.length > 0) return normalizeTags(list);
  } catch {
    /* fall through */
  }
  return normalizeTags(
    ARTICLE_TAG_OPTIONS.map((t) => ({ id: t.id, label: t.label, value: t.value })),
  );
}

export async function fetchArticleMonthOptions(locale: AppLocale): Promise<SelectOption[]> {
  const api = await getToolkitClient();
  const res = await api.article.findAll({
    query: { page: 1, pageSize: 500, status: "publish" },
  } as Parameters<typeof api.article.findAll>[0]);
  const tuple = res as unknown as [{ publishAt?: string | null }[], number];
  const list = tuple[0] ?? [];
  const months = new Set<string>();
  for (const article of list) {
    if (article.publishAt) months.add(article.publishAt.slice(0, 7));
  }
  return [...months]
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: formatYearMonth(value, locale) }));
}

type ListQuery = Record<string, string | number>;

function buildListQuery(search: ArticleListSearch): ListQuery {
  const query: ListQuery = {
    page: search.page,
    pageSize: search.pageSize,
  };
  if (search.status) query.status = search.status;
  if (search.keyword) query.title = search.keyword;
  if (search.month) query.publishAt = search.month;
  return query;
}

export async function fetchArticles(
  search: ArticleListSearch,
  categories: ArticleCategoryItem[],
  defaultAuthor: string,
) {
  const api = await getToolkitClient();
  const query = buildListQuery(search);

  if (search.tag) {
    const res = await api.article.findArticlesByTag(search.tag, {
      query,
    } as Parameters<typeof api.article.findArticlesByTag>[1]);
    const tuple = res as unknown as [ArticleListRow[], number];
    let list = tuple[0] ?? [];
    let total = tuple[1] ?? 0;
    list = applyClientFilters(list, search, defaultAuthor);
    if (search.keyword || search.month || search.author || search.category) {
      total = list.length;
    }
    return { list, total };
  }

  if (search.category) {
    const cat = categories.find((c) => c.id === search.category);
    if (cat) {
      const res = await api.article.findArticlesByCategory(cat.value, {
        query,
      } as Parameters<typeof api.article.findArticlesByCategory>[1]);
      const tuple = res as unknown as [ArticleListRow[], number];
      let list = tuple[0] ?? [];
      let total = tuple[1] ?? 0;
      list = applyClientFilters(list, search, defaultAuthor);
      if (search.keyword || search.month || search.author) {
        total = list.length;
      }
      return { list, total };
    }
  }

  if (search.category) query.category = search.category;
  if (search.tag) query.tag = search.tag;

  const res = await api.article.findAll({
    query,
  } as Parameters<typeof api.article.findAll>[0]);
  const tuple = res as unknown as [ArticleListRow[], number];
  const list = applyClientFilters(tuple[0] ?? [], search, defaultAuthor);
  const total = search.author || search.category ? list.length : (tuple[1] ?? 0);
  return { list, total };
}
