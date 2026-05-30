import type { ThemeMods } from "@fecommunity/reactpress-toolkit/theme";

type ThemeAppearanceLike = {
  appearance?: {
    sections?: Array<{ settings?: Array<{ id: string }> }>;
  };
};

/** Payload that clears all saved theme mods (API treats `""` as delete). */
export function buildClearThemeModsPayload(
  savedMods: ThemeMods,
  theme: ThemeAppearanceLike,
): ThemeMods {
  const keys = new Set(Object.keys(savedMods));
  for (const section of theme.appearance?.sections ?? []) {
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
