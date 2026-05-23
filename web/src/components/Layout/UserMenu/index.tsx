import { Avatar, Button, Dropdown, Flex, Typography, theme } from "antd";
import type { MenuProps } from "antd";
import type { User } from "@/api/schemas";
import { MoreVertical } from "lucide-react";
import "./index.css";

const { Text } = Typography;

interface UserMenuProps {
  collapsed: boolean;
  user: User | null;
  userMenuItems: MenuProps["items"];
}

export function UserMenu({ collapsed, user, userMenuItems }: UserMenuProps) {
  const { token } = theme.useToken();

  const avatarSrc = (user?.avatar ?? "").trim() || undefined;
  const avatarSize = collapsed ? 32 : token.controlHeight;

  const avatar = (
    <Avatar
      size={avatarSize}
      src={avatarSrc || undefined}
      shape="circle"
      style={{
        flexShrink: 0,
        width: avatarSize,
      }}
    >
      {user?.username?.[0]?.toUpperCase()}
    </Avatar>
  );

  const moreButton = (
    <Button type="text" size="small" icon={<MoreVertical size={token.fontSize} />} />
  );

  return (
    <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
      <div
        style={{
          margin: token.marginXS,
        }}
      >
        <Flex
          className="user-menu-trigger"
          align="center"
          justify="flex-start"
          gap={token.marginSM}
          style={{
            width: "100%",
            cursor: "pointer",
            borderRadius: token.borderRadius,
            padding: token.paddingXS,
            ["--user-menu-hover-bg" as string]: token.colorFillTertiary,
          }}
        >
          {avatar}
          {!collapsed ? (
            <>
              <Flex
                vertical
                justify="center"
                gap={2}
                style={{
                  flex: "1 1 0%",
                  minWidth: 0,
                  maxWidth: "100%",
                  overflow: "hidden",
                }}
              >
                <Text
                  ellipsis
                  style={{
                    lineHeight: 1,
                    display: "block",
                    maxWidth: "100%",
                  }}
                >
                  {user?.username ?? "—"}
                </Text>
                <Text
                  ellipsis
                  style={{
                    lineHeight: 1,
                    display: "block",
                    maxWidth: "100%",
                    fontSize: token.fontSizeSM,
                    color: token.colorTextQuaternary,
                  }}
                >
                  {user?.email ?? "—"}
                </Text>
              </Flex>
              {moreButton}
            </>
          ) : null}
        </Flex>
      </div>
    </Dropdown>
  );
}
