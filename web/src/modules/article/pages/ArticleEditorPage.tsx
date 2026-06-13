import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { App, Button, Input, Spin } from "antd";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useIsPluginActive } from "@/hooks/useIsPluginActive";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  type ArticleVisibility,
  buildArticleSaveBody,
  type EditorCategory,
  type EditorTag,
  normalizeEditorCategory,
  normalizeEditorTags,
  visibilityFromArticle,
} from "@/modules/article/articleEditorApi";
import { fetchArticleCategories, fetchArticleTags } from "@/modules/article/articleListApi";
import styles from "@/modules/article/components/article-editor.module.css";
import { ArticleEditorSidebar } from "@/modules/article/components/ArticleEditorSidebar";
import { EditorMetaPanel } from "@/modules/article/components/EditorMetaPanel";
import type { ArticleListSearch } from "@/modules/article/pages/ArticleListPage";
import { getToolkitClient } from "@/shared/client";
import { coerceApiString } from "@/shared/coerceApiString";
import { MarkdownEditor } from "@/shared/components/Editor";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { httpClient } from "@/utils/http";

type ArticleDraft = {
  title: string;
  content: string;
  html: string;
  toc: string;
  summary: string;
  slug: string;
  seoKeywords: string;
  seoDescription: string;
  status: "draft" | "publish";
  cover: string | null;
  category: EditorCategory | null;
  tags: EditorTag[];
  isRecommended: boolean;
  isCommentable: boolean;
  visibility: ArticleVisibility;
  password: string | null;
};

const defaultArticleListSearch: ArticleListSearch = {
  page: 1,
  pageSize: 12,
  status: "",
  keyword: "",
  category: "",
  tag: "",
  month: "",
  author: "",
};

const emptyDraft = (): ArticleDraft => ({
  title: "",
  content: "",
  html: "",
  toc: "[]",
  summary: "",
  slug: "",
  seoKeywords: "",
  seoDescription: "",
  status: "draft",
  cover: null,
  category: null,
  tags: [],
  isRecommended: true,
  isCommentable: true,
  visibility: "public",
  password: null,
});

const EMPTY_CATEGORIES: EditorCategory[] = [];
const EMPTY_TAGS: EditorTag[] = [];

type ArticleEditorPageProps = {
  articleId?: string;
};

type ArticleSaveResponse = {
  id: string;
  status: string;
  summary?: string | null;
  slug?: string | null;
  seoKeywords?: string | null;
  seoDescription?: string | null;
};

