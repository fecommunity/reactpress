import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Form, Input, Space, Spin, Typography } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";
import { httpClient } from "@/utils/http";

type FieldDef = {
  name: string;
  labelKey: string;
  type?: "text" | "password" | "textarea" | "json";
};

const TAB_FIELDS: Record<string, FieldDef[]> = {
  general: [
    { name: "systemTitle", labelKey: "settings.fields.systemTitle" },
    { name: "systemSubTitle", labelKey: "settings.fields.systemSubTitle" },
    { name: "systemUrl", labelKey: "settings.fields.systemUrl" },
    { name: "adminSystemUrl", labelKey: "settings.fields.adminSystemUrl" },
    { name: "systemLogo", labelKey: "settings.fields.systemLogo" },
    { name: "systemFavicon", labelKey: "settings.fields.systemFavicon" },
    { name: "systemBg", labelKey: "settings.fields.systemBg" },
    { name: "systemNoticeInfo", labelKey: "settings.fields.systemNoticeInfo", type: "textarea" },
    { name: "systemFooterInfo", labelKey: "settings.fields.systemFooterInfo", type: "textarea" },
  ],
  reading: [{ name: "globalSetting", labelKey: "settings.fields.globalSetting", type: "json" }],
  discussion: [{ name: "globalSetting", labelKey: "settings.fields.globalSetting", type: "json" }],
  email: [
    { name: "smtpHost", labelKey: "settings.fields.smtpHost" },
    { name: "smtpPort", labelKey: "settings.fields.smtpPort" },
    { name: "smtpUser", labelKey: "settings.fields.smtpUser" },
    { name: "smtpPass", labelKey: "settings.fields.smtpPass", type: "password" },
    { name: "smtpFromUser", labelKey: "settings.fields.smtpFromUser" },
  ],
  storage: [{ name: "oss", labelKey: "settings.fields.oss", type: "json" }],
  seo: [
    { name: "seoKeyword", labelKey: "settings.fields.seoKeyword" },
    { name: "seoDesc", labelKey: "settings.fields.seoDesc", type: "textarea" },
    { name: "baiduAnalyticsId", labelKey: "settings.fields.baiduAnalyticsId" },
    { name: "googleAnalyticsId", labelKey: "settings.fields.googleAnalyticsId" },
  ],
};

type ApiKeyRow = { id: string; name: string; scopes?: string };

function ApiKeysPanel() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      try {
        return (await httpClient.get<ApiKeyRow[]>("/api-key")) ?? [];
      } catch {
        return [];
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => httpClient.post("/api-key", { name, scopes: "read" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      message.success(t("settings.apiKeyCreated"));
    },
    onError: () => message.error(t("common.createFailed")),
  });

  return (
    <Space direction="vertical" style={{ width: "100%" }} size="middle">
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        {t("settings.apiKeysDesc")}
      </Typography.Paragraph>
      <Button loading={isFetching} onClick={() => createMutation.mutate(`key-${Date.now()}`)}>
        {t("settings.createApiKey")}
      </Button>
      {isLoading ? (
        <Spin />
      ) : (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {(data ?? []).map((key) => (
            <li key={key.id}>
              {key.name} ({key.scopes ?? "read"})
            </li>
          ))}
        </ul>
      )}
    </Space>
  );
}

type SettingsTabFormProps = {
  tab: string;
};

export function SettingsTabForm({ tab }: SettingsTabFormProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { data, isLoading, isError, saveMutation } = useSiteSettings();
  const fields = TAB_FIELDS[tab] ?? [];

  useEffect(() => {
    if (!data) return;
    const values: Record<string, string> = {};
    for (const field of fields) {
      const raw = data[field.name];
      if (field.type === "json" && raw != null) {
        values[field.name] = typeof raw === "string" ? raw : JSON.stringify(raw, null, 2);
      } else {
        values[field.name] = raw != null ? String(raw) : "";
      }
    }
    form.setFieldsValue(values);
  }, [data, fields, form]);

  if (tab === "api-keys") {
    return <ApiKeysPanel />;
  }

  if (tab === "webhooks") {
    return (
      <Typography.Paragraph type="secondary">{t("settings.webhooksDesc")}</Typography.Paragraph>
    );
  }

  if (isError) {
    return <ModulePlaceholder title={t("settings.title")} description={t("settings.loadError")} />;
  }

  if (isLoading) {
    return <Spin />;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={(values) => {
        const patch: Record<string, unknown> = {};
        for (const field of fields) {
          const raw = values[field.name];
          if (field.type === "json") {
            try {
              patch[field.name] = raw ? JSON.parse(String(raw)) : null;
            } catch {
              message.error(t("settings.invalidJson"));
              return;
            }
          } else {
            patch[field.name] = raw ?? "";
          }
        }
        saveMutation.mutate(patch, {
          onSuccess: () => message.success(t("settings.savedSuccess")),
          onError: () => message.error(t("common.saveFailed")),
        });
      }}
    >
      {fields.map((field) => (
        <Form.Item key={field.name} name={field.name} label={t(field.labelKey)}>
          {field.type === "textarea" || field.type === "json" ? (
            <Input.TextArea
              rows={field.type === "json" ? 12 : 4}
              style={field.type === "json" ? { fontFamily: "ui-monospace, monospace" } : undefined}
            />
          ) : (
            <Input type={field.type === "password" ? "password" : "text"} />
          )}
        </Form.Item>
      ))}
      <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
        {t("common.save")}
      </Button>
    </Form>
  );
}
