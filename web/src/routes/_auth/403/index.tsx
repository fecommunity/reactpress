import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Home, ShieldAlert } from "lucide-react";
import { Button, Flex, Result, theme } from "antd";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_auth/403/")({
  component: ForbiddenPage,
});

function ForbiddenPage() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const goDashboard = () => {
    void navigate({ to: "/dashboard" });
  };

  return (
    <Flex
      flex={1}
      align="center"
      justify="center"
      style={{ minHeight: 0, width: "100%", padding: token.paddingXL }}
    >
      <Result
        // Avoid status="403": antd ignores `icon` for built-in illustrations; keep Lucide as the main icon.
        icon={
          <ShieldAlert size={64} strokeWidth={1.25} color={token.colorTextQuaternary} aria-hidden />
        }
        title={t("error.403Title")}
        subTitle={t("error.403Subtitle")}
        extra={
          <Button type="primary" icon={<Home size={16} aria-hidden />} onClick={goDashboard}>
            {t("common.backToHome")}
          </Button>
        }
      />
    </Flex>
  );
}
