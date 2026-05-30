import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { MenuItem } from "@/api/schemas";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuthStore } from "@/stores/auth";
import { normalizeAppPath } from "@/utils/appMenu";
import { APP_BRAND_NAME } from "@/utils/constants";

function walkMenus(
  menus: MenuItem[],
  pathname: string,
  best: { path: string; id: string } | null,
): { path: string; id: string } | null {
  let match = best;
  for (const menu of menus) {
    if (menu.path) {
      const path = menu.path;
      if (pathname === path || pathname.startsWith(`${path}/`)) {
        if (!match || path.length > match.path.length) {
          match = { path, id: menu.id };
        }
      }
    }
    if (menu.children?.length) {
      match = walkMenus(menu.children, pathname, match);
    }
  }
  return match;
}

/** Routes that are not exact menu paths but need a dedicated tab title. */
function resolveExtraTitleKey(pathname: string): string | null {
  if (pathname === "/login") return "login.title";
  if (pathname === "/403") return "error.403Title";
  if (/^\/article\/editor\/.+/.test(pathname)) return "article.editArticle";
  if (pathname === "/article/editor") return "article.writeArticle";
  if (/^\/page\/editor\/.+/.test(pathname)) return "page.editTitle";
  if (pathname === "/page/editor") return "placeholder.newPage";
  if (pathname.startsWith("/appearance/themes/preview")) return "appearance.preview";
  if (pathname.startsWith("/appearance/customize")) return "menu.appearance.customize";
  if (pathname.startsWith("/appearance/themes")) return "menu.appearance.themes";
  return null;
}

function resolvePluginSettingsParams(pathname: string): Record<string, string> | undefined {
  const match = /^\/plugins\/([^/]+)\/settings/.exec(pathname);
  return match?.[1] ? { id: match[1] } : undefined;
}

export function resolveDocumentTitleKey(pathname: string, menus: MenuItem[]): string | null {
  const path = normalizeAppPath(pathname);
  const extra = resolveExtraTitleKey(path);
  if (extra) return extra;

  const menuMatch = walkMenus(menus, path, null);
  if (menuMatch) return `menu.${menuMatch.id}`;

  return null;
}

export function useDocumentTitle(titleKey?: string | null, titleParams?: Record<string, string>) {
  const { t } = useTranslation();
  const location = useLocation();
  const menus = useAuthStore((s) => s.menus);
  const { data: siteSettings } = useSiteSettings();

  const siteName =
    (typeof siteSettings?.systemTitle === "string" && siteSettings.systemTitle.trim()) ||
    APP_BRAND_NAME;

  const pathname = normalizeAppPath(location.pathname);
  const resolvedKey =
    titleKey !== undefined ? titleKey : resolveDocumentTitleKey(location.pathname, menus);
  const pluginParams = resolvePluginSettingsParams(pathname);
  const mergedParams = titleParams ?? pluginParams;
  const effectiveKey = pluginParams && !titleKey ? "placeholder.pluginSettings" : resolvedKey;

  const pageTitle = effectiveKey ? t(effectiveKey, { ...mergedParams, defaultValue: "" }) : "";

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — ${siteName}` : siteName;
  }, [pageTitle, siteName]);
}
