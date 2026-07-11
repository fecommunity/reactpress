/** 插件 Hook 使用的文章字段子集。 */
export interface ArticleDraft {
  title?: string;
  summary?: string | null;
  content?: string | null;
  html?: string | null;
  slug?: string | null;
  seoKeywords?: string | null;
  seoDescription?: string | null;
  tags?: Array<{ label?: string; value?: string } | string> | string;
  [key: string]: unknown;
}

export interface SeoPluginConfig {
  enabled: boolean;
  autoSlug: boolean;
  autoDescription: boolean;
  autoKeywords: boolean;
  descriptionMaxLength: number;
  descriptionSuffix: string;
}
