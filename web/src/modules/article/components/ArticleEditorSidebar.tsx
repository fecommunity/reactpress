import { Button, Input, Select, Switch } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  ArticleVisibility,
  EditorCategory,
  EditorTag,
} from "@/modules/article/articleEditorApi";
import {
  ArticleCategoryField,
  ArticleTagsField,
} from "@/modules/article/components/ArticleCategoryTagsFields";
import { MediaSelectDrawer } from "@/shared/components/MediaSelectDrawer";
import styles from "./article-editor-sidebar.module.css";

export type ArticleEditorSidebarProps = {
  status: "draft" | "publish";
  cover: string | null;
  category: EditorCategory | null;
  tags: EditorTag[];
  categories: EditorCategory[];
  tagOptions: EditorTag[];
  metaLoading?: boolean;
  visibility: ArticleVisibility;
  password: string | null;
  isCommentable: boolean;
  isRecommended: boolean;
  saving: boolean;
  canPreview: boolean;
  canDelete: boolean;
  onCoverChange: (value: string | null) => void;
  onCategoryChange: (category: EditorCategory | null) => void;
  onTagsChange: (tags: EditorTag[]) => void;
  onVisibilityChange: (visibility: ArticleVisibility) => void;
  onPasswordChange: (value: string | null) => void;
  onCommentableChange: (value: boolean) => void;
  onRecommendedChange: (value: boolean) => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onDelete: () => void;
  onPreview?: () => void;
};

export function ArticleEditorSidebar({
  status,
  cover,
  category,
  tags,
  categories,
  tagOptions,
  metaLoading = false,
  visibility,
  password,
  isCommentable,
  isRecommended,
  saving,
  canPreview,
  canDelete,
  onCoverChange,
  onCategoryChange,
  onTagsChange,
  onVisibilityChange,
  onPasswordChange,
  onCommentableChange,
  onRecommendedChange,
  onSaveDraft,
  onPublish,
  onDelete,
  onPreview,
}: ArticleEditorSidebarProps) {
  const { t } = useTranslation();
  const [mediaOpen, setMediaOpen] = useState(false);

  return (
    <aside className={styles.sidebar}>
      <section className={styles.box}>
        <header className={styles.boxHeader}>{t("editor.publishBox")}</header>
        <div className={styles.boxBody}>
          <dl className={styles.metaList}>
            <div>
              <dt>{t("editor.status")}</dt>
              <dd>{status === "publish" ? t("article.published") : t("article.draft")}</dd>
            </div>
          </dl>
          <div className={styles.visibilityBlock}>
            <label className={styles.fieldLabel} htmlFor="article-visibility">
              {t("editor.visibility")}
            </label>
            <Select
              id="article-visibility"
              className={styles.visibilitySelect}
              value={visibility}
              onChange={onVisibilityChange}
              options={[
                { value: "public", label: t("editor.visibilityPublic") },
                { value: "private", label: t("editor.visibilityPrivate") },
              ]}
            />
            {visibility === "private" ? (
              <div className={styles.passwordBlock}>
                <label className={styles.fieldLabel} htmlFor="article-password">
                  {t("article.password")}
                </label>
                <Input.Password
                  id="article-password"
                  className={styles.passwordInput}
                  value={password ?? ""}
                  placeholder={t("article.passwordPlaceholder")}
                  onChange={(e) => onPasswordChange(e.target.value.trim() || null)}
                />
              </div>
            ) : null}
          </div>
          <div className={styles.publishRow}>
            <Button loading={saving} onClick={onSaveDraft}>
              {t("article.saveDraft")}
            </Button>
            <Button disabled={!canPreview} onClick={onPreview}>
              {t("editor.preview")}
            </Button>
            <Button type="primary" loading={saving} onClick={onPublish}>
              {t("article.publish")}
            </Button>
          </div>
          {canDelete ? (
            <Button type="link" danger className={styles.deleteLink} onClick={onDelete}>
              {t("common.delete")}
            </Button>
          ) : null}
        </div>
      </section>

      <section className={styles.box}>
        <header className={styles.boxHeader}>{t("editor.featuredImage")}</header>
        <div className={styles.boxBody}>
          <button
            type="button"
            className={styles.coverPreviewWrap}
            onClick={() => setMediaOpen(true)}
            aria-label={t("editor.setFeaturedImage")}
          >
            {cover ? (
              <img src={cover} alt="" className={styles.coverPreview} />
            ) : (
              <span className={styles.coverPlaceholder}>{t("editor.setFeaturedImage")}</span>
            )}
          </button>
          <Input
            className={styles.coverInput}
            placeholder={t("editor.coverUrlPlaceholder")}
            value={cover ?? ""}
            onChange={(e) => onCoverChange(e.target.value.trim() || null)}
          />
          {cover ? (
            <Button type="link" className={styles.coverRemove} onClick={() => onCoverChange(null)}>
              {t("editor.removeCover")}
            </Button>
          ) : null}
        </div>
      </section>

      <section className={styles.box}>
        <header className={styles.boxHeader}>{t("article.category")}</header>
        <div className={styles.boxBody}>
          <ArticleCategoryField
            category={category}
            categories={categories}
            metaLoading={metaLoading}
            onCategoryChange={onCategoryChange}
          />
        </div>
      </section>

      <section className={styles.box}>
        <header className={styles.boxHeader}>{t("editor.tags")}</header>
        <div className={styles.boxBody}>
          <ArticleTagsField
            tags={tags}
            tagOptions={tagOptions}
            metaLoading={metaLoading}
            onTagsChange={onTagsChange}
          />
        </div>
      </section>

      <section className={styles.box}>
        <header className={styles.boxHeader}>{t("editor.discussion")}</header>
        <div className={styles.boxBody}>
          <div className={styles.switchRow}>
            <span>{t("article.allowComment")}</span>
            <Switch checked={isCommentable} onChange={onCommentableChange} />
          </div>
          <div className={styles.switchRow}>
            <span>{t("article.recommendHome")}</span>
            <Switch checked={isRecommended} onChange={onRecommendedChange} />
          </div>
        </div>
      </section>

      <MediaSelectDrawer
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => onCoverChange(url)}
      />
    </aside>
  );
}
