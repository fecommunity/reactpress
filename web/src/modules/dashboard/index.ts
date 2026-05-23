import type { AdminModule } from "@fecommunity/reactpress-toolkit/admin";

export const dashboardModule: AdminModule = {
  id: "dashboard",
  register({ menu, permissions, routes }) {
    permissions.register(["view:read"]);
    menu.register({
      id: "dashboard",
      title: "仪表盘",
      path: "/dashboard",
      icon: "IconLucideLayoutDashboard",
      sort: 0,
    });
    routes.registerRoute({ path: "/dashboard", permission: null });
  },
};
