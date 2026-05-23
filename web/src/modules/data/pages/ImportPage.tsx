import { App, Button, Space, Typography, Upload } from "antd";
import { Upload as UploadIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getToolkitClient } from "@/shared/client";

export function ImportPage() {
  const { message } = App.useApp();
  const { t } = useTranslation();

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { settings?: Record<string, unknown> };
      if (!parsed.settings) {
        message.error(t("data.importInvalid"));
        return;
      }
      const api = await getToolkitClient();
      await api.setting.update({
        body: parsed.settings,
      } as Parameters<typeof api.setting.update>[0]);
      message.success(t("data.importSuccess"));
    } catch {
      message.error(t("data.importFailed"));
    }
  };

  return (
    <Space direction="vertical" size="middle">
      <Typography.Title level={4} style={{ margin: 0 }}>
        {t("placeholder.dataImport")}
      </Typography.Title>
      <Typography.Paragraph type="secondary">{t("data.importDesc")}</Typography.Paragraph>
      <Upload
        accept="application/json,.json"
        showUploadList={false}
        beforeUpload={(file) => {
          void handleFile(file);
          return false;
        }}
      >
        <Button icon={<UploadIcon size={16} />}>{t("data.importButton")}</Button>
      </Upload>
    </Space>
  );
}
