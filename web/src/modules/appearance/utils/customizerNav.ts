import type {
  ThemeCustomizerGroup,
  ThemeCustomizerSection,
} from "@fecommunity/reactpress-toolkit/extension";

import type { ThemeListItem } from "@/shared/api/themes";

export type CustomizerNavGroup = {
  id: string;
  title: string;
  description?: string;
  sections: ThemeCustomizerSection[];
};

/** Build grouped sidebar nav from theme manifest (falls back to flat list). */
export function buildCustomizerNavGroups(theme: ThemeListItem): CustomizerNavGroup[] {
  const customizer = theme.customizer;
  const sections = (customizer?.sections ?? []) as ThemeCustomizerSection[];
  if (sections.length === 0) return [];

  const declared = (customizer?.groups ?? []) as ThemeCustomizerGroup[];
  const byGroup = new Map<string, ThemeCustomizerSection[]>();

  for (const section of sections) {
    const key = section.group ?? "";
    const list = byGroup.get(key) ?? [];
    list.push(section);
    byGroup.set(key, list);
  }

  if (declared.length > 0) {
    const ordered: CustomizerNavGroup[] = [];
    for (const group of declared) {
      const groupSections = byGroup.get(group.id) ?? [];
      if (groupSections.length > 0) {
        ordered.push({
          id: group.id,
          title: group.title,
          description: group.description,
          sections: groupSections,
        });
      }
      byGroup.delete(group.id);
    }
    for (const [, groupSections] of byGroup) {
      if (groupSections.length > 0) {
        ordered.push({
          id: "_other",
          title: "其他",
          sections: groupSections,
        });
      }
    }
    return ordered;
  }

  return [{ id: "_all", title: "", sections }];
}
