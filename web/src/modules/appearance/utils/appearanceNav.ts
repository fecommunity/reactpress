import type {
  ThemeAppearancePanel,
  ThemeAppearanceSection,
} from "@fecommunity/reactpress-toolkit/extension";

import type { ThemeListItem } from "@/shared/api/themes";

export type AppearanceNavGroup = {
  id: string;
  title: string;
  description?: string;
  sections: ThemeAppearanceSection[];
};

/** Build grouped sidebar nav from theme manifest (falls back to flat list). */
export function buildAppearanceNavGroups(
  theme: ThemeListItem,
  otherPanelTitle = "Other",
): AppearanceNavGroup[] {
  const appearance = theme.appearance;
  const sections = (appearance?.sections ?? []) as ThemeAppearanceSection[];
  if (sections.length === 0) return [];

  const declared = (appearance?.panels ?? []) as ThemeAppearancePanel[];
  const byPanel = new Map<string, ThemeAppearanceSection[]>();

  for (const section of sections) {
    const key = section.panel ?? "";
    const list = byPanel.get(key) ?? [];
    list.push(section);
    byPanel.set(key, list);
  }

  if (declared.length > 0) {
    const ordered: AppearanceNavGroup[] = [];
    for (const panel of declared) {
      const panelSections = byPanel.get(panel.id) ?? [];
      if (panelSections.length > 0) {
        ordered.push({
          id: panel.id,
          title: panel.title,
          description: panel.description,
          sections: panelSections,
        });
      }
      byPanel.delete(panel.id);
    }
    for (const [, panelSections] of byPanel) {
      if (panelSections.length > 0) {
        ordered.push({
          id: "_other",
          title: otherPanelTitle,
          sections: panelSections,
        });
      }
    }
    return ordered;
  }

  return [{ id: "_all", title: "", sections }];
}
