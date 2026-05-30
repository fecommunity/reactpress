import { getThemeConfigurationSeed } from "@fecommunity/reactpress-toolkit/theme";
import { http } from "msw";

import { successResponse, withDelay } from "../createHandler";

const mockThemeConfigSeed = (getThemeConfigurationSeed("twentytwentyfive", "zh") ?? {}) as {
  nav?: { urlConfig?: unknown; searchCategories?: unknown };
};

const MOCK_PAGES = [
  {
    id: "p1",
    name: "关于我们",
    path: "about",
    order: 0,
    status: "publish",
    views: 120,
    publishAt: "2025-04-01T08:00:00.000Z",
    content: "# 关于我们",
  },
  {
    id: "p2",
    name: "隐私政策",
    path: "privacy",
    order: 1,
    status: "draft",
    views: 0,
    publishAt: null,
    content: "# 隐私政策",
  },
];

let mockSettings: Record<string, unknown> = {
  systemTitle: "ReactPress",
  systemSubTitle: "基于 React 的博客与内容发布平台",
  systemUrl: "http://localhost:3001",
  adminSystemUrl: "http://localhost/admin/",
  systemLogo: "/logo.png",
  systemFavicon: "/favicon.png",
  systemNoticeInfo:
    '[{"id":"n1","content":"欢迎使用 ReactPress！","enabled":true},{"id":"n2","content":"可在「设置 → 常规」管理多条公告并调整顺序。","enabled":true}]',
  seoKeyword: "React,博客,CMS,ReactPress",
  seoDesc: "使用 ReactPress 搭建的博客与内容站点。",
  aboutUsGithubUrl: "https://github.com/fecommunity/reactpress",
  aboutUsCommentQr: "https://www.gaoredu.com/wp-content/uploads/2024/08/WechatIMG23.jpg",
  aboutUsWechatQr: "https://www.gaoredu.com/wp-content/uploads/2024/11/wechat.png",
  globalSetting: JSON.stringify({
    theme: {
      activeTheme: "twentytwentyfive",
      installedThemes: ["twentytwentyfive", "hello-world"],
      mods: {},
      previewThemeId: "twentytwentyfive",
    },
    config: {
      twentytwentyfive: mockThemeConfigSeed,
    },
    zh: {
      globalConfig: {
        navConfig: mockThemeConfigSeed.nav?.searchCategories,
        urlConfig: mockThemeConfigSeed.nav?.urlConfig,
      },
    },
  }),
  oss: "{}",
  i18n: JSON.stringify({
    zh: {
      home: "首页",
      nav: "导航",
      archives: "时光圈",
      knowledge: "专辑",
    },
    en: {
      home: "Home",
      nav: "Navigation",
      archives: "Archives",
      knowledge: "Knowledge",
    },
  }),
};

