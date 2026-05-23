import type { AdminModule } from "@fecommunity/reactpress-toolkit/admin";

export const articleModule: AdminModule = {
  id: "article",
  register({ menu, permissions, routes }) {
    permissions.register(["article:read", "article:write", "article:publish"]);
    menu.register({
      id: "article",
      title: "文章",
      path: "/article",
      icon: "IconLucideBookOpen",
      permissions: ["article:read"],
      sort: 10,
      children: [
        {
          id: "article.all",
          title: "所有文章",
          path: "/article",
          permissions: ["article:read"],
          sort: 0,
        },
        {
          id: "article.new",
          title: "写文章",
          path: "/article/editor",
          permissions: ["article:write"],
          sort: 1,
        },
        {
          id: "article.categories",
          title: "分类目录",
          path: "/article/category",
          permissions: ["article:write"],
          sort: 2,
        },
        {
          id: "article.tags",
          title: "标签",
          path: "/article/tags",
          permissions: ["article:write"],
          sort: 3,
        },
      ],
    });
    routes.registerRoute({ path: "/article", permission: "article:read" });
    routes.registerRoute({ path: "/article/editor", permission: "article:write" });
    routes.registerRoute({ path: "/article/category", permission: "article:write" });
    routes.registerRoute({ path: "/article/tags", permission: "article:write" });
  },
};
