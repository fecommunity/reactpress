import type { AdminModule } from "@fecommunity/reactpress-toolkit/admin";

export const commentModule: AdminModule = {
  id: "comment",
  register({ menu, permissions, routes }) {
    permissions.register(["comment:manage"]);
    menu.register({
      id: "comments",
      title: "评论",
      path: "/article/comment",
      icon: "admin-comments",
      permissions: ["comment:manage"],
      sort: 30,
    });
    routes.registerRoute({ path: "/article/comment", permission: "comment:manage" });
  },
};
