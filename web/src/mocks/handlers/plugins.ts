import {
  defaultSitePluginState,
  getPluginStateFromGlobalSetting,
  mergePluginStateIntoGlobalSetting,
} from "@fecommunity/reactpress-toolkit/plugin/extension";
import { http } from "msw";

import helloWorldAdminEn from "../../../../plugins/hello-world/locales/en.json";
import helloWorldAdminZh from "../../../../plugins/hello-world/locales/zh.json";
import seoAdminEn from "../../../../plugins/seo/locales/en.json";
import seoAdminZh from "../../../../plugins/seo/locales/zh.json";
import { successResponse, withDelay } from "../createHandler";
import { getMockGlobalSetting, patchMockGlobalSettingPlugins, setMockGlobalSetting } from "./page";

const HELLO_WORLD_SETTINGS = {
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      enabled: { type: "boolean", title: "启用自动摘要", default: true },
      maxLength: {
        type: "integer",
        title: "摘要最大长度",
        minimum: 40,
        maximum: 500,
        default: 160,
      },
      suffix: { type: "string", title: "截断后缀", default: "…" },
      fallbackToTitle: { type: "boolean", title: "正文为空时使用标题", default: true },
    },
  },
};

const SEO_SETTINGS = {
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      enabled: { type: "boolean", title: "启用 SEO 自动补全", default: true },
      autoSlug: { type: "boolean", title: "自动生成 URL 别名", default: true },
      autoDescription: { type: "boolean", title: "自动生成 SEO 描述", default: true },
      autoKeywords: { type: "boolean", title: "自动生成 SEO 关键词", default: true },
      descriptionMaxLength: {
        type: "integer",
        title: "描述最大长度",
        minimum: 80,
        maximum: 320,
        default: 160,
      },
      descriptionSuffix: { type: "string", title: "描述截断后缀", default: "…" },
    },
  },
};

const MOCK_PLUGINS = [
  {
    id: "hello-world",
    name: "自动摘要",
    version: "1.2.0",
    description: "发布文章时，若摘要为空，从正文或标题自动生成 summary。",
    author: "ReactPress",
    source: "local" as const,
    installed: false,
    active: false,
    settings: HELLO_WORLD_SETTINGS,
    server: {
      module: "./dist/index.js",
      hooks: { subscribe: ["article.beforePublish"] },
    },
  },
  {
    id: "seo",
    name: "SEO 增强",
    version: "1.0.0",
    description: "为文章提供 URL 别名、SEO 关键词与 meta 描述，发布时可自动补全。",
    author: "ReactPress",
    source: "local" as const,
    installed: false,
    active: false,
    settings: SEO_SETTINGS,
    server: {
      module: "./dist/index.js",
      hooks: { subscribe: ["article.beforeCreate", "article.beforePublish"] },
    },
    admin: {
      slots: {
        subscribe: ["article.editor.meta.afterSummary"],
      },
      menu: {
        title: "SEO 增强",
        path: "/plugins/seo/settings",
        permission: "extension:manage",
        sort: 20,
      },
    },
  },
];

function listWithState() {
  const state = getPluginStateFromGlobalSetting(getMockGlobalSetting());
  const activeSet = new Set(state.activePlugins);
  const installedSet = new Set(state.installedPlugins);
  return MOCK_PLUGINS.map((plugin) => ({
    ...plugin,
    installed: installedSet.has(plugin.id),
    active: activeSet.has(plugin.id),
    loadError: state.entries[plugin.id]?.loadError,
    config: state.entries[plugin.id]?.config,
  }));
}

