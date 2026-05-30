import type { ThemeMods } from "@fecommunity/reactpress-toolkit/extension";

type ThemeCustomizerLike = {
  customizer?: {
    sections?: Array<{ settings?: Array<{ id: string }> }>;
  };
};

/** Payload that clears all saved theme mods (API treats `""` as delete). */
export function buildClearThemeModsPayload(
  savedMods: ThemeMods,
  theme: ThemeCustomizerLike,
): ThemeMods {
  const keys = new Set(Object.keys(savedMods));
  for (const section of theme.customizer?.sections ?? []) {
    for (const setting of section.settings ?? []) {
      keys.add(setting.id);
    }
  }
  const payload: ThemeMods = {};
  for (const key of keys) {
    payload[key] = "";
  }
  return payload;
}
