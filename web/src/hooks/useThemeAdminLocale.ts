import type { ThemeAdminLocaleMessages } from "@fecommunity/reactpress-toolkit/theme";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { fetchThemeAdminLocale } from "@/shared/api/themes";

export function adminUiLocaleFromLanguage(language: string): string {
  return language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function useThemeAdminLocaleQuery(themeId: string | undefined) {
  const { i18n } = useTranslation();
  const locale = adminUiLocaleFromLanguage(i18n.language);

  return useQuery({
    queryKey: ["theme-admin-locale", themeId, locale],
    queryFn: () => fetchThemeAdminLocale(themeId!, locale),
    enabled: Boolean(themeId),
    staleTime: 5 * 60 * 1000,
  });
}

export type { ThemeAdminLocaleMessages };
