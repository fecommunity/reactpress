import {
  resolvePluginAdminLocaleText,
  type PluginAdminLocaleMessages,
} from "@fecommunity/reactpress-toolkit/plugin/extension";
import { useMemo } from "react";

import { usePluginAdminLocaleQuery } from "@/hooks/usePluginAdminLocale";
import type { PluginListItem } from "@/shared/api/plugins";

export function usePluginListItemMeta(plugin: PluginListItem | undefined) {
  const { data } = usePluginAdminLocaleQuery(plugin?.id);
  const messages = data?.messages;

  return useMemo(() => {
    if (!plugin) {
      return { name: undefined, description: undefined };
    }
    return {
      name: resolvePluginAdminLocaleText(messages, "meta.name", plugin.name),
      description: resolvePluginAdminLocaleText(messages, "meta.description", plugin.description),
    };
  }, [messages, plugin]);
}

export { resolvePluginAdminLocaleText };
export type { PluginAdminLocaleMessages };
