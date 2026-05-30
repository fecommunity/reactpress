import type {
  ThemeConfigurationPropertySchema,
  ThemeConfigurationSchema,
} from "@fecommunity/reactpress-toolkit/extension";

import {
  themeFieldAnchorId,
  themeSectionAnchorId,
} from "@/modules/appearance/utils/themeSettingsAnchors";

export type ThemeSettingsIndexEntry = {
  id: string;
  sectionKey: string;
  fieldKey?: string;
  level: 1 | 2;
  title: string;
  sectionTitle: string;
  description?: string;
  /** Lowercase tokens for search */
  keywords: string[];
  href: string;
};

function collectKeywords(
  sectionKey: string,
  fieldKey: string | undefined,
  field?: ThemeConfigurationPropertySchema,
): string[] {
  const tokens = new Set<string>();
  const push = (v: unknown) => {
    if (typeof v === "string" && v.trim()) tokens.add(v.trim().toLowerCase());
  };

  push(sectionKey);
  push(fieldKey);
  push(field?.title);
  push(field?.description);

  if (field?.properties) {
    for (const [k, child] of Object.entries(field.properties)) {
      push(k);
      push(child.title);
      push(child.description);
    }
  }

  if (field?.items && typeof field.items === "object" && !Array.isArray(field.items)) {
    const items = field.items as ThemeConfigurationPropertySchema;
    if (items.properties) {
      for (const [k, child] of Object.entries(items.properties)) {
        push(k);
        push(child.title);
        push(child.description);
      }
    }
  }

  const ui = field?.["x-ui"] as { widget?: string } | undefined;
  push(ui?.widget);

  return [...tokens];
}

/** Flat index of all sections and fields for search / sidebar. */
export function buildThemeSettingsIndex(
  schema: ThemeConfigurationSchema | null | undefined,
): ThemeSettingsIndexEntry[] {
  if (!schema?.properties) return [];

  const entries: ThemeSettingsIndexEntry[] = [];

  for (const [sectionKey, section] of Object.entries(schema.properties)) {
    if (section.type !== "object") continue;

    const sectionTitle = typeof section.title === "string" ? section.title : sectionKey;
    const sectionId = themeSectionAnchorId(sectionKey);

    entries.push({
      id: sectionId,
      sectionKey,
      level: 1,
      title: sectionTitle,
      sectionTitle,
      description: typeof section.description === "string" ? section.description : undefined,
      keywords: collectKeywords(sectionKey, undefined, section),
      href: `#${sectionId}`,
    });

    const fields = section.properties;
    if (!fields) continue;

    for (const [fieldKey, field] of Object.entries(fields)) {
      const fieldTitle = typeof field.title === "string" ? field.title : fieldKey;
      const fieldId = themeFieldAnchorId(sectionKey, fieldKey);

      entries.push({
        id: fieldId,
        sectionKey,
        fieldKey,
        level: 2,
        title: fieldTitle,
        sectionTitle,
        description: typeof field.description === "string" ? field.description : undefined,
        keywords: collectKeywords(sectionKey, fieldKey, field),
        href: `#${fieldId}`,
      });
    }
  }

  return entries;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function entryMatches(entry: ThemeSettingsIndexEntry, q: string): boolean {
  if (!q) return true;
  if (entry.title.toLowerCase().includes(q)) return true;
  if (entry.sectionTitle.toLowerCase().includes(q)) return true;
  if (entry.description?.toLowerCase().includes(q)) return true;
  return entry.keywords.some((k) => k.includes(q));
}

export function filterThemeSettingsIndex(
  entries: ThemeSettingsIndexEntry[],
  query: string,
): ThemeSettingsIndexEntry[] {
  const q = normalizeQuery(query);
  if (!q) return entries;
  return entries.filter((e) => entryMatches(e, q));
}

/** Visible DOM ids when search is active (sections included if any child matches). */
export function getVisibleSettingIds(
  entries: ThemeSettingsIndexEntry[],
  query: string,
): Set<string> {
  const q = normalizeQuery(query);
  if (!q) return new Set(entries.map((e) => e.id));

  const matched = new Set(entries.filter((e) => entryMatches(e, q)).map((e) => e.id));

  for (const entry of entries) {
    if (entry.level !== 2 || !matched.has(entry.id)) continue;
    matched.add(themeSectionAnchorId(entry.sectionKey));
  }

  return matched;
}

export function scrollToThemeAnchor(href: string, scrollContainer: HTMLElement | null): void {
  const id = href.startsWith("#") ? href.slice(1) : href;
  const target = document.getElementById(id);
  if (!target) return;

  if (scrollContainer) {
    const containerTop = scrollContainer.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const nextTop = scrollContainer.scrollTop + (targetTop - containerTop) - 12;
    scrollContainer.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
