import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import { SettingsTabForm } from "@/modules/settings/components/SettingsTabForm";

const TAB_TITLE_KEYS: Record<string, string> = {
  general: "settings.general",
  reading: "settings.reading",
  discussion: "settings.discussion",
  email: "settings.email",
  storage: "settings.storage",
  seo: "settings.seo",
  "api-keys": "settings.apiKeys",
  webhooks: "settings.webhooks",
};

interface SettingsLayoutPageProps {
  tab: string;
}

export function SettingsLayoutPage({ tab }: SettingsLayoutPageProps) {
  const { t } = useTranslation();
  const activeKey = tab || "general";
  const tabTitleKey = TAB_TITLE_KEYS[activeKey] ?? "settings.title";

  return (
    <>
      <div className="admin-page-header">
        <Typography.Title level={2} className="admin-page-title">
          {t("settings.title")}
        </Typography.Title>
      </div>
      <div className="admin-panel">
        <div className="admin-panel__body">
          <Typography.Title level={5} style={{ marginTop: 0, marginBottom: 16, fontWeight: 600 }}>
            {t(tabTitleKey)}
          </Typography.Title>
          <div className="admin-settings-form">
            <SettingsTabForm tab={activeKey} />
          </div>
        </div>
      </div>
    </>
  );
}
