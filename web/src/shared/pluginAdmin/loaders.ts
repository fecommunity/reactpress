import type { PluginAdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";
import { pluginManifestHasAdminUI } from "@fecommunity/reactpress-toolkit/plugin/extension";

import type { PluginListItem } from "@/shared/api/plugins";

/**
 * Vite 需静态 glob 才能打包插件 admin 入口；勿用模板字符串 dynamic import。
 * 约定：`plugins/{id}/admin/index.ts`
 */
const pluginAdminModules = import.meta.glob<PluginAdminModule>(
  "../../../../plugins/*/admin/index.ts",
);

function resolveAdminModuleKey(pluginId: string): string | undefined {
  const suffix = `/plugins/${pluginId}/admin/index.ts`;
  return Object.keys(pluginAdminModules).find((key) => key.replace(/\\/g, "/").endsWith(suffix));
}

/** Load plugin admin module from conventional path `plugins/{id}/admin/index.ts`. */
export function loadPluginAdminModule(pluginId: string): Promise<PluginAdminModule> {
  const key = resolveAdminModuleKey(pluginId);
  const load = key ? pluginAdminModules[key] : undefined;
  if (!load) {
    return Promise.reject(new Error(`Plugin admin module not found for "${pluginId}"`));
  }
  return load();
}

export function pluginShouldLoadAdminUI(plugin: Pick<PluginListItem, "admin">): boolean {
  return pluginManifestHasAdminUI(plugin.admin);
}

export function pluginHasBundledAdminModule(pluginId: string): boolean {
  return resolveAdminModuleKey(pluginId) != null;
}
