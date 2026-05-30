import type { AdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";

export const dataModule: AdminModule = {
  id: "data",
  register({ menu, permissions, routes }) {
    permissions.register(["view:read"]);
    menu.register({
      id: "tools",
      title: "工具",
      path: "/data/export",
      icon: "admin-tools",
      sort: 50,
      children: [
        {
          id: "tools.analytics",
          title: "统计",
          path: "/data/analytics",
          permissions: ["view:read"],
          sort: 0,
        },
        {
          id: "tools.export",
          title: "导出",
          path: "/data/export",
          permissions: ["setting:manage"],
          sort: 1,
        },
        {
          id: "tools.import",
          title: "导入",
          path: "/data/import",
          permissions: ["setting:manage"],
          sort: 2,
        },
      ],
    });
    routes.registerRoute({ path: "/data/analytics", permission: "view:read" });
    routes.registerRoute({ path: "/data/export", permission: "setting:manage" });
    routes.registerRoute({ path: "/data/import", permission: "setting:manage" });
  },
};
