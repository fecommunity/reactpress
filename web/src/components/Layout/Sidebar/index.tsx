import { Menu, Layout, Grid, Drawer, Button } from "antd";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Book,
  Briefcase,
  CircleDashed,
  FileText,
  Folder,
  Home,
  Image,
  MessageSquare,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Puzzle,
  SlidersHorizontal,
  Star,
  User,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePendingCommentCount } from "@/hooks/usePendingCommentCount";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import type { MenuItem as MenuItemType } from "@/api/schemas";
import type { MenuProps } from "antd";
import "./index.css";

const { Sider } = Layout;

type AntMenuItem = Required<MenuProps>["items"][number];
type BuildMenuResult = {
  items: AntMenuItem[];
  keyToPath: Record<string, string>;
  pathToKeyChain: Record<string, string[]>;
};

const COMMENTS_MENU_ID = "comments";

const MENU_ICON_MAP: Record<string, LucideIcon> = {
  IconLucideLayoutDashboard: Home,
  IconLucideUsers: Users,
  IconLucideUserList: User,
  IconLucideHistory: MessageSquare,
  IconLucideMessageSquare: MessageSquare,
  IconLucideStar: Star,
  IconLucideSettings: SlidersHorizontal,
  IconLucideBriefcase: Briefcase,
  IconLucideBookOpen: Book,
  IconLucideFolderKanban: Folder,
  IconLucideSparkles: Zap,
  IconLucideFileText: FileText,
  IconLucideImage: Image,
  IconLucidePalette: Palette,
  IconLucidePuzzle: Puzzle,
  IconLucideWrench: Wrench,
};

function renderMenuIcon(icon: string | null, size = 20) {
  const Icon = (icon && MENU_ICON_MAP[icon]) || CircleDashed;
  return <Icon size={size} aria-hidden />;
}

function menuContainsId(menus: MenuItemType[], id: string): boolean {
  for (const menu of menus) {
    if (menu.id === id) return true;
    if (menu.children?.length && menuContainsId(menu.children, id)) return true;
  }
  return false;
}

function renderMenuLabel(text: string, badge?: number): ReactNode {
  if (!badge) return text;
  return (
    <span className="admin-sidebar__menuLabel">
      {text}
      <span className="admin-sidebar__menuBadge">{badge}</span>
    </span>
  );
}

function registerPathMapping(
  path: string,
  keyChain: string[],
  keyToPath: Record<string, string>,
  pathToKeyChain: Record<string, string[]>,
  key: string,
) {
  keyToPath[key] = path;
  const existing = pathToKeyChain[path];
  if (!existing || keyChain.length > existing.length) {
    pathToKeyChain[path] = keyChain;
  }
}

function buildMenuItems(
  menus: MenuItemType[],
  translate: (key: string, fallback: string) => string,
  collapsed = false,
  iconSize = 20,
  parentKeys: string[] = [],
  isTopLevel = true,
  menuBadges: Record<string, number> = {},
): BuildMenuResult {
  const sorted = menus.filter((m) => !m.hidden).sort((a, b) => a.sort - b.sort);
  const keyToPath: Record<string, string> = {};
  const pathToKeyChain: Record<string, string[]> = {};
  const items: AntMenuItem[] = [];

  for (const menu of sorted) {
    const labelText = translate(`menu.${menu.id}`, menu.name);
    const label = renderMenuLabel(labelText, menuBadges[menu.id]);
    const key = menu.id;

    if (menu.kind === "group") {
      const built = buildMenuItems(
        menu.children,
        translate,
        collapsed,
        iconSize,
        parentKeys,
        isTopLevel,
        menuBadges,
      );
      Object.assign(keyToPath, built.keyToPath);
      Object.assign(pathToKeyChain, built.pathToKeyChain);
      items.push(...built.items);
      continue;
    }

    const nextParents = [...parentKeys, key];
    const hasChildren = Boolean(menu.children?.length);

    if (menu.path) {
      registerPathMapping(menu.path, nextParents, keyToPath, pathToKeyChain, key);
    }

    let children: AntMenuItem[] | undefined;
    if (hasChildren && menu.children) {
      const built = buildMenuItems(
        menu.children,
        translate,
        collapsed,
        iconSize,
        nextParents,
        false,
        menuBadges,
      );
      Object.assign(keyToPath, built.keyToPath);
      Object.assign(pathToKeyChain, built.pathToKeyChain);
      children = built.items.length ? built.items : undefined;
    }

    if (hasChildren && children?.length) {
      items.push({
        key,
        label,
        icon: isTopLevel ? renderMenuIcon(menu.icon, iconSize) : undefined,
        children,
      });
    } else {
      items.push({
        key,
        label,
        icon: isTopLevel ? renderMenuIcon(menu.icon, iconSize) : undefined,
      });
    }
  }

  return { items, keyToPath, pathToKeyChain };
}

