import type { ThemeConfigurationSchema } from "@fecommunity/reactpress-toolkit/theme";

export type ThemeSettingsAnchor = {
  key: string;
  href: string;
  title: string;
  level: 1 | 2;
};

export function themeSectionAnchorId(sectionKey: string): string {
  return `theme-section-${sectionKey}`;
}

export function themeFieldAnchorId(sectionKey: string, fieldKey: string): string {
  return `theme-field-${sectionKey}-${fieldKey}`;
}

/** Build anchor tree from theme configuration JSON Schema (section + field titles). */
export function extractThemeSettingsAnchors(
  schema: ThemeConfigurationSchema | null | undefined,
): ThemeSettingsAnchor[] {
  if (!schema?.properties) return [];

  const items: ThemeSettingsAnchor[] = [];

  for (const [sectionKey, section] of Object.entries(schema.properties)) {
    if (section.type !== "object") continue;
    const sectionTitle = typeof section.title === "string" ? section.title : sectionKey;
    items.push({
      key: sectionKey,
      href: `#${themeSectionAnchorId(sectionKey)}`,
      title: sectionTitle,
      level: 1,
    });

    const fields = section.properties;
    if (!fields) continue;

    for (const [fieldKey, field] of Object.entries(fields)) {
      const fieldTitle = typeof field.title === "string" ? field.title : fieldKey;
      items.push({
        key: `${sectionKey}.${fieldKey}`,
        href: `#${themeFieldAnchorId(sectionKey, fieldKey)}`,
        title: fieldTitle,
        level: 2,
      });
    }
  }

  return items;
}

/** Ant Design Anchor `items` tree (level-2 as children of level-1). */
export function toAnchorMenuItems(anchors: ThemeSettingsAnchor[]) {
  const roots: Array<{
    key: string;
    href: string;
    title: string;
    children?: Array<{ key: string; href: string; title: string }>;
  }> = [];

  let current: (typeof roots)[number] | undefined;

  for (const anchor of anchors) {
    if (anchor.level === 1) {
      current = { key: anchor.key, href: anchor.href, title: anchor.title, children: [] };
      roots.push(current);
      continue;
    }
    if (current) {
      current.children = current.children ?? [];
      current.children.push({
        key: anchor.key,
        href: anchor.href,
        title: anchor.title,
      });
    }
  }

  return roots.map((r) => {
    if (!r.children?.length) {
      const { children: _c, ...rest } = r;
      return rest;
    }
    return r;
  });
}
