import { Typography } from "antd";
import { useTranslation } from "react-i18next";

interface ModulePlaceholderProps {
  title: string;
  description?: string;
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="admin-page-header">
        <Typography.Title level={2} className="admin-page-title">
          {title}
        </Typography.Title>
      </div>
      <div className="admin-panel">
        <div className="admin-panel__body">
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {description ?? t("placeholder.defaultDescription")}
          </Typography.Paragraph>
        </div>
      </div>
    </>
  );
}
