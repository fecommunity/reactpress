import { useQuery } from "@tanstack/react-query";
import { Table, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { getToolkitClient } from "@/shared/client";
import { parsePaginated } from "@/shared/api/pagination";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { formatDateTime } from "@/i18n/format";
import { useSettingsStore } from "@/stores/settings";

type ViewRow = {
  id: string;
  url: string;
  ip?: string;
  userAgent?: string;
  createAt: string;
};

export function AnalyticsPage() {
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["views"],
    queryFn: async () => {
      const api = await getToolkitClient();
      const res = await api.view.findAll({
        query: { page: 1, pageSize: 50 },
      } as Parameters<typeof api.view.findAll>[0]);
      return parsePaginated<ViewRow>(res);
    },
    staleTime: 30_000,
  });

  if (isError) {
    return (
      <ModulePlaceholder
        title={t("placeholder.analytics")}
        description={t("analytics.loadError")}
      />
    );
  }

  return (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        {t("placeholder.analytics")}
      </Typography.Title>
      <Table<ViewRow>
        rowKey="id"
        loading={isLoading}
        dataSource={data?.list ?? []}
        scroll={{ x: "max-content" }}
        pagination={{ total: data?.total, pageSize: 50, showSizeChanger: false }}
        columns={[
          { title: t("analytics.url"), dataIndex: "url", ellipsis: true },
          { title: t("analytics.ip"), dataIndex: "ip", width: 140 },
          {
            title: t("comment.time"),
            dataIndex: "createAt",
            width: 180,
            render: (value: string) => formatDateTime(value, locale),
          },
        ]}
      />
    </>
  );
}
