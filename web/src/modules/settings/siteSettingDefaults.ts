function resolveDefaultAdminSystemUrl(): string {
  if (typeof window === "undefined") {
    return "http://localhost/admin/";
  }
  const base = import.meta.env.BASE_URL || "/admin/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  if (normalized === "/") {
    return `${window.location.origin}/admin/`;
  }
  const path = normalized.startsWith("/")
    ? normalized.replace(/\/$/, "")
    : `/${normalized.replace(/\/$/, "")}`;
  return `${window.location.origin}${path}/`;
}

/** 常规 / SEO 表单占位默认值（数据库为空时用于预填与 placeholder）。 */
export const SITE_SETTING_FIELD_DEFAULTS: Record<string, string> = {
  systemTitle: "ReactPress",
  systemSubTitle: "基于 React 的博客与内容发布平台",
  systemUrl:
    (typeof import.meta !== "undefined" &&
      (import.meta as ImportMeta & { env?: { VITE_CLIENT_SITE_URL?: string } }).env
        ?.VITE_CLIENT_SITE_URL) ||
    "http://localhost:3001",
  adminSystemUrl: resolveDefaultAdminSystemUrl(),
  systemLogo: "/logo.png",
  systemFavicon: "/favicon.png",
  systemNoticeInfo: "[]",
  seoKeyword: "React,博客,CMS,ReactPress",
  seoDesc: "使用 ReactPress 搭建的博客与内容站点。",
  baiduAnalyticsId: "",
  googleAnalyticsId: "",
};

export function mergeSiteSettingFormValues(
  data: Record<string, unknown> | undefined,
  fieldNames: string[],
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const name of fieldNames) {
    const raw = data?.[name];
    const stored = raw != null ? String(raw).trim() : "";
    const fallback = SITE_SETTING_FIELD_DEFAULTS[name] ?? "";
    values[name] = stored || fallback;
  }
  return values;
}

export function siteSettingPlaceholder(name: string): string | undefined {
  const d = SITE_SETTING_FIELD_DEFAULTS[name];
  return d?.trim() ? d : undefined;
}
