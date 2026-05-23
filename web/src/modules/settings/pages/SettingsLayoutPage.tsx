import { Typography } from "antd";
import { useTranslation } from "react-i18next";
import { SettingsTabForm } from "@/modules/settings/components/SettingsTabForm";
import styles from "@/modules/settings/components/settings-form.module.css";

interface SettingsLayoutPageProps {
  tab: string;
}

export function SettingsLayoutPage({ tab }: SettingsLayoutPageProps) {
  const { t } = useTranslation();
  const activeKey = tab || "general";
  const pageTitle =
    t(`settings.pageTitle.${activeKey}`, {
      defaultValue: t("settings.title"),
    }) || t("settings.title");

  return (
    <div className={styles.wrap}>
      <div className="admin-page-header">
        <Typography.Title level={2} className="admin-page-title">
          {pageTitle}
        </Typography.Title>
      </div>
      <div className="admin-panel">
        <div className="admin-panel__body">
          <SettingsTabForm tab={activeKey} />
        </div>
      </div>
    </div>
  );
}
