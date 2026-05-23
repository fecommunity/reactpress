import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Badge, Button, Dropdown, Input, Select, Space, Table, Typography } from "antd";
import type { MenuProps } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getToolkitClient } from "@/shared/client";
import { parsePaginated } from "@/shared/api/pagination";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { formatDate } from "@/i18n/format";
import { useSettingsStore } from "@/stores/settings";

export interface PageListSearch {
  page: number;
  pageSize: number;
  status: string;
  keyword: string;
}

type PageRow = {
  id: string;
  name: string;
  path: string;
  order?: number;
  views?: number;
  status: string;
  publishAt?: string | null;
};

interface PageListPageProps {
  search: PageListSearch;
  routePath: string;
}

async function fetchPages(search: PageListSearch) {
  const api = await getToolkitClient();
  const query: Record<string, string | number> = {
    page: search.page,
    pageSize: search.pageSize,
  };
  if (search.status) query.status = search.status;
  if (search.keyword) query.name = search.keyword;
  const res = await api.page.findAll({ query } as Parameters<typeof api.page.findAll>[0]);
  return parsePaginated<PageRow>(res);
}

export function PageListPage({ search, routePath }: PageListPageProps) {
  const navigate = useNavigate({ from: routePath as "/" });
  const { message, modal } = App.useApp();
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const queryClient = useQueryClient();
  const [keywordInput, setKeywordInput] = useState(search.keyword);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pages", search],
    queryFn: () => fetchPages(search),
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const api = await getToolkitClient();
      await api.page.deleteById(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pages"] });
      message.success(t("page.deletedSuccess"));
    },
    onError: () => message.error(t("common.deleteFailed")),
  });

  const applySearch = (patch: Partial<PageListSearch>) => {
    void navigate({ search: (prev: PageListSearch) => ({ ...prev, page: 1, ...patch }) });
  };

  const confirmDelete = (record: PageRow) => {
    modal.confirm({
      title: t("common.deleteConfirmTitle"),
      content: t("common.deleteConfirmContent"),
      okText: t("common.delete"),
      okType: "danger",
      cancelText: t("common.cancel"),
      onOk: () => deleteMutation.mutateAsync(record.id),
    });
  };

  const columns = useMemo(
    () => [
      {
        title: t("page.name"),
        dataIndex: "name",
        ellipsis: true,
        render: (name: string, record: PageRow) => (
          <Link to="/page/editor/$id" params={{ id: record.id }}>
            {name}
          </Link>
        ),
      },
      { title: t("page.path"), dataIndex: "path", width: 140, ellipsis: true },
      {
        title: t("page.status"),
        dataIndex: "status",
        width: 100,
        render: (status: string) => (
          <Badge
            color={status === "draft" ? "gold" : "green"}
            text={status === "draft" ? t("article.draft") : t("article.published")}
          />
        ),
      },
      { title: t("page.order"), dataIndex: "order", width: 80 },
      { title: t("article.views"), dataIndex: "views", width: 90, render: (v: number) => v ?? 0 },
      {
        title: t("article.publishAt"),
        dataIndex: "publishAt",
        width: 120,
        render: (value: string | null) => formatDate(value, locale),
      },
      {
        title: t("common.actions"),
        width: 80,
        fixed: "right" as const,
        render: (_: unknown, record: PageRow) => {
          const items: MenuProps["items"] = [
            {
              key: "edit",
              label: (
                <Link to="/page/editor/$id" params={{ id: record.id }}>
                  {t("common.edit")}
                </Link>
              ),
              icon: <Pencil size={14} />,
            },
            { type: "divider" },
            {
              key: "delete",
              label: t("common.delete"),
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => confirmDelete(record),
            },
          ];
          return (
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button type="text" icon={<MoreVertical size={16} />} aria-label={t("common.actions")} />
            </Dropdown>
          );
        },
      },
    ],
    [confirmDelete, locale, t],
  );

  if (isError) {
    return <ModulePlaceholder title={t("page.listTitle")} description={t("page.loadError")} />;
  }

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("menu.page.all")}
      </Typography.Title>
      <Space wrap>
        <Input.Search
          allowClear
          placeholder={t("page.searchName")}
          style={{ width: 220 }}
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onSearch={(keyword) => applySearch({ keyword })}
          onClear={() => applySearch({ keyword: "" })}
        />
        <Select
          allowClear
          placeholder={t("article.status")}
          style={{ width: 160 }}
          value={search.status || undefined}
          onChange={(status) => applySearch({ status: status ?? "" })}
          options={[
            { label: t("article.published"), value: "publish" },
            { label: t("article.draft"), value: "draft" },
          ]}
        />
        <Link to="/page/editor">
          <Button type="primary" icon={<Plus size={16} />}>
            {t("menu.page.new")}
          </Button>
        </Link>
      </Space>
      <Table<PageRow>
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
            void navigate({ search: (prev: PageListSearch) => ({ ...prev, page, pageSize }) });
          },
        }}
        columns={columns}
      />
    </Space>
  );
}