export function getMockGlobalSetting(): Record<string, unknown> {
  try {
    const raw = mockSettings.globalSetting;
    return typeof raw === "string" ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function setMockGlobalSetting(global: Record<string, unknown>) {
  mockSettings = { ...mockSettings, globalSetting: JSON.stringify(global) };
}

export function patchMockGlobalSettingTheme(theme: Record<string, unknown> | object) {
  const global = getMockGlobalSetting();
  global.theme = theme;
  setMockGlobalSetting(global);
}

export const pageHandlers = [
  http.get("/api/page", async ({ request }) => {
    await withDelay(200);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 12);
    const start = (page - 1) * pageSize;
    return successResponse([MOCK_PAGES.slice(start, start + pageSize), MOCK_PAGES.length]);
  }),

  http.get("/api/page/:id", async ({ params }) => {
    await withDelay(150);
    const page = MOCK_PAGES.find((p) => p.id === params.id);
    if (!page) return successResponse(null);
    return successResponse(page);
  }),

  http.post("/api/page", async ({ request }) => {
    await withDelay(200);
    const body = (await request.json()) as Record<string, unknown>;
    const id = `p${Date.now()}`;
    MOCK_PAGES.push({
      id,
      name: String(body.name ?? ""),
      path: String(body.path ?? ""),
      order: Number(body.order ?? 0),
      status: String(body.status ?? "draft"),
      views: 0,
      publishAt: null,
      content: String(body.content ?? ""),
    });
    return successResponse({ id });
  }),

  http.patch("/api/page/:id", async ({ params, request }) => {
    await withDelay(200);
    const body = (await request.json()) as Record<string, unknown>;
    const idx = MOCK_PAGES.findIndex((p) => p.id === params.id);
    if (idx >= 0) Object.assign(MOCK_PAGES[idx]!, body);
    return successResponse({ id: params.id });
  }),

  http.delete("/api/page/:id", async ({ params }) => {
    await withDelay(150);
    const idx = MOCK_PAGES.findIndex((p) => p.id === params.id);
    if (idx >= 0) MOCK_PAGES.splice(idx, 1);
    return successResponse(null);
  }),
];

const MOCK_FILES = [
  {
    id: "f1",
    originalname: "logo.png",
    url: "https://api.gaoredu.com/public/uploads/logo.png",
    type: "image/png",
    size: 1024,
    createAt: "2025-05-01T08:00:00.000Z",
  },
  {
    id: "f2",
    originalname: "banner.jpg",
    url: "https://api.gaoredu.com/public/uploads/banner.jpg",
    type: "image/jpeg",
    size: 204800,
    createAt: "2025-04-15T10:00:00.000Z",
  },
  {
    id: "f3",
    originalname: "intro.mp4",
    url: "https://api.gaoredu.com/public/uploads/intro.mp4",
    type: "video/mp4",
    size: 5242880,
    createAt: "2025-03-20T12:00:00.000Z",
  },
];

export const fileHandlers = [
  http.get("/api/file", async ({ request }) => {
    await withDelay(200);
    const url = new URL(request.url);
    const keyword = url.searchParams.get("originalname")?.toLowerCase() ?? "";
    const type = url.searchParams.get("type")?.toLowerCase() ?? "";
    const month = url.searchParams.get("createAt") ?? "";
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "60");

    let filtered = [...MOCK_FILES];
    if (keyword) {
      filtered = filtered.filter((f) => f.originalname.toLowerCase().includes(keyword));
    }
    if (type) {
      filtered = filtered.filter((f) => f.type.toLowerCase().includes(type));
    }
    if (month) {
      filtered = filtered.filter((f) => f.createAt.includes(month));
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const list = filtered.slice(start, start + pageSize);
    return successResponse([list, total]);
  }),

  http.post("/api/file/upload", async () => {
    await withDelay(300);
    return successResponse({
      id: `f${Date.now()}`,
      originalname: "upload.png",
      url: "https://api.gaoredu.com/public/uploads/upload.png",
      type: "image/png",
      size: 2048,
      createAt: new Date().toISOString(),
    });
  }),

  http.delete("/api/file/:id", async () => {
    await withDelay(150);
    return successResponse(null);
  }),
];

export const settingHandlers = [
  http.post("/api/setting/get", async () => {
    await withDelay(150);
    return successResponse(mockSettings);
  }),

  http.post("/api/setting", async ({ request }) => {
    await withDelay(200);
    const body = (await request.json()) as Record<string, unknown>;
    mockSettings = { ...mockSettings, ...body };
    return successResponse(mockSettings);
  }),
];

export const viewHandlers = [
  http.get("/api/view", async () => {
    await withDelay(200);
    return successResponse([
      [
        {
          id: "v1",
          url: "/article/1",
          ip: "127.0.0.1",
          createAt: new Date().toISOString(),
        },
      ],
      1,
    ]);
  }),
];

export const apiKeyHandlers = [
  http.get("/api/api-key", async () => {
    await withDelay(100);
    return successResponse([{ id: "k1", name: "dev-key", scopes: "read" }]);
  }),
  http.post("/api/api-key", async ({ request }) => {
    await withDelay(150);
    const body = (await request.json()) as { name?: string; scopes?: string };
    return successResponse({ id: `k${Date.now()}`, name: body.name, scopes: body.scopes });
  }),
];
