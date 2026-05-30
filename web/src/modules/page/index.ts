import type { AdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";

export const pageModule: AdminModule = {
  id: "page",
  register({ menu, permissions, routes }) {
    permissions.register(["page:manage"]);
    menu.register({
      id: "page",
      title: "页面",
      path: "/page",
      icon: "admin-page",
      permissions: ["page:manage"],
      sort: 25,
      children: [
        {
          id: "page.all",
          title: "所有页面",
          path: "/page",
          permissions: ["page:manage"],
          sort: 0,
        },
        {
          id: "page.new",
          title: "新建页面",
          path: "/page/editor",
          permissions: ["page:manage"],
          sort: 1,
        },
      ],
    });
    routes.registerRoute({ path: "/page", permission: "page:manage" });
    routes.registerRoute({ path: "/page/editor", permission: "page:manage" });
  },
};
