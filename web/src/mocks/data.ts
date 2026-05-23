import { ADMIN_PERMISSIONS } from "@fecommunity/reactpress-toolkit/admin";
import type { User } from "@/api/schemas";
import { vercelAvatarUrl } from "./utils";

/** Demo logins look like real org accounts (first.last @ northstar.io). Index 0 stays `admin` for mock login. */
const MOCK_IDENTITIES: ReadonlyArray<[string, string]> = [
  ["admin", "ops.admin@northstar.io"],
  ["zhao.ming", "zhao.ming@northstar.io"],
  ["sarah.chen", "sarah.chen@northstar.io"],
  ["james.park", "james.park@northstar.io"],
  ["emma.garcia", "emma.garcia@northstar.io"],
  ["ryan.kim", "ryan.kim@northstar.io"],
  ["olivia.tanaka", "olivia.tanaka@northstar.io"],
  ["liam.patel", "liam.patel@northstar.io"],
  ["ava.nguyen", "ava.nguyen@northstar.io"],
  ["noah.berg", "noah.berg@northstar.io"],
  ["mia.silva", "mia.silva@northstar.io"],
];

export const MOCK_USERS: User[] = MOCK_IDENTITIES.map(([username, email], i) => ({
  id: String(i + 1),
  username,
  avatar: vercelAvatarUrl(username),
  email,
  roles: i === 0 ? ["admin"] : ["editor"],
  permissions: i === 0 ? [...ADMIN_PERMISSIONS] : ["article:read", "view:read"],
}));

export interface MockArticle {
  id: string;
  title: string;
  status: "draft" | "publish";
  views: number;
  publishAt: string | null;
}

export const MOCK_ARTICLES: MockArticle[] = [
  { id: "1", title: "ReactPress 3.0 发布说明", status: "publish", views: 1280, publishAt: "2025-05-01T08:00:00.000Z" },
  { id: "2", title: "用 Vite+ 搭建管理后台", status: "publish", views: 842, publishAt: "2025-04-18T10:00:00.000Z" },
  { id: "3", title: "MSW 本地 Mock 最佳实践", status: "publish", views: 615, publishAt: "2025-04-12T14:30:00.000Z" },
  { id: "4", title: "TanStack Router 路由约定", status: "draft", views: 0, publishAt: null },
  { id: "5", title: "文章编辑器接入指南", status: "draft", views: 0, publishAt: null },
  { id: "6", title: "权限系统设计笔记", status: "publish", views: 390, publishAt: "2025-03-28T09:15:00.000Z" },
  { id: "7", title: "主题与插件扩展点", status: "publish", views: 275, publishAt: "2025-03-15T16:45:00.000Z" },
  { id: "8", title: "Headless API 使用示例", status: "draft", views: 0, publishAt: null },
  { id: "9", title: "部署到 Vercel 的注意事项", status: "publish", views: 510, publishAt: "2025-02-20T11:00:00.000Z" },
  { id: "10", title: "评论模块规划", status: "draft", views: 0, publishAt: null },
  { id: "11", title: "数据导入导出流程", status: "publish", views: 198, publishAt: "2025-02-08T13:20:00.000Z" },
  { id: "12", title: "媒体库与 CDN 配置", status: "publish", views: 432, publishAt: "2025-01-25T10:10:00.000Z" },
  { id: "13", title: "多语言内容管理方案", status: "draft", views: 0, publishAt: null },
  { id: "14", title: "SEO 与站点地图", status: "publish", views: 367, publishAt: "2025-01-10T08:50:00.000Z" },
];
