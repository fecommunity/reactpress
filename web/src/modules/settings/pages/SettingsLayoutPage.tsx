import { Typography } from "antd";
import { useTranslation } from "react-i18next";

import styles from "@/modules/settings/components/settings-form.module.css";
import { SettingsTabForm } from "@/modules/settings/components/SettingsTabForm";
import { DesktopApiSetupPanel } from "@/shared/desktop/DesktopApiSetupPanel";

interface SettingsLayoutPageProps {
  tab: string;
}

export function SettingsLayoutPage({ tab }: SettingsLayoutPageProps) {
  const { t } = useTranslation();
  const activeKey = tab || "general";

  if (activeKey === "desktop-api") {
    return (
      <div className={styles.wrap}>
        <div className="admin-page-header">
          <Typography.Title level={2} className="admin-page-title">
            {t("settings.pageTitle.desktop-api", { defaultValue: t("desktop.apiSetup.title") })}
          </Typography.Title>
        </div>
        <div className="admin-panel">
          <div className="admin-panel__body">
            <DesktopApiSetupPanel />
          </div>
        </div>
      </div>
    );
  }

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
