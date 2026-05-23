import { Flex, Typography, theme } from "antd";
import { GitHub } from "@/components/Icon";

const ANTD_ADMIN_REPO = "https://github.com/zuiidea/antd-admin";

export function AppFooter() {
  const { token } = theme.useToken();
  const iconSize = Math.max(12, Math.round(Number(token.fontSizeSM)));

  return (
    <Flex
      align="center"
      justify="center"
      wrap
      gap={4}
      style={{
        lineHeight: token.lineHeight,
      }}
    >
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM, marginBottom: 0 }}>
        Powered by
      </Typography.Text>
      <a
        href={ANTD_ADMIN_REPO}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: token.colorLink,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <GitHub size={iconSize} />
        antd-admin
      </a>
    </Flex>
  );
}
