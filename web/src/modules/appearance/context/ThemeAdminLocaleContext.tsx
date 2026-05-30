import type { ThemeAdminLocaleMessages } from "@fecommunity/reactpress-toolkit/extension";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { useThemeAdminLocaleQuery } from "@/hooks/useThemeAdminLocale";
import { resolveThemeAdminLocaleText } from "@/modules/appearance/utils/resolveAppearanceManifestText";

type ThemeAdminLocaleContextValue = {
  themeId: string;
  locale: string;
  messages: ThemeAdminLocaleMessages;
  loading: boolean;
  text: (path: string, fallback?: string) => string;
};

const ThemeAdminLocaleContext = createContext<ThemeAdminLocaleContextValue | null>(null);

export function ThemeAdminLocaleProvider({
  themeId,
  children,
}: {
  themeId: string;
  children: ReactNode;
}) {
  const { data, isLoading } = useThemeAdminLocaleQuery(themeId);
  const messages = data?.messages ?? {};
  const locale = data?.locale ?? "en";

  const text = useCallback(
    (path: string, fallback?: string) => resolveThemeAdminLocaleText(messages, path, fallback),
    [messages],
  );

  const value = useMemo(
    () => ({ themeId, locale, messages, loading: isLoading, text }),
    [themeId, locale, messages, isLoading, text],
  );

  return (
    <ThemeAdminLocaleContext.Provider value={value}>{children}</ThemeAdminLocaleContext.Provider>
  );
}

export function useThemeAdminLocaleText(): ThemeAdminLocaleContextValue {
  const ctx = useContext(ThemeAdminLocaleContext);
  if (!ctx) {
    throw new Error("useThemeAdminLocaleText must be used within ThemeAdminLocaleProvider");
  }
  return ctx;
}

export function useThemeAdminLocaleTextOptional(): ThemeAdminLocaleContextValue | null {
  return useContext(ThemeAdminLocaleContext);
}
