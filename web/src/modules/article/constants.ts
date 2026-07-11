export type ArticleCategoryOption = {
  id: string;
  labelKey: string;
  /** Display name (API field); falls back to i18n via labelKey when absent. */
  label: string;
  value: string;
};

export type ArticleTagOption = {
  id: string;
  label: string;
  value: string;
};

export const ARTICLE_CATEGORY_OPTIONS: ArticleCategoryOption[] = [
  { id: "1", labelKey: "article.categoryProduct", label: "产品动态", value: "product" },
  { id: "2", labelKey: "article.categoryEngineering", label: "技术实践", value: "engineering" },
  { id: "3", labelKey: "article.categoryCulture", label: "团队文化", value: "culture" },
];

export const ARTICLE_TAG_OPTIONS: ArticleTagOption[] = [
  { id: "1", label: "ReactPress", value: "reactpress" },
  { id: "2", label: "Vite", value: "vite" },
  { id: "3", label: "TypeScript", value: "typescript" },
  { id: "4", label: "DevOps", value: "devops" },
];
