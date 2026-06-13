import {
  defaultSitePluginState,
  getPluginStateFromGlobalSetting,
  mergePluginStateIntoGlobalSetting,
} from "@fecommunity/reactpress-toolkit/plugin/extension";
import { http } from "msw";

import { successResponse, withDelay } from "../createHandler";
import { getMockGlobalSetting, patchMockGlobalSettingPlugins, setMockGlobalSetting } from "./page";

const MOCK_PLUGINS = [
  {
    id: "hello-world",
    name: "Hello World",
    version: "1.0.0",
    description: "示例插件：发布文章时自动补全摘要，并在日志中记录发布事件。",
    author: "ReactPress",
    source: "local" as const,
    installed: false,
    active: false,
    server: {
      module: "./server/index.js",
      hooks: { subscribe: ["article.beforePublish", "article.afterPublish"] },
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

  http.post("/api/extension/plugins/:id/install", async ({ params }) => {
    await withDelay(200);
    const state = getPluginStateFromGlobalSetting(getMockGlobalSetting());
    const id = String(params.id);
    const installedPlugins = state.installedPlugins.includes(id)
      ? state.installedPlugins
      : [...state.installedPlugins, id];
    const entries = { ...state.entries };
    entries[id] = {
      version: "1.0.0",
      source: "local",
      ...entries[id],
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
      ...(entries[id] ?? { version: "1.0.0", source: "local" }),
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
];

export { defaultSitePluginState };
