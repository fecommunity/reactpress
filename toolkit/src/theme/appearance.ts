import type { ThemeManifest } from '../extension/theme';
import type { ThemeMods } from '../extension/theme';

/** Build default theme_mod values from `theme.json` → `appearance.sections`. */
export function defaultModsFromManifest(manifest: ThemeManifest | null | undefined): ThemeMods {
  const mods: ThemeMods = {};
  const sections = manifest?.appearance?.sections ?? [];
  for (const section of sections) {
    for (const setting of section.settings ?? []) {
      if (setting.id && setting.default != null) {
        mods[setting.id] = String(setting.default);
      }
    }
  }
  return mods;
}
