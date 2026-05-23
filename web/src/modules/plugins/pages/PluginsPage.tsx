import { Alert, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export function PluginsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useSiteSettings();

  if (isLoading) {
    return <Spin />;
  }

  let plugins: unknown[] = [];
  try {
    const raw = data?.globalSetting;
    const global =
      typeof raw === "string" ? JSON.parse(raw) : (raw as Record<string, unknown> | undefined);
    if (global && Array.isArray(global.plugins)) {
      plugins = global.plugins;
    }
  } catch {
    plugins = [];
  }

  return (
    <>
      <Typography.Title level={4}>{t("placeholder.plugins")}</Typography.Title>
      {plugins.length === 0 ? (
        <Alert type="info" showIcon message={t("plugins.empty")} description={t("plugins.emptyDesc")} />
      ) : (
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(plugins, null, 2)}</pre>
      )}
    </>
  );
}
