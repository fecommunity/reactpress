import type { AppLocale } from "@/i18n";
import { formatYearMonth } from "@/i18n/format";
import { getToolkitClient } from "@/shared/client";
import { parsePaginated } from "@/shared/api/pagination";

export interface PageListSearch {
  page: number;
  pageSize: number;
  status: string;
  keyword: string;
  month: string;
  author: string;
}

export type PageListRow = {
  id: string;
  name: string;
  path: string;
  order?: number;
  views?: number;
  status: string;
  publishAt?: string | null;
  author?: string | { label?: string; username?: string };
};

export type SelectOption = { label: string; value: string };

export function resolvePageAuthor(page: PageListRow, defaultAuthor: string): string {
  const raw = page.author;
  if (typeof raw === "string" && raw) return raw;
  if (raw && typeof raw === "object") {
    return raw.label ?? raw.username ?? defaultAuthor;
  }
  return defaultAuthor;
}

function applyClientFilters(
  list: PageListRow[],
  search: PageListSearch,
  defaultAuthor: string,
): PageListRow[] {
  let result = list;
  if (search.keyword) {
    result = result.filter((p) => p.name?.includes(search.keyword));
  }
  if (search.month) {
    result = result.filter((p) => p.publishAt?.startsWith(search.month));
  }
  if (search.author) {
    result = result.filter((p) => resolvePageAuthor(p, defaultAuthor) === search.author);
  }
  return result;
}

export async function fetchPageMonthOptions(locale: AppLocale): Promise<SelectOption[]> {
  const api = await getToolkitClient();
  const res = await api.page.findAll({
    query: { page: 1, pageSize: 500, status: "publish" },
  } as Parameters<typeof api.page.findAll>[0]);
  const { list } = parsePaginated<{ publishAt?: string | null }>(res);
  const months = new Set<string>();
  for (const page of list) {
    if (page.publishAt) months.add(page.publishAt.slice(0, 7));
  }
  return [...months]
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: formatYearMonth(value, locale) }));
}

export async function fetchPages(search: PageListSearch, defaultAuthor: string) {
  const api = await getToolkitClient();
  const query: Record<string, string | number> = {
    page: search.page,
    pageSize: search.pageSize,
  };
  if (search.status) query.status = search.status;
  if (search.keyword) query.name = search.keyword;
  if (search.month) query.publishAt = search.month;

  const res = await api.page.findAll({ query } as Parameters<typeof api.page.findAll>[0]);
  const parsed = parsePaginated<PageListRow>(res);
  const list = applyClientFilters(parsed.list, search, defaultAuthor);
  const total = search.author ? list.length : parsed.total;
  return { list, total };
}
