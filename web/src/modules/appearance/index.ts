import type { AdminModule } from "@fecommunity/reactpress-toolkit/admin";

export const appearanceModule: AdminModule = {
  id: "appearance",
  register({ menu, permissions, routes }) {
    permissions.register(["extension:manage", "setting:manage"]);
    menu.register({
      id: "appearance",
      title: "外观",
      path: "/appearance/themes",
      icon: "admin-appearance",
      sort: 35,
      children: [
        {
          id: "appearance.themes",
          title: "主题",
          path: "/appearance/themes",
          permissions: ["extension:manage"],
          sort: 0,
        },
        {
          id: "appearance.customize",
          title: "自定义",
          path: "/appearance/customize",
          permissions: ["setting:manage"],
          sort: 1,
        },
      ],
    });
    routes.registerRoute({ path: "/appearance/themes", permission: "extension:manage" });
    routes.registerRoute({ path: "/appearance/themes/preview", permission: "extension:manage" });
    routes.registerRoute({ path: "/appearance/customize", permission: "setting:manage" });
  },
};
