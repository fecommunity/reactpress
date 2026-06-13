import type { AdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";
import { AdminSlotIds } from "@fecommunity/reactpress-toolkit/plugin/admin";

/** Admin UI slots owned by the article module (see toolkit `AdminSlotIds`). */
export const ARTICLE_ADMIN_SLOTS = [
  {
    id: AdminSlotIds.ARTICLE_EDITOR_META_AFTER_SUMMARY,
    title: "文章编辑器 · 摘要下方",
    module: "article",
    description: "挂载 SEO、自定义 meta 等扩展面板",
  },
  {
    id: AdminSlotIds.ARTICLE_EDITOR_SIDEBAR_AFTER_PUBLISH,
    title: "文章编辑器 · 发布框下方",
    module: "article",
    description: "挂载发布相关扩展控件",
  },
] as const;

export const articleModule: AdminModule = {
  id: "article",
  register({ menu, permissions, routes }) {
    permissions.register(["article:read", "article:write", "article:publish"]);
    menu.register({
      id: "article",
      title: "文章",
      path: "/article",
      icon: "admin-post",
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