export function ArticleEditorPage({ articleId }: ArticleEditorPageProps) {
  const isCreate = !articleId;
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  const { data: siteSettings } = useSiteSettings();
  const seoPluginActive = useIsPluginActive("seo");
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ArticleDraft>(emptyDraft);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const [editorReady, setEditorReady] = useState(isCreate);
  const [savedId, setSavedId] = useState<string | undefined>(articleId);
  const [dirty, setDirty] = useState(false);
  const { data: categories = EMPTY_CATEGORIES, isLoading: categoriesLoading } = useQuery({
    queryKey: ["article-categories"],
    queryFn: fetchArticleCategories,
    staleTime: 60_000,
  });

  const { data: tagOptions = EMPTY_TAGS, isLoading: tagsLoading } = useQuery({
    queryKey: ["article-tags"],
    queryFn: fetchArticleTags,
    staleTime: 60_000,
  });

  const metaLoading = categoriesLoading || tagsLoading;

  const {
    data: loaded,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["article", articleId],
    queryFn: async () => {
      const api = await getToolkitClient();
      return api.article.findById(articleId!) as Promise<Record<string, unknown>>;
    },
    enabled: Boolean(articleId),
  });

  useLayoutEffect(() => {
    if (isCreate) {
      setEditorReady(true);
      return;
    }
    if (!articleId || !loaded) {
      setEditorReady(false);
      return;
    }
    if (coerceApiString(loaded.id) !== String(articleId)) {
      setEditorReady(false);
      return;
    }
    setDraft({
      title: coerceApiString(loaded.title),
      content: coerceApiString(loaded.content),
      html: coerceApiString(loaded.html),
      toc: coerceApiString(loaded.toc, "[]"),
      summary: coerceApiString(loaded.summary),
      slug: coerceApiString(loaded.slug),
      seoKeywords: coerceApiString(loaded.seoKeywords),
      seoDescription: coerceApiString(loaded.seoDescription),
      status: loaded.status === "publish" ? "publish" : "draft",
      cover: (loaded.cover as string | null) ?? null,
      category: normalizeEditorCategory(loaded.category, categories),
      tags: normalizeEditorTags(loaded.tags, tagOptions),
      isRecommended: loaded.isRecommended !== false,
      isCommentable: loaded.isCommentable !== false,
      visibility: visibilityFromArticle(loaded),
      password: (loaded.password as string | null) ?? null,
    });
    setEditorReady(true);
    setDirty(false);
    // 仅随文章数据切换；分类/标签选项异步到达时由下方 effect 补全
    // eslint-disable-next-line react-hooks/exhaustive-deps -- categories/tagOptions 单独同步
  }, [isCreate, articleId, loaded]);

  useLayoutEffect(() => {
    if (isCreate || !loaded || !editorReady) return;
    if (coerceApiString(loaded.id) !== String(articleId)) return;

    setDraft((prev) => {
      const category = normalizeEditorCategory(loaded.category, categories);
      const tags = normalizeEditorTags(loaded.tags, tagOptions);
      if (prev.category?.id === category?.id && prev.tags.length === tags.length) {
        const sameTags = prev.tags.every((tag, i) => tag.id === tags[i]?.id);
        if (sameTags) return prev;
      }
      return { ...prev, category, tags };
    });
  }, [isCreate, articleId, loaded, editorReady, categories, tagOptions]);

  const patch = useCallback(<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const handleEditorChange = useCallback(
    ({ value, html, toc }: { value: string; html: string; toc: string }) => {
      const prev = draftRef.current;
      if (prev.content === value && prev.html === html && prev.toc === toc) {
        return;
      }
      setDirty(true);
      setDraft({ ...prev, content: value, html, toc });
    },
    [],
  );

  const validate = useCallback(() => {
    if (!draft.title.trim()) {
      message.warning(t("article.titleRequired"));
      return false;
    }
    if (!draft.content.trim()) {
      message.warning(t("article.contentRequired"));
      return false;
    }
    return true;
  }, [draft.content, draft.title, message, t]);

  const saveMutation = useMutation({
    mutationFn: async (status: "draft" | "publish") => {
      const body = buildArticleSaveBody({ ...draft, status }, { includeSeo: seoPluginActive });
      const id = savedId ?? articleId;
      if (id) {
        return httpClient.patch<ArticleSaveResponse>(`/article/${id}`, body);
      }
      return httpClient.post<ArticleSaveResponse>("/article", body);
    },
    onSuccess: (res) => {
      const id = String(res.id);
      setSavedId(id);
      setDirty(false);
      setDraft((prev) => ({
        ...prev,
        status: res.status === "publish" ? "publish" : "draft",
        summary: res.summary != null ? String(res.summary) : prev.summary,
        slug: res.slug != null ? String(res.slug) : prev.slug,
        seoKeywords: res.seoKeywords != null ? String(res.seoKeywords) : prev.seoKeywords,
        seoDescription:
          res.seoDescription != null ? String(res.seoDescription) : prev.seoDescription,
      }));
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      void queryClient.invalidateQueries({ queryKey: ["article", id] });
      message.success(
        res.status === "draft" ? t("article.draftSaved") : t("article.publishedSuccess"),
      );
      if (isCreate && id) {
        void navigate({ to: "/article/editor/$id", params: { id }, replace: true });
      }
    },
    onError: () => {
      message.error(t("common.saveFailed"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const api = await getToolkitClient();
      const id = savedId ?? articleId;
      if (!id) return;
      await api.article.deleteById(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      message.success(t("article.deletedSuccess"));
      void navigate({ to: "/article", search: defaultArticleListSearch });
    },
    onError: () => {
      message.error(t("common.deleteFailed"));
    },
  });

  const handleSave = (status: "draft" | "publish") => {
    if (!validate()) return;
    saveMutation.mutate(status);
  };

  const handleBack = () => {
    if (dirty) {
      modal.confirm({
        title: t("article.unsavedTitle"),
        content: t("article.unsavedContent"),
        okText: t("article.saveDraft"),
        cancelText: t("article.leaveWithoutSave"),
        onOk: async () => {
          handleSave("draft");
          void navigate({ to: "/article", search: defaultArticleListSearch });
        },
        onCancel: () => {
          void navigate({ to: "/article", search: defaultArticleListSearch });
        },
      });
      return;
    }
    void navigate({ to: "/article", search: defaultArticleListSearch });
  };

  const handleDelete = () => {
    modal.confirm({
      title: t("common.deleteConfirmTitle"),
      content: t("common.deleteConfirmContent"),
      okType: "danger",
      onOk: () => deleteMutation.mutateAsync(),
    });
  };

  const handlePreview = useCallback(() => {
    const id = savedId ?? articleId;
    if (!id) {
      message.warning(t("article.previewNeedSave"));
      return;
    }
    const base = typeof siteSettings?.systemUrl === "string" ? siteSettings.systemUrl.trim() : "";
    if (!base) {
      message.error(t("article.previewNoSiteUrl"));
      return;
    }
    const url = `${base.replace(/\/$/, "")}/article/${seoPluginActive && draft.slug.trim() ? draft.slug.trim() : id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [articleId, draft.slug, message, savedId, seoPluginActive, siteSettings?.systemUrl, t]);

  if (articleId && isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (articleId && isError) {
    return (
      <ModulePlaceholder
        title={t("article.editArticle")}
        description={t("article.editLoadError")}
      />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHead}>
        <div className={styles.pageHeadMain}>
          <h1 className={styles.pageTitle}>{t("article.writeArticle")}</h1>
          <Input
            className={styles.titleInput}
            placeholder={t("article.titlePlaceholder")}
            value={draft.title}
            onChange={(e) => patch("title", e.target.value)}
          />
        </div>
        <div className={styles.pageHeadActions}>
          <Button onClick={handleBack}>{t("common.cancel")}</Button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <div className={styles.editorArea}>
            {editorReady ? (
              <MarkdownEditor
                key={articleId ?? "create"}
                defaultValue={draft.content}
                restoreCache={isCreate}
                onChange={handleEditorChange}
              />
            ) : (
              <div className={styles.editorLoading}>
                <Spin />
              </div>
            )}
          </div>

          <div className={styles.metaStack}>
            <EditorMetaPanel title={t("article.summary")}>
              <Input.TextArea
                value={draft.summary}
                autoSize={{ minRows: 4, maxRows: 10 }}
                placeholder={t("article.summaryPlaceholder")}
                onChange={(e) => patch("summary", e.target.value)}
              />
              <p className={styles.hint}>{t("editor.excerptHint")}</p>
            </EditorMetaPanel>

            {seoPluginActive ? (
              <EditorMetaPanel title={t("article.seoTitle")} defaultOpen={false}>
                <label className={styles.label} htmlFor="article-seo-slug">
                  {t("article.seoSlug")}
                </label>
                <Input
                  id="article-seo-slug"
                  value={draft.slug}
                  placeholder={t("article.seoSlugPlaceholder")}
                  onChange={(e) => patch("slug", e.target.value)}
                />
                <p className={styles.hint}>{t("article.seoSlugHint")}</p>

                <label className={styles.label} htmlFor="article-seo-keywords">
                  {t("article.seoKeywords")}
                </label>
                <Input
                  id="article-seo-keywords"
                  value={draft.seoKeywords}
                  placeholder={t("article.seoKeywordsPlaceholder")}
                  onChange={(e) => patch("seoKeywords", e.target.value)}
                />
                <p className={styles.hint}>{t("article.seoKeywordsHint")}</p>

                <label className={styles.label} htmlFor="article-seo-description">
                  {t("article.seoDescription")}
                </label>
                <Input.TextArea
                  id="article-seo-description"
                  value={draft.seoDescription}
                  autoSize={{ minRows: 3, maxRows: 8 }}
                  placeholder={t("article.seoDescriptionPlaceholder")}
                  onChange={(e) => patch("seoDescription", e.target.value)}
                />
                <p className={styles.hint}>{t("article.seoDescriptionHint")}</p>
              </EditorMetaPanel>
            ) : null}
          </div>
        </div>

        <ArticleEditorSidebar
          status={draft.status}
          cover={draft.cover}
          category={draft.category}
          tags={draft.tags}
          categories={categories}
          tagOptions={tagOptions}
          metaLoading={metaLoading}
          visibility={draft.visibility}
          password={draft.password}
          isCommentable={draft.isCommentable}
          isRecommended={draft.isRecommended}
          saving={saveMutation.isPending}
          canPreview={Boolean(savedId ?? articleId)}
          canDelete={Boolean(savedId ?? articleId)}
          onCoverChange={(cover) => patch("cover", cover)}
          onCategoryChange={(category) => patch("category", category)}
          onTagsChange={(tags) => patch("tags", tags)}
          onVisibilityChange={(visibility) => {
            setDraft((prev) => ({
              ...prev,
              visibility,
              password: visibility === "public" ? null : prev.password,
            }));
            setDirty(true);
          }}
          onPasswordChange={(password) => patch("password", password)}
          onCommentableChange={(isCommentable) => patch("isCommentable", isCommentable)}
          onRecommendedChange={(isRecommended) => patch("isRecommended", isRecommended)}
          onSaveDraft={() => handleSave("draft")}
          onPublish={() => handleSave("publish")}
          onPreview={handlePreview}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
