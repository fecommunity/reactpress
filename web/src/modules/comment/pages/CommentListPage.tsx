import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Badge, Button, Input, Select, Space, Table, Typography } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getToolkitClient } from "@/shared/client";
import { httpClient } from "@/utils/http";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { formatDateTime } from "@/i18n/format";
import { useSettingsStore } from "@/stores/settings";

export interface CommentListSearch {
  page: number;
  pageSize: number;
  pass: string;
  name: string;
  email: string;
}

type CommentRow = {
  id: string;
  name: string;
  email: string;
  content: string;
  pass: boolean;
  hostId: string;
  url: string;
  createAt: string;
};

interface CommentListPageProps {
  search: CommentListSearch;
  routePath: string;
}

async function fetchComments(search: CommentListSearch) {
  const api = await getToolkitClient();
  const query: Record<string, string | number> = {
    page: search.page,
    pageSize: search.pageSize,
  };
  if (search.pass) query.pass = search.pass;
  if (search.name) query.name = search.name;
  if (search.email) query.email = search.email;
  const res = await api.comment.findAll({
    query,
  } as Parameters<typeof api.comment.findAll>[0]);
  const tuple = res as unknown as [CommentRow[], number];
  return { list: tuple[0] ?? [], total: tuple[1] ?? 0 };
}

export function CommentListPage({ search, routePath }: CommentListPageProps) {
  const navigate = useNavigate({ from: routePath as "/" });
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const queryClient = useQueryClient();
  const [nameInput, setNameInput] = useState(search.name);
  const [emailInput, setEmailInput] = useState(search.email);

  useEffect(() => {
    setNameInput(search.name);
    setEmailInput(search.email);
  }, [search.name, search.email]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments", search],
    queryFn: () => fetchComments(search),
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, pass }: { id: string; pass: boolean }) => {
      await httpClient.patch(`/comment/${id}`, { pass });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments"] });
      message.success(t("comment.statusUpdated"));
    },
    onError: () => {
      message.error(t("common.updateFailed"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const api = await getToolkitClient();
      await api.comment.deleteById(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["comments"] });
      message.success(t("comment.deletedSuccess"));
    },
    onError: () => {
      message.error(t("common.deleteFailed"));
    },
  });

  const applySearch = (patch: Partial<CommentListSearch>) => {
    void navigate({
      search: (prev: CommentListSearch) => ({ ...prev, page: 1, ...patch }),
    });
  };

  const columns = useMemo(
    () => [
      {
        title: t("common.status"),
        dataIndex: "pass",
        width: 100,
        render: (pass: boolean) => (
          <Badge
            color={pass ? "green" : "gold"}
            text={pass ? t("comment.approved") : t("comment.pending")}
          />
        ),
      },
      { title: t("comment.name"), dataIndex: "name", width: 120 },
      { title: t("common.email"), dataIndex: "email", width: 180, ellipsis: true },
      {
        title: t("comment.content"),
        dataIndex: "content",
        ellipsis: true,
      },
      {
        title: t("comment.related"),
        dataIndex: "url",
        width: 120,
        render: (url: string) => url || "—",
      },
      {
        title: t("comment.time"),
        dataIndex: "createAt",
        width: 160,
        render: (value: string) => formatDateTime(value, locale),
      },
      {
        title: t("common.actions"),
        width: 160,
        fixed: "right" as const,
        render: (_: unknown, record: CommentRow) => (
          <Space size="small">
            <Button
              size="small"
              type="link"
              onClick={() => updateMutation.mutate({ id: record.id, pass: !record.pass })}
            >
              {record.pass ? t("comment.reject") : t("comment.pass")}
            </Button>
            <Button
              size="small"
              type="link"
              danger
              onClick={() => {
                modal.confirm({
                  title: t("comment.deleteTitle"),
                  content: t("common.deleteConfirmContent"),
                  okType: "danger",
                  onOk: () => deleteMutation.mutateAsync(record.id),
                });
              }}
            >
              {t("common.delete")}
            </Button>
          </Space>
        ),
      },
    ],
    [deleteMutation, locale, modal, t, updateMutation],
  );

  if (isError) {
    return (
      <ModulePlaceholder title={t("comment.manageTitle")} description={t("comment.loadError")} />
    );
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("comment.title")}
      </Typography.Title>
      <Space wrap>
        <Input.Search
          allowClear
          placeholder={t("comment.name")}
          style={{ width: 200 }}
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onSearch={(name) => applySearch({ name })}
          onClear={() => applySearch({ name: "" })}
        />
        <Input.Search
          allowClear
          placeholder={t("common.email")}
          style={{ width: 220 }}
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onSearch={(email) => applySearch({ email })}
          onClear={() => applySearch({ email: "" })}
        />
        <Select
          allowClear
          placeholder={t("comment.reviewStatus")}
          style={{ width: 160 }}
          value={search.pass || undefined}
          onChange={(pass) => applySearch({ pass: pass ?? "" })}
          options={[
            { label: t("comment.approved"), value: "1" },
            { label: t("comment.pending"), value: "0" },
          ]}
        />
      </Space>
      <Table<CommentRow>
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list ?? []}
        scroll={{ x: "max-content" }}
        pagination={{
          current: search.page,
          pageSize: search.pageSize,
          total: data?.total ?? 0,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            void navigate({
              search: (prev: CommentListSearch) => ({ ...prev, page, pageSize }),
            });
          },
        }}
        columns={columns}
      />
    </Space>
  );
}
