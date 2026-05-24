import { Alert, Steps } from "antd";
import { useTranslation } from "react-i18next";

export function ThemeFlowGuide() {
  const { t } = useTranslation();

  return (
    <Alert
      type="info"
      showIcon
      style={{ marginBottom: 20 }}
      message={t("appearance.flowTitle")}
      description={
        <Steps
          size="small"
          direction="horizontal"
          responsive={false}
          current={-1}
          items={[
            { title: t("appearance.flowInstall") },
            { title: t("appearance.flowActivate") },
            { title: t("appearance.flowPreview") },
            { title: t("appearance.flowCustomize") },
          ]}
          style={{ marginTop: 12, maxWidth: 720 }}
        />
      }
    />
  );
}
