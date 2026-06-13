import type { ThemeListItem } from "@/shared/api/themes";

const OFFICIAL_NPM_THEME_IDS = new Set(["reactpress-theme-starter"]);

function hasOfficialTag(tags?: string[]): boolean {
  return (tags ?? []).some((tag) => /^(official|官方)$/i.test(tag.trim()));
}

function hasOfficialNpmRef(theme: ThemeListItem): boolean {
  const needle = "reactpress-theme-starter";
  return (
    OFFICIAL_NPM_THEME_IDS.has(theme.id) ||
    theme.npm?.spec?.includes(needle) === true ||
    theme.npm?.packageName?.includes(needle) === true ||
    theme.catalog?.npm?.includes(needle) === true
  );
}

/** Whether a theme is shipped or recommended by ReactPress. */
export function isOfficialTheme(theme: ThemeListItem): boolean {
  if (theme.official === true) return true;
  if (theme.official === false) return false;
  if (theme.source === "local") return true;
  if (hasOfficialNpmRef(theme)) return true;
  if (theme.catalog?.featured) return true;
  return hasOfficialTag(theme.tags);
}
