import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Home, ShieldAlert } from "lucide-react";
import { Button, Flex, Result, theme } from "antd";

export const Route = createFileRoute("/_auth/403/")({
  component: ForbiddenPage,
});

function ForbiddenPage() {
  const navigate = useNavigate();
  const { token } = theme.useToken();

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
        title="403"
        subTitle="Sorry, you don't have permission to access this page."
        extra={
          <Button type="primary" icon={<Home size={16} aria-hidden />} onClick={goDashboard}>
            Back to Home
          </Button>
        }
      />
    </Flex>
  );
}
