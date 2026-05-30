import type { AdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";

export const mediaModule: AdminModule = {
  id: "media",
  register({ menu, permissions, routes }) {
    permissions.register(["media:manage"]);
    menu.register({
      id: "media",
      title: "媒体",
      path: "/media",
      icon: "admin-media",
      permissions: ["media:manage"],
      sort: 20,
    });
    routes.registerRoute({ path: "/media", permission: "media:manage" });
  },
};
