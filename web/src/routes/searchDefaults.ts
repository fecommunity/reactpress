/** Default TanStack Router `search` for list routes (required when linking without prior navigation). */

export const defaultArticleSearch = {
  page: 1,
  pageSize: 20,
  status: "",
  keyword: "",
  category: "",
  tag: "",
  month: "",
  author: "",
} as const;

export const defaultCommentSearch = {
  page: 1,
  pageSize: 20,
  pass: "",
  keyword: "",
} as const;

export const defaultMediaSearch = {
  page: 1,
  pageSize: 60,
  keyword: "",
  type: "",
  month: "",
  view: "grid" as const,
};

export const defaultUsersSearch = {
  page: 1,
  pageSize: 20,
  sortField: null,
  sortOrder: null,
  keyword: "",
  role: "",
} as const;

export const defaultPageSearch = {
  page: 1,
  pageSize: 20,
  status: "",
  keyword: "",
  month: "",
  author: "",
} as const;
