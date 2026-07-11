import type { AdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";

const CORE_SETTING_TABS = [
  { id: "general", title: "常规", path: "/settings/general", sort: 0 },
  { id: "seo", title: "SEO", path: "/settings/seo", sort: 1 },
  { id: "email", title: "邮件", path: "/settings/email", sort: 2 },
] as const;

type SettingTab = {
  id: string;
  title: string;
  path: string;
  sort: number;
};

function getSettingTabs(): SettingTab[] {
  const tabs: SettingTab[] = CORE_SETTING_TABS.map((tab) => ({ ...tab }));
  if (typeof window !== "undefined" && window.reactpressDesktop) {
    tabs.push({
      id: "desktop-api",
      title: "桌面客户端",
      path: "/settings/desktop-api",
      sort: 99,
    });
  }
  return tabs;
}

export const settingsModule: AdminModule = {
  id: "settings",
  register({ menu, settings, permissions, routes }) {
    permissions.register(["setting:manage"]);
    const settingTabs = getSettingTabs();
    menu.register({
      id: "settings",
      title: "设置",
      path: "/settings/general",
      icon: "admin-settings",
      permissions: ["setting:manage"],
      sort: 60,
      children: settingTabs.map((tab) => ({
        id: `settings.${tab.id}`,
        title: tab.title,
        path: tab.path,
        permissions: ["setting:manage"] as const,
        sort: tab.sort,
      })),
    });
    for (const tab of settingTabs) {
      settings.registerTab({
        id: tab.id,
        title: tab.title,
        path: tab.path,
        permission: "setting:manage",
        sort: tab.sort,
      });
      routes.registerRoute({ path: tab.path, permission: "setting:manage" });
    }
  },
};
