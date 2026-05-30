import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Button, Checkbox, Input, Spin, Tag } from "antd";
import { type KeyboardEvent, type ReactNode, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  createEditorCategory,
  createEditorTag,
  type EditorCategory,
  type EditorTag,
} from "@/modules/article/articleEditorApi";

import styles from "./article-editor-sidebar.module.css";

type ArticleMetaFieldsBaseProps = {
  category: EditorCategory | null;
  tags: EditorTag[];
  categories: EditorCategory[];
  tagOptions: EditorTag[];
  metaLoading?: boolean;
  onCategoryChange: (category: EditorCategory | null) => void;
  onTagsChange: (tags: EditorTag[]) => void;
};

function categoryLabel(item: EditorCategory, t: (key: string) => string) {
  return item.labelKey ? t(item.labelKey) : item.label;
}

function renderOptionList(
  loading: boolean,
  empty: boolean,
  emptyText: string,
  children: ReactNode,
) {
  if (loading) {
    return (
      <div className={styles.metaLoading}>
        <Spin size="small" />
      </div>
    );
  }
  if (empty) {
    return <p className={styles.emptyHint}>{emptyText}</p>;
  }
  return children;
}

function useArticleTagActions({
  tags,
  tagOptions,
  onTagsChange,
}: Pick<ArticleMetaFieldsBaseProps, "tags" | "tagOptions" | "onTagsChange">) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");

  const addTagsByNames = useCallback(
    async (raw: string) => {
      const names = raw
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (!names.length) return;

      const next = [...tags];
      let addedCount = 0;
      let createdCount = 0;

      for (const name of names) {
        if (next.some((tag) => tag.label === name || tag.value === name)) continue;
        const existing = tagOptions.find((tag) => tag.label === name || tag.value === name);
        if (existing) {
          if (!next.some((tag) => tag.id === existing.id)) {
            next.push(existing);
            addedCount += 1;
          }
          continue;
        }
        try {
          const created = await createEditorTag(name);
          if (!next.some((tag) => tag.id === created.id)) {
            next.push(created);
            addedCount += 1;
            createdCount += 1;
          }
          void queryClient.invalidateQueries({ queryKey: ["article-tags"] });
        } catch {
          message.error(t("common.createFailed"));
          return;
        }
      }

      if (addedCount === 0) return;

      onTagsChange(next);
      setTagInput("");
      message.success(
        createdCount > 0 ? t("common.createdSuccess") : t("article.tagsAddedSuccess"),
      );
    },
    [message, onTagsChange, queryClient, t, tagOptions, tags],
  );

  const removeTag = (id: string) => {
    onTagsChange(tags.filter((tag) => tag.id !== id));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void addTagsByNames(tagInput);
    }
  };

  const unusedTags = tagOptions.filter((item) => !tags.some((tag) => tag.id === item.id));

  return {
    tagInput,
    setTagInput,
    addTagsByNames,
    removeTag,
    handleTagKeyDown,
    unusedTags,
  };
}

export function ArticleCategoryField({
  category,
  categories,
  metaLoading = false,
  onCategoryChange,
}: Pick<
  ArticleMetaFieldsBaseProps,
  "category" | "categories" | "metaLoading" | "onCategoryChange"
>) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const toggleCategory = (id: string, checked: boolean) => {
    if (checked) {
      const next = categories.find((c) => c.id === id) ?? null;
      onCategoryChange(next);
    } else if (category?.id === id) {
      onCategoryChange(null);
    }
  };

  const createCategoryMutation = useMutation({
    mutationFn: (label: string) => createEditorCategory(label),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: ["article-categories"] });
      onCategoryChange(created);
      setNewCategoryName("");
      setShowAddCategory(false);
      message.success(t("common.createdSuccess"));
    },
    onError: () => message.error(t("common.createFailed")),
  });

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    createCategoryMutation.mutate(name);
  };

  return (
    <>
      {renderOptionList(
        metaLoading,
        categories.length === 0 && !showAddCategory,
        t("article.noCategories"),
        <div className={styles.checkList}>
          {categories.map((item) => (
            <label key={item.id} className={styles.checkItem}>
              <Checkbox
                checked={category?.id === item.id}
                onChange={(e) => toggleCategory(item.id, e.target.checked)}
              />
              <span>{categoryLabel(item, t)}</span>
            </label>
          ))}
        </div>,
      )}
      <div className={styles.addMetaBlock}>
        {!showAddCategory ? (
          <Button
            type="link"
            className={styles.addMetaLink}
            onClick={() => setShowAddCategory(true)}
          >
            + {t("article.addNewCategory")}
          </Button>
        ) : (
          <div className={styles.addMetaForm}>
            <Input
              placeholder={t("article.categoryNamePlaceholder")}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onPressEnter={handleAddCategory}
            />
            <div className={styles.addMetaActions}>
              <Button
                type="primary"
                size="small"
                loading={createCategoryMutation.isPending}
                onClick={handleAddCategory}
              >
                {t("article.addCategory")}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategoryName("");
                }}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function ArticleTagsField({
  tags,
  tagOptions,
  metaLoading = false,
  onTagsChange,
}: Pick<ArticleMetaFieldsBaseProps, "tags" | "tagOptions" | "metaLoading" | "onTagsChange">) {
  const { t } = useTranslation();
  const { tagInput, setTagInput, addTagsByNames, removeTag, handleTagKeyDown, unusedTags } =
    useArticleTagActions({ tags, tagOptions, onTagsChange });

  return (
    <>
      {tags.length > 0 ? (
        <div className={styles.selectedTags}>
          {tags.map((tag) => (
            <Tag key={tag.id} closable onClose={() => removeTag(tag.id)}>
              {tag.label}
            </Tag>
          ))}
        </div>
      ) : null}
      <div className={styles.tagInputRow}>
        <Input
          placeholder={t("article.tagInputPlaceholder")}
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
        />
        <Button onClick={() => void addTagsByNames(tagInput)}>{t("article.addTags")}</Button>
      </div>
      <p className={styles.tagHint}>{t("article.separateTagsWithCommas")}</p>
      {metaLoading ? (
        <div className={styles.metaLoading}>
          <Spin size="small" />
        </div>
      ) : unusedTags.length > 0 ? (
        <div className={styles.mostUsedTags}>
          <span className={styles.mostUsedLabel}>{t("article.mostUsedTags")}</span>
          {unusedTags.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.tagChoice}
              onClick={() => onTagsChange([...tags, item])}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
