import { usePlugins } from "@/hooks/usePlugins";

/** Whether a plugin is installed and active (hooks loaded on server). */
export function useIsPluginActive(pluginId: string): boolean {
  const { data: plugins } = usePlugins();
  const plugin = plugins?.find((item) => item.id === pluginId);
  return Boolean(plugin?.installed && plugin?.active);
}
