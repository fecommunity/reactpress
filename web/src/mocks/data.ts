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
  roles: i === 0 ? ["admin"] : ["visitor"],
  permissions: i === 0 ? [...ADMIN_PERMISSIONS] : ["article:read", "view:read"],
}));

import {
  ARTICLE_CATEGORY_OPTIONS,
  ARTICLE_TAG_OPTIONS,
  type ArticleCategoryOption,
  type ArticleTagOption,
} from "@/modules/article/constants";

export type MockCategory = ArticleCategoryOption;
export type MockTag = ArticleTagOption;

export const MOCK_CATEGORIES = ARTICLE_CATEGORY_OPTIONS;
export const MOCK_TAGS = ARTICLE_TAG_OPTIONS;

export interface MockArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  html: string;
  cover: string | null;
  status: "draft" | "publish";
  views: number;
  publishAt: string | null;
  category: MockCategory | null;
  tags: MockTag[];
  isRecommended: boolean;
  isCommentable: boolean;
  password: string | null;
  needPassword: boolean;
}

export interface MockComment {
  id: string;
  name: string;
  email: string;
  content: string;
  html: string;
  pass: boolean;
  hostId: string;
  url: string;
  createAt: string;
}

function articleSeed(
  partial: Omit<
    MockArticle,
    | "summary"
    | "content"
    | "html"
    | "cover"
    | "category"
    | "tags"
    | "isRecommended"
    | "isCommentable"
    | "password"
    | "needPassword"
  > & {
    summary?: string;
    content?: string;
    category?: MockCategory | null;
    tags?: MockTag[];
  },
): MockArticle {
  const content = partial.content ?? `# ${partial.title}\n\n示例正文内容。`;
  return {
    summary: partial.summary ?? `${partial.title} 的摘要。`,
    content,
    html: `<h1>${partial.title}</h1><p>${content.replace(/\n/g, "<br/>")}</p>`,
    cover: null,
    category: partial.category ?? MOCK_CATEGORIES[1],
    tags: partial.tags ?? [MOCK_TAGS[0]],
    isRecommended: true,
    isCommentable: true,
    password: null,
    needPassword: false,
    ...partial,
  };
}

export const MOCK_ARTICLES: MockArticle[] = [
  articleSeed({
    id: "1",
    title: "ReactPress 3.0 发布说明",
    status: "publish",
    views: 1280,
    publishAt: "2025-05-01T08:00:00.000Z",
    category: MOCK_CATEGORIES[0],
  }),
  articleSeed({
    id: "2",
    title: "用 Vite+ 搭建管理后台",
    status: "publish",
    views: 842,
    publishAt: "2025-04-18T10:00:00.000Z",
  }),
  articleSeed({
    id: "3",
    title: "MSW 本地 Mock 最佳实践",
    status: "publish",
    views: 615,
    publishAt: "2025-04-12T14:30:00.000Z",
    tags: [MOCK_TAGS[1], MOCK_TAGS[2]],
  }),
  articleSeed({
    id: "4",
    title: "TanStack Router 路由约定",
    status: "draft",
    views: 0,
    publishAt: null,
  }),
  articleSeed({ id: "5", title: "文章编辑器接入指南", status: "draft", views: 0, publishAt: null }),
  articleSeed({
    id: "6",
    title: "权限系统设计笔记",
    status: "publish",
    views: 390,
    publishAt: "2025-03-28T09:15:00.000Z",
    category: MOCK_CATEGORIES[2],
  }),
  articleSeed({
    id: "7",
    title: "主题与插件扩展点",
    status: "publish",
    views: 275,
    publishAt: "2025-03-15T16:45:00.000Z",
  }),
  articleSeed({
    id: "8",
    title: "Headless API 使用示例",
    status: "draft",
    views: 0,
    publishAt: null,
  }),
  articleSeed({
    id: "9",
    title: "部署到 Vercel 的注意事项",
    status: "publish",
    views: 510,
    publishAt: "2025-02-20T11:00:00.000Z",
    tags: [MOCK_TAGS[3]],
  }),
  articleSeed({ id: "10", title: "评论模块规划", status: "draft", views: 0, publishAt: null }),
  articleSeed({
    id: "11",
    title: "数据导入导出流程",
    status: "publish",
    views: 198,
    publishAt: "2025-02-08T13:20:00.000Z",
  }),
  articleSeed({
    id: "12",
    title: "媒体库与 CDN 配置",
    status: "publish",
    views: 432,
    publishAt: "2025-01-25T10:10:00.000Z",
  }),
  articleSeed({
    id: "13",
    title: "多语言内容管理方案",
    status: "draft",
    views: 0,
    publishAt: null,
  }),
  articleSeed({
    id: "14",
    title: "SEO 与站点地图",
    status: "publish",
    views: 367,
    publishAt: "2025-01-10T08:50:00.000Z",
  }),
];

export const MOCK_COMMENTS: MockComment[] = [
  {
    id: "c1",
    name: "Alex",
    email: "alex@example.com",
    content: "这篇发布说明写得很清楚，期待更多示例。",
    html: "<p>这篇发布说明写得很清楚，期待更多示例。</p>",
    pass: true,
    hostId: "1",
    url: "/article/1",
    createAt: "2025-05-02T10:00:00.000Z",
  },
  {
    id: "c2",
    name: "Jamie",
    email: "jamie@example.com",
    content: "Mock 数据在本地开发里真的很好用。",
    html: "<p>Mock 数据在本地开发里真的很好用。</p>",
    pass: false,
    hostId: "3",
    url: "/article/3",
    createAt: "2025-04-20T14:22:00.000Z",
  },
  {
    id: "c3",
    name: "Taylor",
    email: "taylor@example.com",
    content: "权限设计那篇能否补充角色矩阵？",
    html: "<p>权限设计那篇能否补充角色矩阵？</p>",
    pass: false,
    hostId: "6",
    url: "/article/6",
    createAt: "2025-04-01T09:05:00.000Z",
  },
  {
    id: "c4",
    name: "Jordan",
    email: "jordan@example.com",
    content: "Vite+  toolchain 对 CI 友好吗？",
    html: "<p>Vite+ toolchain 对 CI 友好吗？</p>",
    pass: true,
    hostId: "2",
    url: "/article/2",
    createAt: "2025-03-30T16:40:00.000Z",
  },
];