function resolveMenuKeyChain(pathname: string, pathToKeyChain: Record<string, string[]>): string[] {
  const exact = pathToKeyChain[pathname];
  if (exact?.length) return exact;

  let best: string[] = [];
  let bestLen = 0;
  for (const [path, chain] of Object.entries(pathToKeyChain)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      if (path.length > bestLen) {
        bestLen = path.length;
        best = chain;
      }
    }
  }
  return best;
}

export function Sidebar() {
  const { t } = useTranslation();
  const menus = useAuthStore((s) => s.menus);
  const collapsed = useSettingsStore((s) => s.sidebarCollapsed);
  const setSidebarCollapsed = useSettingsStore((s) => s.setSidebarCollapsed);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const mobileOpen = collapsed;

  const showCommentBadge = menuContainsId(menus, COMMENTS_MENU_ID);
  const { data: pendingCommentCount = 0 } = usePendingCommentCount(showCommentBadge);

  const menuBadges = useMemo(() => {
    if (!pendingCommentCount) return {};
    return { [COMMENTS_MENU_ID]: pendingCommentCount };
  }, [pendingCommentCount]);

  const builtMenu = useMemo(
    () =>
      buildMenuItems(
        menus,
        (key, fallback) => t(key, { defaultValue: fallback }),
        !isMobile && collapsed,
        20,
        [],
        true,
        menuBadges,
      ),
    [menus, isMobile, collapsed, t, menuBadges],
  );

  const { selectedKey, routeOpenKeys } = useMemo(() => {
    const chain = resolveMenuKeyChain(location.pathname, builtMenu.pathToKeyChain);
    return { selectedKey: chain.at(-1), routeOpenKeys: chain.slice(0, -1) };
  }, [builtMenu, location.pathname]);

  const routeOpenKeysSig = routeOpenKeys.join("\0");
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(false);
    }
  }, [isMobile, setSidebarCollapsed]);

  useEffect(() => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      for (const k of routeOpenKeys) next.add(k);
      return [...next];
    });
  }, [location.pathname, routeOpenKeysSig]);

  const collapseFooter = (isCollapsed: boolean) => (
    <div className="admin-sidebar__collapse">
      <Button
        type="text"
        className={`admin-sidebar__collapseBtn ${isCollapsed ? "admin-sidebar__collapseBtn--icon" : ""}`}
        onClick={toggleSidebar}
        icon={isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        aria-label={t("admin.collapseMenu")}
      >
        {isCollapsed ? null : t("admin.collapseMenu")}
      </Button>
    </div>
  );

  const sidebarMenu = (isCollapsed: boolean) => (
    <>
      <Menu
        mode="inline"
        theme="dark"
        inlineCollapsed={isCollapsed}
        selectedKeys={selectedKey ? [selectedKey] : []}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        items={builtMenu.items}
        getPopupContainer={() => document.body}
        onClick={({ key }) => {
          const path = builtMenu.keyToPath[String(key)];
          if (!path) return;
          if (isMobile) {
            setSidebarCollapsed(false);
          }
          void navigate({ to: path });
        }}
        className="admin-sidebar__menu"
      />
      {!isMobile ? collapseFooter(isCollapsed) : null}
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        placement="left"
        onClose={() => setSidebarCollapsed(false)}
        size={160}
        styles={{
          body: {
            padding: 0,
            background: "var(--admin-sidebar-bg)",
            overflow: "hidden",
          },
          header: { display: "none" },
          mask: { opacity: 0.5 },
        }}
      >
        {sidebarMenu(false)}
      </Drawer>
    );
  }

  return (
    <Sider
      theme="dark"
      className="admin-sidebar"
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={160}
      collapsedWidth={36}
      breakpoint="lg"
      onBreakpoint={(broken) => {
        if (broken) {
          setSidebarCollapsed(false);
        }
      }}
    >
      {sidebarMenu(collapsed)}
    </Sider>
  );
}
