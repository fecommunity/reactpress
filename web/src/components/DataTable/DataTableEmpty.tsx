import { Flex, theme } from "antd";
import { BarChart3 } from "lucide-react";
import type { ReactElement } from "react";

/**
 * Table empty state: icon in soft tile + bold title + secondary description (dashboard-style).
 */
export function DataTableEmpty(): ReactElement {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={token.marginMD}
      className="data-table-empty"
      style={{
        paddingBlock: token.paddingXL,
        paddingInline: token.paddingLG,
        maxWidth: 360,
        marginInline: "auto",
      }}
    >
      <Flex
        align="center"
        justify="center"
        style={{
          width: 44,
          height: 44,
          borderRadius: token.borderRadiusLG,
          background: token.colorFillTertiary,
          color: token.colorTextQuaternary,
        }}
      >
        <BarChart3 size={22} strokeWidth={1.75} aria-hidden />
      </Flex>
      <Flex vertical align="center" gap={token.marginXXS} style={{ textAlign: "center" }}>
        <span
          style={{
            fontSize: token.fontSizeLG,
            fontWeight: token.fontWeightStrong,
            color: token.colorText,
            lineHeight: token.lineHeightLG,
          }}
        >
          No data
        </span>
        <span
          style={{
            fontSize: token.fontSize,
            fontWeight: 400,
            color: token.colorTextSecondary,
            lineHeight: token.lineHeight,
          }}
        >
          Nothing to show in this list yet
        </span>
      </Flex>
    </Flex>
  );
}
