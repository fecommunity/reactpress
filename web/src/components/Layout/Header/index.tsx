import { Layout, Button, Space, theme, Breadcrumb, Flex, Divider, Grid } from "antd";
import type { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useSettingsStore } from "@/stores/settings";
import { Link, useLocation, useMatches } from "@tanstack/react-router";
import { Home, PanelLeft, ShieldAlert, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Theme } from "@/components/Icon";

const { Header: AntHeader } = Layout;

const PATH_LABEL: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/403": "403",
};

function normalizePath(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

export type HeaderProps = {
  /**
   * When `false`, breadcrumb is hidden; left `Flex` still uses `flex={1}` so header actions stay right-aligned.
   * Routes may also set `staticData: { hideBreadcrumb: true }` (deepest matching route wins).
   */
  showBreadcrumb?: boolean;
};

export function Header({ showBreadcrumb: showBreadcrumbProp = true }: HeaderProps) {
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const location = useLocation();
  const matches = useMatches();
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  const iconSize = token.fontSize;

  const crumb = (Icon: LucideIcon, label: ReactNode, linkTo?: "/dashboard") => {
    const row = (
      <>
        <Icon size={iconSize} aria-hidden style={{ flexShrink: 0, opacity: 0.88 }} />
        <span>{label}</span>
      </>
    );
    const rowStyle = {
      display: "inline-flex" as const,
      alignItems: "center" as const,
      gap: token.marginXS,
      color: "inherit" as const,
    };
    if (linkTo) {
      return (
        <Link to={linkTo} style={rowStyle}>
          {row}
        </Link>
      );
    }
    return <span style={rowStyle}>{row}</span>;
  };

  const path = normalizePath(location.pathname);
  const segments = path.split("/").filter(Boolean);
  const firstSegmentPath = segments.length ? `/${segments[0]}` : "/dashboard";
  const leafLabelKey = PATH_LABEL[firstSegmentPath] ?? segments[0] ?? "Dashboard";

  const leafIcon: LucideIcon =
    firstSegmentPath === "/users" ? Users : firstSegmentPath === "/403" ? ShieldAlert : Home;

  const leafLabel = leafLabelKey;

  const breadcrumbItems: ItemType[] = [];

  const onDashboard = path === "/dashboard" || path === "/";

  if (onDashboard) {
    breadcrumbItems.push({
      title: crumb(Home, "Dashboard"),
    });
  } else {
    breadcrumbItems.push({
      title: crumb(Home, "Dashboard", "/dashboard"),
    });

    breadcrumbItems.push({
      title: crumb(leafIcon, leafLabel),
    });

    if (segments.length > 1) {
      const tail = segments.slice(1).join(" / ");
      if (tail) {
        breadcrumbItems.push({ title: tail });
      }
    }
  }

  const leafStatic = matches.at(-1)?.staticData as { hideBreadcrumb?: boolean } | undefined;
  const hideBreadcrumbFromRoute = leafStatic?.hideBreadcrumb === true;
  const showBreadcrumb =
    showBreadcrumbProp && !hideBreadcrumbFromRoute && breadcrumbItems.length > 0;

  return (
    <AntHeader
      style={{
        background: "transparent",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        padding: `0 ${token.padding}px`,
        gap: token.sizeLG,
        display: "flex",
      }}
    >
      <Flex align="center" flex={1} style={{ minWidth: 0 }}>
        {isMobile ? (
          <Button
            type="text"
            size="small"
            onClick={toggleSidebar}
            icon={<PanelLeft size={token.size} />}
            aria-label="Toggle sidebar"
          />
        ) : null}
        {showBreadcrumb ? (
          <>
            {isMobile ? <Divider vertical /> : null}
            <Breadcrumb items={breadcrumbItems} />
          </>
        ) : null}
      </Flex>
      <Space>
        <Button
          type="text"
          onClick={toggleDarkMode}
          icon={<Theme size={token.size} />}
          aria-label="Toggle Theme"
        />
      </Space>
    </AntHeader>
  );
}