export const pluginHandlers = [
  http.get("/api/extension/plugins", async () => {
    await withDelay(150);
    return successResponse(listWithState());
  }),

  http.get("/api/extension/plugins/state", async () => {
    await withDelay(100);
    return successResponse(getPluginStateFromGlobalSetting(getMockGlobalSetting()));
  }),

  http.get("/api/extension/plugins/:id", async ({ params }) => {
    await withDelay(100);
    const found = listWithState().find((p) => p.id === params.id);
    return successResponse(found ?? null);
  }),

  http.get("/api/extension/plugins/:id/locales/:locale", async ({ params }) => {
    await withDelay(80);
    const id = String(params.id);
    const locale = String(params.locale);
    if (id === "hello-world") {
      const messages = locale.toLowerCase().startsWith("zh")
        ? helloWorldAdminZh
        : helloWorldAdminEn;
      return successResponse({ pluginId: id, locale, messages });
    }
    if (id === "seo") {
      const messages = locale.toLowerCase().startsWith("zh") ? seoAdminZh : seoAdminEn;
      return successResponse({ pluginId: id, locale, messages });
    }
    return successResponse({ pluginId: id, locale, messages: {} });
  }),

  http.post("/api/extension/plugins/:id/install", async ({ params }) => {
    await withDelay(200);
    const state = getPluginStateFromGlobalSetting(getMockGlobalSetting());
    const id = String(params.id);
    const installedPlugins = state.installedPlugins.includes(id)
      ? state.installedPlugins
      : [...state.installedPlugins, id];
    const entries = { ...state.entries };
    entries[id] = {
      ...entries[id],
      version: entries[id]?.version ?? "1.2.0",
      source: entries[id]?.source ?? "local",
    };
    const merged = mergePluginStateIntoGlobalSetting(getMockGlobalSetting(), {
      installedPlugins,
      entries,
    });
    setMockGlobalSetting(merged);
    patchMockGlobalSettingPlugins(merged.plugins as object);
    return successResponse(merged.plugins);
  }),

  http.post("/api/extension/plugins/:id/activate", async ({ params }) => {
    await withDelay(200);
    const state = getPluginStateFromGlobalSetting(getMockGlobalSetting());
    const id = String(params.id);
    const activePlugins = state.activePlugins.includes(id)
      ? state.activePlugins
      : [...state.activePlugins, id];
    const entries = { ...state.entries };
    entries[id] = {
      ...(entries[id] ?? { version: "1.2.0", source: "local" }),
      activatedAt: new Date().toISOString(),
      loadError: undefined,
    };
    const merged = mergePluginStateIntoGlobalSetting(getMockGlobalSetting(), {
      activePlugins,
      entries,
    });
    setMockGlobalSetting(merged);
    patchMockGlobalSettingPlugins(merged.plugins as object);
    return successResponse(merged.plugins);
  }),

  http.post("/api/extension/plugins/:id/deactivate", async ({ params }) => {
    await withDelay(200);
    const state = getPluginStateFromGlobalSetting(getMockGlobalSetting());
    const id = String(params.id);
    const activePlugins = state.activePlugins.filter((pid) => pid !== id);
    const merged = mergePluginStateIntoGlobalSetting(getMockGlobalSetting(), { activePlugins });
    setMockGlobalSetting(merged);
    patchMockGlobalSettingPlugins(merged.plugins as object);
    return successResponse(merged.plugins);
  }),

  http.delete("/api/extension/plugins/:id", async ({ params }) => {
    await withDelay(200);
    const state = getPluginStateFromGlobalSetting(getMockGlobalSetting());
    const id = String(params.id);
    const installedPlugins = state.installedPlugins.filter((pid) => pid !== id);
    const entries = { ...state.entries };
    delete entries[id];
    const merged = mergePluginStateIntoGlobalSetting(getMockGlobalSetting(), {
      installedPlugins,
      entries,
    });
    setMockGlobalSetting(merged);
    patchMockGlobalSettingPlugins(merged.plugins as object);
    return successResponse(merged.plugins);
  }),

  http.put("/api/extension/plugins/:id/config", async ({ params, request }) => {
    await withDelay(150);
    const body = (await request.json()) as { config?: Record<string, unknown> };
    const state = getPluginStateFromGlobalSetting(getMockGlobalSetting());
    const id = String(params.id);
    const entries = { ...state.entries };
    const current = entries[id] ?? { version: "1.2.0", source: "local" as const };
    entries[id] = { ...current, config: body.config ?? {} };
    const merged = mergePluginStateIntoGlobalSetting(getMockGlobalSetting(), { entries });
    setMockGlobalSetting(merged);
    patchMockGlobalSettingPlugins(merged.plugins as object);
    return successResponse(merged.plugins);
  }),
];

export { defaultSitePluginState };
