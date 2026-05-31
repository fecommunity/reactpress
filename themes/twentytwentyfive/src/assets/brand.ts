/**
 * ReactPress brand assets for twentytwentyfive.
 *
 * | Asset | Path | Use |
 * |-------|------|-----|
 * | Wordmark PNG | `/logo.png` | Site header, article list placeholder |
 * | Icon SVG / ICO / PNG | `logo.svg`, `favicon.ico`, `favicon-*.png` | Favicon、PWA |
 *
 * Regenerate from repo root: `node scripts/export-brand-assets.mjs`
 * Source viewBox for wordmark: see `scripts/brand-wordmark-layout.mjs` (sync with reactPressLogoPaths.ts).
 */

/** Horizontal wordmark (`logo-wordmark.svg` → `logo.png`, export width 800px). */
export const REACT_PRESS_WORDMARK_VIEWBOX = { width: 318, height: 96 } as const;

export const REACT_PRESS_WORDMARK_ASPECT =
  REACT_PRESS_WORDMARK_VIEWBOX.width / REACT_PRESS_WORDMARK_VIEWBOX.height;

/** Icon-only mark (`logo.svg`, viewBox 112×102). */
export const REACT_PRESS_ICON_VIEWBOX = { width: 112, height: 102 } as const;

export const REACT_PRESS_ICON_ASPECT =
  REACT_PRESS_ICON_VIEWBOX.width / REACT_PRESS_ICON_VIEWBOX.height;

/** Theme header bar height (px) — keep in sync with Header `index.module.scss` `$height`. */
export const REACT_PRESS_HEADER_BAR_HEIGHT = 64;

/** Vertical inset inside the header bar (px) — sync with `$header-logo-padding-y`. */
export const REACT_PRESS_HEADER_LOGO_PADDING_Y = 8;

const headerLogoContentHeight =
  REACT_PRESS_HEADER_BAR_HEIGHT - 2 * REACT_PRESS_HEADER_LOGO_PADDING_Y;

/** Header: horizontal wordmark PNG — fits bar height minus vertical padding. */
export const REACT_PRESS_HEADER_LOGO = {
  src: '/logo-200.png',
  displayHeight: headerLogoContentHeight,
  maxDisplayWidth: Math.round(headerLogoContentHeight * REACT_PRESS_WORDMARK_ASPECT),
} as const;

/** Header layout spacing (theme CSS only — not part of PNG). */
export const REACT_PRESS_HEADER_SPACING = {
  /** Gap between wordmark and primary nav (px). */
  logoNavGap: 12,
  /** Horizontal padding on nav items after the first (px). */
  navItemPaddingX: 16,
  /** First nav item padding toward logo (px). */
  navItemFirstPaddingStart: 4,
} as const;

/** Article list cover placeholder + OG fallback (same wordmark PNG). */
export const REACT_PRESS_LIST_PLACEHOLDER = {
  src: '/logo.png',
  /** Fits inside cover area 200×114px. */
  displayHeight: 48,
  maxDisplayWidth: Math.round(48 * REACT_PRESS_WORDMARK_ASPECT),
  maxDisplayHeight: 48,
} as const;

/** Favicon / icon-only SVG. */
export const REACT_PRESS_ICON_LOGO = {
  src: '/logo.svg',
} as const;

export function wordmarkWidthAtHeight(height: number): number {
  return Math.round(height * REACT_PRESS_WORDMARK_ASPECT);
}

export function iconWidthAtHeight(height: number): number {
  return Math.round(height * REACT_PRESS_ICON_ASPECT);
}
