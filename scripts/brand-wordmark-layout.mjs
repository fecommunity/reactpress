/**
 * Wordmark layout — keep in sync with `web/src/shared/brand/reactPressLogoPaths.ts`.
 * Used by `export-brand-assets.mjs` (no TS runtime).
 */

/** Brand sans — icon “P” and “ReactPress” wordmark. */
export const REACT_PRESS_BRAND_FONT =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const REACT_PRESS_WORDMARK_FONT = REACT_PRESS_BRAND_FONT;
export const REACT_PRESS_P_FONT = REACT_PRESS_BRAND_FONT;

export const REACT_PRESS_ICON_P = {
  fontSize: 33,
  fontWeight: 600,
  letterSpacing: "-0.03em",
};

export const REACT_PRESS_WORDMARK_LAYOUT = {
  padX: 8,
  padY: 4,
  iconScale: 0.86,
  iconGap: 12,
  textY: 53.5,
  textSize: 35,
  textWeight: 600,
  textLetterSpacing: "-0.03em",
  textWidth: 180,
  textPadEnd: 14,
};

const ICON_W = 112;

const wordmarkIconWidth = ICON_W * REACT_PRESS_WORDMARK_LAYOUT.iconScale;

export const REACT_PRESS_WORDMARK_VIEWBOX = {
  width: Math.round(
    REACT_PRESS_WORDMARK_LAYOUT.padX * 2 +
      wordmarkIconWidth +
      REACT_PRESS_WORDMARK_LAYOUT.iconGap +
      REACT_PRESS_WORDMARK_LAYOUT.textWidth +
      REACT_PRESS_WORDMARK_LAYOUT.textPadEnd,
  ),
  height: 96,
};

export const wordmarkTextX = Math.round(
  REACT_PRESS_WORDMARK_LAYOUT.padX +
    wordmarkIconWidth +
    REACT_PRESS_WORDMARK_LAYOUT.iconGap,
);
