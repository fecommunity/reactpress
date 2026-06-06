import {
  buildBrandingAppearanceCss,
  type ThemeMods,
} from '@fecommunity/reactpress-toolkit/theme/server';

function modValue(mods: ThemeMods, key: string): string | undefined {
  const raw = mods?.[key];
  if (typeof raw === 'string') return raw;
  if (raw && typeof raw === 'object' && 'value' in raw) {
    return typeof raw.value === 'string' ? raw.value : undefined;
  }
  return undefined;
}

function normalizeHex(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return undefined;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

/** Maps Customizer color mods to Tailwind v4 primary scale overrides. */
export function buildMyBlogAppearanceCss(mods: ThemeMods): string {
  const base = buildBrandingAppearanceCss(mods);
  const lightPrimary = normalizeHex(modValue(mods, 'primaryColor'));
  const darkPrimary = normalizeHex(modValue(mods, 'darkPrimaryColor'));
  const lightBg = normalizeHex(modValue(mods, 'backgroundColor'));
  const darkBg = normalizeHex(modValue(mods, 'darkBackgroundColor'));

  const blocks: string[] = [base];

  if (lightPrimary) {
    blocks.push(
      `body:not(.dark) { --primary-color: ${lightPrimary}; --primary-button-bg: ${lightPrimary}; --color-primary-500: ${lightPrimary}; --color-primary-600: ${lightPrimary}; }`,
    );
  }
  if (darkPrimary) {
    blocks.push(
      `body.dark { --primary-color: ${darkPrimary}; --primary-button-bg: ${darkPrimary}; --color-primary-500: ${darkPrimary}; --color-primary-400: ${darkPrimary}; }`,
    );
  }
  if (lightBg) {
    blocks.push(`body:not(.dark) { background-color: ${lightBg}; }`);
  }
  if (darkBg) {
    blocks.push(`body.dark { background-color: ${darkBg}; }`);
  }

  return blocks.filter(Boolean).join('\n');
}
