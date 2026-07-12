/** 插件 Hook 使用的文章字段子集。 */
export interface ArticleDraft {
  title?: string;
  summary?: string | null;
  content?: string | null;
  html?: string | null;
  [key: string]: unknown;
}

export interface SummaryPluginConfig {
  /** 发布时摘要为空则自动生成 */
  enabled: boolean;
  maxLength: number;
  suffix: string;
  /** 正文为空时是否回退到标题 */
  fallbackToTitle: boolean;
}
