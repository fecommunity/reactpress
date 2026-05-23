import { Avatar, Button, Dropdown, Flex, Grid, Layout, theme } from "antd";
import type { MenuProps } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Plus, PanelLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Theme } from "@/components/Icon";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { APP_BRAND_NAME } from "@/utils/constants";

const { Header: AntHeader } = Layout;

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const toggleSidebar = useSettingsStore((s) => s.toggleSidebar);
  const toggleDarkMode = useSettingsStore((s) => s.toggleDarkMode);
  const { token } = theme.useToken();
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
        <Link to="/media" className="admin-bar__menuLink">
          {t("menu.media")}
        </Link>
      ),
    },
    {
      key: "user",
      label: t("menu.users.all"),
      onClick: () => void navigate({ to: "/users" }),
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
        void navigate({ to: "/login" });
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
            onClick={toggleSidebar}
            icon={<PanelLeft size={16} />}
            aria-label={t("common.toggleSidebar")}
          />
        ) : null}
        <a
          href={siteUrl ?? "#"}
          className="admin-bar__site"
          target={siteUrl ? "_blank" : undefined}
          rel={siteUrl ? "noopener noreferrer" : undefined}
          onClick={siteUrl ? undefined : (e) => e.preventDefault()}
        >
          <Home size={16} aria-hidden />
          <span className="admin-bar__siteName">{siteTitle}</span>
        </a>
        <span className="admin-bar__divider" aria-hidden />
        <Dropdown menu={{ items: newMenuItems }} trigger={["click"]}>
          <Button type="text" className="admin-bar__action" icon={<Plus size={14} />}>
            {t("admin.new")}
          </Button>
        </Dropdown>
      </div>
      <div className="admin-bar__right">
        <LanguageSwitcher compact />
        <Button
          type="text"
          className="admin-bar__action"
          onClick={toggleDarkMode}
          icon={<Theme size={token.size} />}
          aria-label={t("common.toggleTheme")}
        />
        <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
          <Flex align="center" className="admin-bar__user" gap={6}>
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
