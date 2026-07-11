import { useNavigate } from "@tanstack/react-router";
import { Button, Flex, Result, Space, theme } from "antd";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Shared 404 UI for `/404` route and root `notFoundComponent`. */
export function NotFound() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const goDashboard = () => {
    void navigate({ to: "/dashboard" });
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      goDashboard();
    }
  };

  return (
    <Flex
      vertical
      style={{
        /* Lock to viewport so tall Result + padding cannot grow past 100vh and scroll the page */
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        boxSizing: "border-box",
        background: token.colorBgLayout,
        color: token.colorText,
      }}
    >
      <Flex
        flex={1}
        align="center"
        justify="center"
        style={{
          minHeight: 0,
          width: "100%",
          padding: token.paddingXL,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <Result
          // Avoid status="404"|"403"|"500": antd ignores `icon` and shows built-in art; keep Lucide as the main icon.
          icon={
            <SearchX size={64} strokeWidth={1.25} color={token.colorTextQuaternary} aria-hidden />
          }
          title={t("error.404Title")}
          subTitle={t("error.404Subtitle")}
          extra={
            <Space wrap size="middle">
              <Button type="primary" icon={<Home size={16} aria-hidden />} onClick={goDashboard}>
                {t("common.backToHome")}
              </Button>
              <Button icon={<ArrowLeft size={16} aria-hidden />} onClick={goBack}>
                {t("common.goBack")}
              </Button>
            </Space>
          }
        />
      </Flex>
    </Flex>
  );
}
