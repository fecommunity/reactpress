/** Built-in admin UI slot identifiers. Plugins register React components against these ids. */
export const AdminSlotIds = {
  /** 文章编辑器 · 摘要面板下方（SEO、自定义 meta 等） */
  ARTICLE_EDITOR_META_AFTER_SUMMARY: 'article.editor.meta.afterSummary',
  /** 文章编辑器 · 右侧发布框下方 */
  ARTICLE_EDITOR_SIDEBAR_AFTER_PUBLISH: 'article.editor.sidebar.afterPublish',
} as const;

export type AdminSlotId = (typeof AdminSlotIds)[keyof typeof AdminSlotIds];

/** All built-in slot ids — used for manifest validation and JSON Schema enum. */
export const ALL_ADMIN_SLOT_IDS: readonly AdminSlotId[] = Object.values(AdminSlotIds);

export function isAdminSlotId(value: string): value is AdminSlotId {
  return (ALL_ADMIN_SLOT_IDS as readonly string[]).includes(value);
}

export interface AdminSlotDefinition {
  id: AdminSlotId;
  /** Human-readable label for plugin authors / docs */
  title: string;
  /** Core module that owns the host surface */
  module: string;
  description?: string;
}

/** Draft fields exposed to article editor slots. Host pages may extend via `context`. */
export interface ArticleEditorDraftFields {
  title: string;
  summary: string;
  slug: string;
  seoKeywords: string;
  seoDescription: string;
  status: 'draft' | 'publish';
}

/** Context passed to `article.editor.*` slot components from the article editor page. */
export interface ArticleEditorAdminSlotContext {
  articleId?: string;
  draft: ArticleEditorDraftFields;
  patch: <K extends keyof ArticleEditorDraftFields>(
    key: K,
    value: ArticleEditorDraftFields[K],
  ) => void;
  /** Host-provided i18n helper (typically `react-i18next` `t`). */
  translate: (key: string) => string;
}
