import {
  resolveThemeAdminLocaleTags,
  resolveThemeAdminLocaleText,
} from "@fecommunity/reactpress-toolkit/theme";
import { useMemo } from "react";

import { useThemeAdminLocaleQuery } from "@/hooks/useThemeAdminLocale";
import type { ThemeListItem } from "@/shared/api/themes";

export function useThemeListItemMeta(theme: ThemeListItem | undefined) {
  const { data } = useThemeAdminLocaleQuery(theme?.id);
  const messages = data?.messages;

  return useMemo(() => {
    if (!theme) {
      return { description: undefined, tags: [] as string[] };
    }
    return {
      description: resolveThemeAdminLocaleText(messages, "meta.description", theme.description),
      tags: resolveThemeAdminLocaleTags(messages, theme.tags),
    };
  }, [messages, theme]);
}
