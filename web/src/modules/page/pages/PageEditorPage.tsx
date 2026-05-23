import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Input, Layout, Space, Spin, Typography } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getToolkitClient } from "@/shared/client";
import { httpClient } from "@/utils/http";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import type { PageListSearch } from "@/modules/page/pages/PageListPage";

type PageDraft = {
  name: string;
  path: string;
  content: string;
  order: number;
  status: "draft" | "publish";
};

const defaultListSearch: PageListSearch = {
  page: 1,
  pageSize: 12,
  status: "",
  keyword: "",
};

const emptyDraft = (): PageDraft => ({
  name: "",
  path: "",
  content: "",
  order: 0,
  status: "draft",
});

type PageEditorPageProps = {
  pageId?: string;
};

export function PageEditorPage({ pageId }: PageEditorPageProps) {
  const isCreate = !pageId;
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<PageDraft>(emptyDraft);
  const [savedId, setSavedId] = useState<string | undefined>(pageId);
  const [dirty, setDirty] = useState(false);

  const { data: loaded, isLoading, isError } = useQuery({
    queryKey: ["page", pageId],
    queryFn: async () => {
      const api = await getToolkitClient();
      return api.page.findById(pageId!) as Promise<Record<string, unknown>>;
    },
    enabled: Boolean(pageId),
  });

  useEffect(() => {
    if (!loaded) return;
    setDraft({
      name: String(loaded.name ?? ""),
      path: String(loaded.path ?? ""),
      content: String(loaded.content ?? ""),
      order: Number(loaded.order ?? 0),
      status: loaded.status === "publish" ? "publish" : "draft",
    });
    setDirty(false);
  }, [loaded]);

  const patch = useCallback(<K extends keyof PageDraft>(key: K, value: PageDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const validate = useCallback(() => {
    if (!draft.name.trim()) {
      message.warning(t("page.nameRequired"));
      return false;
    }
    if (!draft.path.trim()) {
      message.warning(t("page.pathRequired"));
      return false;
    }
    return true;
  }, [draft.name, draft.path, message, t]);

  const saveMutation = useMutation({
    mutationFn: async (status: "draft" | "publish") => {
      const body = {
        name: draft.name.trim(),
        path: draft.path.trim(),
        content: draft.content,
        order: draft.order,
        status,
      };
      const id = savedId ?? pageId;
      if (id) {
        return httpClient.patch<{ id: string }>(`/page/${id}`, body);
      }
      return httpClient.post<{ id: string }>("/page", body);
    },
    onSuccess: (res) => {
      const id = String(res.id);
      setSavedId(id);
      setDirty(false);
      void queryClient.invalidateQueries({ queryKey: ["pages"] });
      void queryClient.invalidateQueries({ queryKey: ["page", id] });
      message.success(t("page.savedSuccess"));
      if (isCreate && id) {
        void navigate({ to: "/page/editor/$id", params: { id }, replace: true });
      }
    },
    onError: () => message.error(t("common.saveFailed")),
  });

  const handleSave = (status: "draft" | "publish") => {
    if (!validate()) return;
    saveMutation.mutate(status);
  };

  if (pageId && isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (pageId && isError) {
    return <ModulePlaceholder title={t("page.editTitle")} description={t("page.loadError")} />;
  }

  return (
    <Layout style={{ background: "transparent" }}>
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
          <Button
            type="text"
            icon={<ChevronLeft size={18} />}
            onClick={() => void navigate({ to: "/page", search: defaultListSearch })}
            aria-label={t("article.back")}
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {isCreate ? t("placeholder.newPage") : t("page.editTitle")}
          </Typography.Title>
        </Space>
        <Space>
          <Link to="/page" search={defaultListSearch}>
            <Button>{t("common.cancel")}</Button>
          </Link>
          <Button loading={saveMutation.isPending} onClick={() => handleSave("draft")}>
            {t("article.saveDraft")}
          </Button>
          <Button type="primary" loading={saveMutation.isPending} onClick={() => handleSave("publish")}>
            {t("article.publish")}
          </Button>
        </Space>
      </Layout.Header>
      <Layout.Content>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Input
            placeholder={t("page.namePlaceholder")}
            value={draft.name}
            onChange={(e) => patch("name", e.target.value)}
          />
          <Input
            placeholder={t("page.pathPlaceholder")}
            value={draft.path}
            onChange={(e) => patch("path", e.target.value)}
            addonBefore="/"
          />
          <Input
            type="number"
            placeholder={t("page.order")}
            value={draft.order}
            onChange={(e) => patch("order", Number(e.target.value) || 0)}
          />
          <Input.TextArea
            value={draft.content}
            onChange={(e) => patch("content", e.target.value)}
            placeholder={t("page.contentPlaceholder")}
            autoSize={{ minRows: 16, maxRows: 32 }}
            style={{ fontFamily: "ui-monospace, monospace" }}
          />
          {dirty ? (
            <Typography.Text type="secondary">{t("page.unsavedHint")}</Typography.Text>
          ) : null}
        </Space>
      </Layout.Content>
    </Layout>
  );
}
