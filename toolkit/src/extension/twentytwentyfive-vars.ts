import { brandingModValue, type ThemeMods } from './branding-mods';

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHexColor(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!HEX_COLOR.test(trimmed)) return undefined;
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

function hexToRgbChannels(hex: string): string | null {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return null;
  const raw = normalized.slice(1);
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return `${r}, ${g}, ${b}`;
}

type ColorModKeys = {
  primary: string;
  background: string;
  secondaryBackground: string;
  link: string;
};

const LIGHT_COLOR_KEYS: ColorModKeys = {
  primary: 'primaryColor',
  background: 'backgroundColor',
  secondaryBackground: 'secondaryBackgroundColor',
  link: 'linkColor',
};

const DARK_COLOR_KEYS: ColorModKeys = {
  primary: 'darkPrimaryColor',
  background: 'darkBackgroundColor',
  secondaryBackground: 'darkSecondaryBackgroundColor',
  link: 'darkLinkColor',
};

function buildModeColorDeclarations(mods: ThemeMods, keys: ColorModKeys): string[] {
  const primary = normalizeHexColor(brandingModValue(mods, keys.primary));
  const background = normalizeHexColor(brandingModValue(mods, keys.background));
  const secondaryBg = normalizeHexColor(brandingModValue(mods, keys.secondaryBackground));
  const link = normalizeHexColor(brandingModValue(mods, keys.link));

  const declarations: string[] = [];
  if (primary) declarations.push(`--primary-color: ${primary};`);
  if (background) {
    declarations.push(`--bg: ${background};`);
    declarations.push(`--bg-body: ${background};`);
  }
  if (secondaryBg) {
    declarations.push(`--bg-second: ${secondaryBg};`);
    declarations.push(`--bg-box: ${secondaryBg};`);
    const rgb = hexToRgbChannels(secondaryBg);
    if (rgb) declarations.push(`--rgb-bg-second: ${rgb};`);
  } else if (background) {
    declarations.push(`--bg-box: ${background};`);
  }
  if (link) declarations.push(`--link-color: ${link};`);

  return declarations;
}

export function appearanceBackgroundColor(mods: ThemeMods, fallback?: string): string | undefined {
  const v = brandingModValue(mods, LIGHT_COLOR_KEYS.background);
  return normalizeHexColor(v) ?? (fallback ? normalizeHexColor(fallback) : undefined);
}

export function appearanceSecondaryBackgroundColor(mods: ThemeMods): string | undefined {
  return normalizeHexColor(brandingModValue(mods, LIGHT_COLOR_KEYS.secondaryBackground));
}

export function appearanceLinkColor(mods: ThemeMods): string | undefined {
  return normalizeHexColor(brandingModValue(mods, LIGHT_COLOR_KEYS.link));
}

export function appearancePrimaryColorForMode(
  mods: ThemeMods,
  dark: boolean,
  fallback = '#f44336',
): string {
  const keys = dark ? DARK_COLOR_KEYS : LIGHT_COLOR_KEYS;
  return (
    normalizeHexColor(brandingModValue(mods, keys.primary)) ??
    normalizeHexColor(brandingModValue(mods, LIGHT_COLOR_KEYS.primary)) ??
    fallback
  );
}

/** Maps Twenty Twenty-Five appearance color mods to theme CSS variables. */
export function buildTwentyTwentyFiveAppearanceCss(mods: ThemeMods): string {
  const lightDecl = buildModeColorDeclarations(mods, LIGHT_COLOR_KEYS);
  const darkDecl = buildModeColorDeclarations(mods, DARK_COLOR_KEYS);
  const blocks: string[] = [];
  if (lightDecl.length > 0) {
    blocks.push(`body:not(.dark) { ${lightDecl.join(' ')} }`);
  }
  if (darkDecl.length > 0) {
    blocks.push(`body.dark { ${darkDecl.join(' ')} }`);
  }
  return blocks.join('\n');
}
