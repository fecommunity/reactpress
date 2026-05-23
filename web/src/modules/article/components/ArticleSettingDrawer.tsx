import { Button, Drawer, Input, Select, Switch } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ARTICLE_CATEGORY_OPTIONS,
  ARTICLE_TAG_OPTIONS,
  type ArticleCategoryOption,
  type ArticleTagOption,
} from "@/modules/article/constants";

export type ArticleSettings = {
  summary: string;
  password: string | null;
  isCommentable: boolean;
  isRecommended: boolean;
  category: ArticleCategoryOption | null;
  tags: ArticleTagOption[];
  cover: string | null;
};

const defaultSettings: ArticleSettings = {
  summary: "",
  password: null,
  isCommentable: true,
  isRecommended: true,
  category: null,
  tags: [],
  cover: null,
};

type ArticleSettingDrawerProps = {
  open: boolean;
  initial?: Partial<ArticleSettings>;
  onClose: () => void;
  onSave: (settings: ArticleSettings) => void;
};

export function ArticleSettingDrawer({
  open,
  initial,
  onClose,
  onSave,
}: ArticleSettingDrawerProps) {
  const { t } = useTranslation();
  const [attrs, setAttrs] = useState<ArticleSettings>(defaultSettings);

  const categoryOptions = useMemo(
    () =>
      ARTICLE_CATEGORY_OPTIONS.map((c) => ({
        label: t(c.labelKey),
        value: c.id,
      })),
    [t],
  );

  useEffect(() => {
    if (open) {
      setAttrs({
        ...defaultSettings,
        ...initial,
        tags: initial?.tags ?? [],
      });
    }
  }, [open, initial]);

  return (
    <Drawer
      width={480}
      title={t("article.settings")}
      open={open}
      onClose={onClose}
      footer={
        <div style={{ textAlign: "right" }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            {t("common.cancel")}
          </Button>
          <Button type="primary" onClick={() => onSave(attrs)}>
            {t("common.ok")}
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          <div style={{ marginBottom: 8 }}>{t("article.summary")}</div>
          <Input.TextArea
            placeholder={t("article.summaryPlaceholder")}
            autoSize={{ minRows: 4, maxRows: 8 }}
            value={attrs.summary}
            onChange={(e) => setAttrs((s) => ({ ...s, summary: e.target.value }))}
          />
        </label>
        <label>
          <div style={{ marginBottom: 8 }}>{t("article.password")}</div>
          <Input.Password
            placeholder={t("article.passwordPlaceholder")}
            value={attrs.password ?? ""}
            onChange={(e) => setAttrs((s) => ({ ...s, password: e.target.value.trim() || null }))}
          />
        </label>
        <label>
          <div style={{ marginBottom: 8 }}>{t("article.coverUrl")}</div>
          <Input
            placeholder="https://..."
            value={attrs.cover ?? ""}
            onChange={(e) => setAttrs((s) => ({ ...s, cover: e.target.value.trim() || null }))}
          />
        </label>
        <label>
          <div style={{ marginBottom: 8 }}>{t("article.category")}</div>
          <Select
            allowClear
            style={{ width: "100%" }}
            placeholder={t("article.selectCategory")}
            value={attrs.category?.id}
            onChange={(id) => {
              const category = ARTICLE_CATEGORY_OPTIONS.find((c) => c.id === id) ?? null;
              setAttrs((s) => ({ ...s, category }));
            }}
            options={categoryOptions}
          />
        </label>
        <label>
          <div style={{ marginBottom: 8 }}>{t("article.selectTags")}</div>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder={t("article.selectTags")}
            value={attrs.tags.map((tag) => tag.id)}
            onChange={(ids) => {
              const tags = ARTICLE_TAG_OPTIONS.filter((tag) => ids.includes(tag.id));
              setAttrs((s) => ({ ...s, tags }));
            }}
            options={ARTICLE_TAG_OPTIONS.map((tag) => ({ label: tag.label, value: tag.id }))}
          />
        </label>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{t("article.allowComment")}</span>
          <Switch
            checked={attrs.isCommentable}
            onChange={(checked) => setAttrs((s) => ({ ...s, isCommentable: checked }))}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{t("article.recommendHome")}</span>
          <Switch
            checked={attrs.isRecommended}
            onChange={(checked) => setAttrs((s) => ({ ...s, isRecommended: checked }))}
          />
        </div>
      </div>
    </Drawer>
  );
}
