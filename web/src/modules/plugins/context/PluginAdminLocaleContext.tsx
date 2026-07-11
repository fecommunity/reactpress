import type { PluginAdminLocaleMessages } from "@fecommunity/reactpress-toolkit/plugin/extension";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { adminUiLocaleFromLanguage, usePluginAdminLocaleQuery } from "@/hooks/usePluginAdminLocale";
import { resolvePluginAdminLocaleText } from "@/hooks/usePluginListItemMeta";

type PluginAdminLocaleContextValue = {
  pluginId: string;
  locale: string;
  messages: PluginAdminLocaleMessages;
  loading: boolean;
  text: (path: string, fallback?: string) => string;
};

const PluginAdminLocaleContext = createContext<PluginAdminLocaleContextValue | null>(null);

export function PluginAdminLocaleProvider({
  pluginId,
  children,
}: {
  pluginId: string;
  children: ReactNode;
}) {
  const { i18n } = useTranslation();
  const locale = adminUiLocaleFromLanguage(i18n.language);
  const { data, isLoading } = usePluginAdminLocaleQuery(pluginId);
  const messages = (data?.messages ?? {}) as PluginAdminLocaleMessages;

  const text = useMemo(
    () => (path: string, fallback?: string) =>
      resolvePluginAdminLocaleText(messages, path, fallback),
    [messages],
  );

  const value = useMemo(
    () => ({ pluginId, locale, messages, loading: isLoading, text }),
    [pluginId, locale, messages, isLoading, text],
  );

  return (
    <PluginAdminLocaleContext.Provider value={value}>{children}</PluginAdminLocaleContext.Provider>
  );
}

export function usePluginAdminLocaleText(): PluginAdminLocaleContextValue {
  const ctx = useContext(PluginAdminLocaleContext);
  if (!ctx) {
    throw new Error("usePluginAdminLocaleText must be used within PluginAdminLocaleProvider");
  }
  return ctx;
}

export function usePluginAdminLocaleTextOptional(): PluginAdminLocaleContextValue | null {
  return useContext(PluginAdminLocaleContext);
}
