export type SiteI18nMessages = {
  zh: Record<string, unknown>;
  en: Record<string, unknown>;
};

/** Parse `setting.i18n` JSON: `{ zh: { home: "首页", ... }, en: { ... } }`. */
export function parseSiteI18n(raw: unknown): SiteI18nMessages {
  if (raw == null || raw === "") {
    return { zh: {}, en: {} };
  }
  try {
    const parsed: Record<string, unknown> =
      typeof raw === "string"
        ? (JSON.parse(raw) as Record<string, unknown>)
        : (raw as Record<string, unknown>);
    if (!parsed || typeof parsed !== "object") {
      return { zh: {}, en: {} };
    }
    const zh = parsed["zh"];
    const en = parsed["en"];
    return {
      zh: zh && typeof zh === "object" && !Array.isArray(zh) ? (zh as Record<string, unknown>) : {},
      en: en && typeof en === "object" && !Array.isArray(en) ? (en as Record<string, unknown>) : {},
    };
  } catch {
    return { zh: {}, en: {} };
  }
}

export function lookupI18nString(
  messages: Record<string, unknown>,
  key: string | undefined,
): string | undefined {
  if (!key?.trim()) return undefined;
  const value = messages[key.trim()];
  return typeof value === "string" ? value : undefined;
}
