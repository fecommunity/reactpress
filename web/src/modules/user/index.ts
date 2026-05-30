import type { AdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";

export const userModule: AdminModule = {
  id: "user",
  register({ menu, permissions, routes }) {
    permissions.register(["user:manage"]);
    menu.register({
      id: "users",
      title: "用户",
      path: "/users",
      icon: "admin-users",
      permissions: ["user:manage"],
      sort: 45,
      children: [
        {
          id: "users.all",
          title: "全部用户",
          path: "/users",
          permissions: ["user:manage"],
          sort: 0,
        },
        {
          id: "users.profile",
          title: "个人资料",
          path: "/profile",
          sort: 1,
        },
      ],
    });
    routes.registerRoute({ path: "/users", permission: "user:manage" });
    routes.registerRoute({ path: "/profile", permission: null });
  },
};
