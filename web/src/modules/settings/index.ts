import type { AdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";

const SETTING_TABS = [
  { id: "general", title: "常规", path: "/settings/general", sort: 0 },
  { id: "seo", title: "SEO", path: "/settings/seo", sort: 1 },
  { id: "email", title: "邮件", path: "/settings/email", sort: 2 },
] as const;

export const settingsModule: AdminModule = {
  id: "settings",
  register({ menu, settings, permissions, routes }) {
    permissions.register(["setting:manage"]);
    menu.register({
      id: "settings",
      title: "设置",
      path: "/settings/general",
      icon: "admin-settings",
      permissions: ["setting:manage"],
      sort: 60,
      children: SETTING_TABS.map((tab) => ({
        id: `settings.${tab.id}`,
        title: tab.title,
        path: tab.path,
        permissions: ["setting:manage"] as const,
        sort: tab.sort,
      })),
    });
    for (const tab of SETTING_TABS) {
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
