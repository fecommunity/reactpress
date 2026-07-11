import type { PluginAdminLocaleMessages } from "@fecommunity/reactpress-toolkit/plugin/extension";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { fetchPluginAdminLocale } from "@/shared/api/plugins";

export function adminUiLocaleFromLanguage(language: string): string {
  return language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function usePluginAdminLocaleQuery(pluginId: string | undefined) {
  const { i18n } = useTranslation();
  const locale = adminUiLocaleFromLanguage(i18n.language);

  return useQuery({
    queryKey: ["plugin-admin-locale", pluginId, locale],
    queryFn: () => fetchPluginAdminLocale(pluginId!, locale),
    enabled: Boolean(pluginId),
    staleTime: 5 * 60 * 1000,
  });
}

export type { PluginAdminLocaleMessages };
