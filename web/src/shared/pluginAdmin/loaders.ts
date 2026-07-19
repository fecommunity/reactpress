import type { PluginAdminModule } from "@fecommunity/reactpress-toolkit/plugin/admin";
import { pluginManifestHasAdminUI } from "@fecommunity/reactpress-toolkit/plugin/extension";

import type { PluginListItem } from "@/shared/api/plugins";

// Vite needs a static glob to bundle plugin admin entries (no dynamic template import).
const pluginAdminModules = import.meta.glob<PluginAdminModule>(
  "../../../../plugins/*/src/admin/index.ts",
);

function resolveAdminModuleLoader(
  pluginId: string,
): (() => Promise<PluginAdminModule>) | undefined {
  const needle = "/plugins/" + pluginId + "/src/admin/index.ts";
  const key = Object.keys(pluginAdminModules).find((candidate) =>
    candidate.replace(/\\/g, "/").endsWith(needle),
  );
  return key ? pluginAdminModules[key] : undefined;
}

/** Load plugin admin module from plugins/{pluginId}/src/admin/index.ts. */
export function loadPluginAdminModule(pluginId: string): Promise<PluginAdminModule> {
  const load = resolveAdminModuleLoader(pluginId);
  if (!load) {
    return Promise.reject(new Error('Plugin admin module not found for "' + pluginId + '"'));
  }
  return load();
}

export function pluginShouldLoadAdminUI(plugin: Pick<PluginListItem, "admin">): boolean {
  return pluginManifestHasAdminUI(plugin.admin);
}

export function pluginHasBundledAdminModule(pluginId: string): boolean {
  return resolveAdminModuleLoader(pluginId) != null;
}
