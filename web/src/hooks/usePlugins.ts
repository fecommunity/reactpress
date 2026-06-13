import type { SitePluginState } from "@fecommunity/reactpress-toolkit/plugin/extension";
import { mergePluginStateIntoGlobalSetting } from "@fecommunity/reactpress-toolkit/plugin/extension";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SiteSettings } from "@/hooks/useSiteSettings";
import {
  activatePlugin,
  deactivatePlugin,
  fetchPlugins,
  installPlugin,
  type PluginListItem,
  uninstallPlugin,
} from "@/shared/api/plugins";

const PLUGINS_KEY = ["plugins"];
const SETTINGS_KEY = ["site-settings"];

function patchSiteSettingsPlugins(
  queryClient: ReturnType<typeof useQueryClient>,
  state: SitePluginState,
) {
  queryClient.setQueryData<SiteSettings>(SETTINGS_KEY, (prev) => {
    if (!prev) return prev;
    try {
      const raw = prev.globalSetting;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
      const merged = mergePluginStateIntoGlobalSetting(parsed, state);
      const globalSetting = typeof raw === "string" ? JSON.stringify(merged) : merged;
      return { ...prev, globalSetting };
    } catch {
      return prev;
    }
  });
}

export function usePlugins() {
  return useQuery({
    queryKey: PLUGINS_KEY,
    queryFn: fetchPlugins,
    staleTime: 30_000,
  });
}

export function usePluginMutations() {
  const queryClient = useQueryClient();

  const patchPluginsFromState = (state: SitePluginState) => {
    queryClient.setQueryData<PluginListItem[]>(PLUGINS_KEY, (old) => {
      if (!old) return old;
      const activeSet = new Set(state.activePlugins);
      const installedSet = new Set(state.installedPlugins);
      return old.map((plugin) => ({
        ...plugin,
        installed: installedSet.has(plugin.id),
        active: activeSet.has(plugin.id),
      }));
    });
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: PLUGINS_KEY });
    void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
  };

  const onPluginStateChange = (state: SitePluginState) => {
    patchPluginsFromState(state);
    patchSiteSettingsPlugins(queryClient, state);
    invalidate();
  };

  const installMutation = useMutation({
    mutationFn: (id: string) => installPlugin(id),
    onSuccess: onPluginStateChange,
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activatePlugin(id),
    onSuccess: onPluginStateChange,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivatePlugin(id),
    onSuccess: onPluginStateChange,
  });

  const uninstallMutation = useMutation({
    mutationFn: (id: string) => uninstallPlugin(id),
    onSuccess: onPluginStateChange,
  });

  return { installMutation, activateMutation, deactivateMutation, uninstallMutation };
}

export type { PluginListItem };
