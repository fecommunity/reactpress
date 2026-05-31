import { Link, useNavigate } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import { Avatar, Button, Dropdown, Flex, Grid, Layout } from "antd";
import { PanelLeft, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { GitHub } from "@/components/Icon";
import { LanguageSwitcher, ThemeSwitcher } from "@/components/LanguageSwitcher";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { defaultMediaSearch, defaultUsersSearch } from "@/routes/searchDefaults";
import { ReactPressLogoMark } from "@/shared/brand";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { APP_BRAND_NAME, REACTPRESS_GITHUB_URL } from "@/utils/constants";

const { Header: AntHeader } = Layout;

/** Top bar utility icons — keep GitHub / locale / theme visually aligned. */
const ADMIN_BAR_ICON_SIZE = 16;

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleMobileSidebar = useSettingsStore((s) => s.toggleMobileSidebar);
  const mobileSidebarOpen = useSettingsStore((s) => s.mobileSidebarOpen);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;
  const { data: siteSettings } = useSiteSettings();

  const siteTitle =
    (typeof siteSettings?.systemTitle === "string" && siteSettings.systemTitle.trim()) ||
    APP_BRAND_NAME;
  const siteUrl =
    (typeof siteSettings?.systemUrl === "string" && siteSettings.systemUrl.trim()) || undefined;

  const newMenuItems: MenuProps["items"] = [
    {
      key: "article",
      label: (
        <Link to="/article/editor" className="admin-bar__menuLink">
          {t("menu.article.new")}
        </Link>
      ),
    },
    {
      key: "page",
      label: (
        <Link to="/page/editor" className="admin-bar__menuLink">
          {t("menu.page.new")}
        </Link>
      ),
    },
    {
      key: "media",
      label: (
        <Link to="/media" search={defaultMediaSearch} className="admin-bar__menuLink">
          {t("menu.media")}
        </Link>
      ),
    },
    {
      key: "user",
      label: t("menu.users.all"),
      onClick: () => void navigate({ to: "/users", search: defaultUsersSearch }),
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <Link to="/profile" className="admin-bar__menuLink">
          {t("menu.users.profile")}
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: t("common.signOut"),
      onClick: () => {
        logout();
        void navigate({ to: "/login", search: {} });
      },
    },
  ];

  const avatarSrc = (user?.avatar ?? "").trim() || undefined;

  return (
    <AntHeader className="admin-bar" style={{ padding: 0, lineHeight: "var(--admin-bar-height)" }}>
      <div className="admin-bar__left">
        {isMobile ? (
          <Button
            type="text"
            className="admin-bar__action"
            onClick={toggleMobileSidebar}
            icon={<PanelLeft size={16} />}
            aria-label={t("common.toggleSidebar")}
            aria-expanded={mobileSidebarOpen}
          />
        ) : null}
        <a
          href={siteUrl ?? "#"}
          className="admin-bar__site"
          target={siteUrl ? "_blank" : undefined}
          rel={siteUrl ? "noopener noreferrer" : undefined}
          onClick={siteUrl ? undefined : (e) => e.preventDefault()}
          aria-label={siteTitle}
        >
          <span className="admin-bar__brandMark" aria-hidden>
            <ReactPressLogoMark />
          </span>
          <span className="admin-bar__siteName">{siteTitle}</span>
        </a>
        <span className="admin-bar__divider" aria-hidden />
        <Dropdown menu={{ items: newMenuItems }} trigger={["click"]}>
          <Button
            type="text"
            className="admin-bar__action"
            icon={<Plus size={14} />}
            aria-haspopup="menu"
            aria-label={t("admin.new")}
          >
            {t("admin.new")}
          </Button>
        </Dropdown>
      </div>
      <div className="admin-bar__right">
        <a
          className="admin-bar__action rp-toolbar-btn"
          href={REACTPRESS_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("common.openGitHub")}
        >
          <GitHub size={ADMIN_BAR_ICON_SIZE} />
        </a>
        <LanguageSwitcher size={ADMIN_BAR_ICON_SIZE} className="admin-bar__action" />
        <ThemeSwitcher size={ADMIN_BAR_ICON_SIZE} className="admin-bar__action" />
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <Flex align="center" className="admin-bar__user" gap={6} aria-label={t("admin.userMenu")}>
            <span>{t("admin.howdy", { name: user?.username ?? "—" })}</span>
            <Avatar size={20} src={avatarSrc}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </Flex>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
