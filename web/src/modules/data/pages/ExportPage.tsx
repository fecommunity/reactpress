import { App, Button, Space, Typography } from "antd";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getToolkitClient } from "@/shared/client";
import { parsePaginated } from "@/shared/api/pagination";

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();

  const handleExport = async () => {
    try {
      const api = await getToolkitClient();
      const [settings, articles, pages] = await Promise.all([
        api.setting.findAll(),
        api.article.findAll({ query: { page: 1, pageSize: 500 } } as Parameters<typeof api.article.findAll>[0]),
        api.page.findAll({ query: { page: 1, pageSize: 500 } } as Parameters<typeof api.page.findAll>[0]),
      ]);
      downloadJson(`reactpress-export-${Date.now()}.json`, {
        exportedAt: new Date().toISOString(),
        settings,
        articles: parsePaginated(articles).list,
        pages: parsePaginated(pages).list,
      });
      message.success(t("data.exportSuccess"));
    } catch {
      message.error(t("data.exportFailed"));
    }
  };

  return (
    <Space direction="vertical" size="middle">
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("placeholder.dataExport")}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t("data.exportDesc")}</Typography.Paragraph>
      <Button type="primary" icon={<Download size={16} />} onClick={() => void handleExport()}>
        {t("data.exportButton")}
      </Button>
    </Space>
  );
}
