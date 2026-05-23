import { Card, Col, Image, Row, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ModulePlaceholder } from "@/shared/components/ModulePlaceholder";

export function ThemesPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useSiteSettings();

  if (isError) {
    return <ModulePlaceholder title={t("placeholder.themes")} description={t("settings.loadError")} />;
  }

  if (isLoading) {
    return <Spin />;
  }

  const branding = [
    { label: t("settings.fields.systemTitle"), value: String(data?.systemTitle ?? "—") },
    { label: t("settings.fields.systemLogo"), value: String(data?.systemLogo ?? "—"), image: data?.systemLogo },
    { label: t("settings.fields.systemBg"), value: String(data?.systemBg ?? "—"), image: data?.systemBg },
    { label: t("settings.fields.systemFavicon"), value: String(data?.systemFavicon ?? "—"), image: data?.systemFavicon },
  ];

  return (
    <>
      <Typography.Title level={4}>{t("placeholder.themes")}</Typography.Title>
      <Typography.Paragraph type="secondary">{t("appearance.themesDesc")}</Typography.Paragraph>
      <Row gutter={[16, 16]}>
        {branding.map((item) => (
          <Col xs={24} sm={12} md={6} key={item.label}>
            <Card size="small" title={item.label}>
              {typeof item.image === "string" && item.image.startsWith("http") ? (
                <Image src={item.image} alt={item.label} style={{ maxHeight: 120, objectFit: "contain" }} />
              ) : (
                <Typography.Text type="secondary">{item.value}</Typography.Text>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
