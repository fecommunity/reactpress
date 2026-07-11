import type { AppLocale } from "@/i18n";
import { formatYearMonth } from "@/i18n/format";
import { parsePaginated } from "@/shared/api/pagination";
import { getToolkitClient } from "@/shared/client";

export type MediaViewMode = "grid" | "list";

export type MediaListSearch = {
  page: number;
  pageSize: number;
  keyword: string;
  type: string;
  month: string;
  view: MediaViewMode;
};

export type MediaFileRow = {
  id: string;
  originalname: string;
  url: string;
  type: string;
  size: number;
  createAt: string;
  variants?: Record<
    string,
    {
      url: string;
      filename: string;
      width: number;
      height: number;
      size: number;
    }
  >;
};

export type SelectOption = { value: string; label: string };

type ListQuery = Record<string, string | number>;

function buildListQuery(search: MediaListSearch): ListQuery {
  const query: ListQuery = {
    page: search.page,
    pageSize: search.pageSize,
  };
  if (search.keyword) query.originalname = search.keyword;
  if (search.type) query.type = search.type;
  if (search.month) query.createAt = search.month;
  return query;
}

export async function fetchMediaFiles(search: MediaListSearch) {
  const api = await getToolkitClient();
  const res = await api.file.findAll({
    query: buildListQuery(search),
  } as Parameters<typeof api.file.findAll>[0]);
  return parsePaginated<MediaFileRow>(res);
}

export function buildMediaMonthOptions(locale: AppLocale, count = 24): SelectOption[] {
  const options: SelectOption[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label: formatYearMonth(value, locale) });
  }
  return options;
}

export function formatMediaSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageType(type: string) {
  return type?.startsWith("image/");
}
