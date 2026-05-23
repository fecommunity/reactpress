import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Dropdown, Input, Layout, Space, Spin, Typography } from "antd";
import type { MenuProps } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Ellipsis, Settings2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getToolkitClient } from "@/shared/client";
import { httpClient } from "@/utils/http";
import type { ArticleListSearch } from "@/modules/article/pages/ArticleListPage";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import {
  ArticleSettingDrawer,
  type ArticleSettings,
} from "@/modules/article/components/ArticleSettingDrawer";
import type { ArticleCategoryOption, ArticleTagOption } from "@/modules/article/constants";

type ArticleDraft = {
  title: string;
  content: string;
  summary: string;
  status: "draft" | "publish";
  cover: string | null;
  category: ArticleCategoryOption | null;
  tags: ArticleTagOption[];
  isRecommended: boolean;
  isCommentable: boolean;
  password: string | null;
};

const defaultArticleListSearch: ArticleListSearch = {
  page: 1,
  pageSize: 12,
  status: "",
  keyword: "",
};

const emptyDraft = (): ArticleDraft => ({
  title: "",
  content: "",
  summary: "",
  status: "draft",
  cover: null,
  category: null,
  tags: [],
  isRecommended: true,
  isCommentable: true,
  password: null,
});

function toSettings(draft: ArticleDraft): ArticleSettings {
  return {
    summary: draft.summary,
    password: draft.password,
    isCommentable: draft.isCommentable,
    isRecommended: draft.isRecommended,
    category: draft.category,
    tags: draft.tags,
    cover: draft.cover,
  };
}

function contentToHtml(content: string, title: string) {
  const body = content.replace(/\n/g, "<br/>");
  return `<h1>${title}</h1><p>${body}</p>`;
}

type ArticleEditorPageProps = {
  articleId?: string;
};

export function ArticleEditorPage({ articleId }: ArticleEditorPageProps) {
  const isCreate = !articleId;
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<ArticleDraft>(emptyDraft);
  const [savedId, setSavedId] = useState<string | undefined>(articleId);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { data: loaded, isLoading, isError } = useQuery({
    queryKey: ["article", articleId],
    queryFn: async () => {
      const api = await getToolkitClient();
      return api.article.findById(articleId!) as Promise<Record<string, unknown>>;
    },
    enabled: Boolean(articleId),
  });

  useEffect(() => {
    if (!loaded) return;
    setDraft({
      title: String(loaded.title ?? ""),
      content: String(loaded.content ?? ""),
      summary: String(loaded.summary ?? ""),
      status: loaded.status === "publish" ? "publish" : "draft",
      cover: (loaded.cover as string | null) ?? null,
      category: (loaded.category as ArticleCategoryOption | null) ?? null,
      tags: Array.isArray(loaded.tags) ? (loaded.tags as ArticleTagOption[]) : [],
      isRecommended: loaded.isRecommended !== false,
      isCommentable: loaded.isCommentable !== false,
      password: (loaded.password as string | null) ?? null,
    });
    setDirty(false);
  }, [loaded]);

  const patch = useCallback(<K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

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
      const body = {
        title: draft.title.trim(),
        content: draft.content,
        html: contentToHtml(draft.content, draft.title.trim()),
        summary: draft.summary,
        status,
        cover: draft.cover,
        category: draft.category,
        tags: draft.tags,
        isRecommended: draft.isRecommended,
        isCommentable: draft.isCommentable,
        password: draft.password,
      };
      const id = savedId ?? articleId;
      if (id) {
        return httpClient.patch<{ id: string; status: string }>(`/article/${id}`, body);
      }
      return httpClient.post<{ id: string; status: string }>("/article", body);
    },
    onSuccess: (res) => {
      const id = String(res.id);
      setSavedId(id);
      setDirty(false);
      void queryClient.invalidateQueries({ queryKey: ["articles"] });
      void queryClient.invalidateQueries({ queryKey: ["article", id] });
      message.success(res.status === "draft" ? t("article.draftSaved") : t("article.publishedSuccess"));
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

  const moreMenuItems: MenuProps["items"] = useMemo(
    () => [
      {
        key: "settings",
        label: t("article.settings"),
        icon: <Settings2 size={14} />,
        onClick: () => {
          if (!validate()) return;
          setSettingsOpen(true);
        },
      },
      { type: "divider" },
      {
        key: "draft",
        label: t("article.saveDraft"),
        onClick: () => handleSave("draft"),
      },
      {
        key: "delete",
        label: t("common.delete"),
        danger: true,
        disabled: isCreate && !savedId,
        onClick: () => {
          modal.confirm({
            title: t("common.deleteConfirmTitle"),
            content: t("common.deleteConfirmContent"),
            okType: "danger",
            onOk: () => deleteMutation.mutateAsync(),
          });
        },
      },
    ],
    [deleteMutation, isCreate, modal, savedId, t, validate],
  );

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
    <Layout style={{ minHeight: "100%", background: "transparent" }}>
      <Layout.Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0 16px",
          height: "auto",
          lineHeight: "normal",
          background: "transparent",
          borderBottom: "1px solid var(--ant-color-border-secondary)",
        }}
      >
        <Space>
          <Button type="text" icon={<ChevronLeft size={18} />} onClick={handleBack} aria-label={t("article.back")} />
          <Input
            variant="borderless"
            placeholder={t("article.titlePlaceholder")}
            value={draft.title}
            onChange={(e) => patch("title", e.target.value)}
            style={{ fontSize: 18, fontWeight: 600, minWidth: 280 }}
          />
        </Space>
        <Space>
          <Link to="/article" search={defaultArticleListSearch}>
            <Button>{t("common.cancel")}</Button>
          </Link>
          <Button loading={saveMutation.isPending} onClick={() => handleSave("draft")}>
            {t("article.saveDraft")}
          </Button>
          <Button
            type="primary"
            loading={saveMutation.isPending}
            onClick={() => handleSave("publish")}
          >
            {t("article.publish")}
          </Button>
          <Dropdown menu={{ items: moreMenuItems }} trigger={["click"]}>
            <Button type="text" icon={<Ellipsis size={18} />} aria-label={t("article.more")} />
          </Dropdown>
        </Space>
      </Layout.Header>
      <Layout.Content>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
          {t("article.markdownHint")}
        </Typography.Paragraph>
        <Input.TextArea
          value={draft.content}
          onChange={(e) => patch("content", e.target.value)}
          placeholder={t("article.contentPlaceholder")}
          autoSize={{ minRows: 18, maxRows: 40 }}
          style={{ fontFamily: "ui-monospace, monospace", fontSize: 14 }}
        />
      </Layout.Content>
      <ArticleSettingDrawer
        open={settingsOpen}
        initial={toSettings(draft)}
        onClose={() => setSettingsOpen(false)}
        onSave={(settings) => {
          setDraft((prev) => ({
            ...prev,
            ...settings,
          }));
          setSettingsOpen(false);
          setDirty(true);
          message.success(t("article.settingsApplied"));
        }}
      />
    </Layout>
  );
}
