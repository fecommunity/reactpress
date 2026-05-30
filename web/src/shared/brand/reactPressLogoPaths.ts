/** React atom orbit paths (112×102 viewBox). */
export const REACT_PRESS_ORBIT_PATHS = [
  "M56 75.165c29.455 0 53.333-10.745 53.333-24s-23.878-24-53.333-24-53.334 10.745-53.334 24 23.879 24 53.334 24Z",
  "M35.215 63.165c14.728 25.509 35.972 40.815 47.451 34.188 11.48-6.628 8.846-32.68-5.882-58.188-14.727-25.51-35.972-40.816-47.45-34.188-11.48 6.627-8.846 32.679 5.881 58.188Z",
  "M35.215 39.165c-14.727 25.509-17.36 51.56-5.882 58.188 11.48 6.627 32.724-8.68 47.451-34.188 14.728-25.51 17.362-51.56 5.883-58.188-11.48-6.628-32.724 8.679-47.452 34.188Z",
] as const;

export const REACT_PRESS_LOGO_VIEWBOX = "0 0 112 102";

/** Icon-only mark bounds (112×102). */
export const REACT_PRESS_ICON_VIEWBOX = { width: 112, height: 102 } as const;

/** Default brand fill for static SVG exports. */
export const REACT_PRESS_BRAND_COLOR = "#087ea4";

/** Center “P” typography (Press). */
export const REACT_PRESS_P_CENTER = { x: 56, y: 52 } as const;

/** Brand sans — icon “P” and wordmark “ReactPress” use the same family. */
export const REACT_PRESS_WORDMARK_FONT_FAMILY =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** @deprecated Alias of `REACT_PRESS_WORDMARK_FONT_FAMILY`. */
export const REACT_PRESS_P_FONT_FAMILY = REACT_PRESS_WORDMARK_FONT_FAMILY;

/** Icon “P” — matches wordmark weight; sized for 112×102 orbit. */
export const REACT_PRESS_P_FONT_SIZE = 33;

export const REACT_PRESS_P_FONT_WEIGHT = 600;

export const REACT_PRESS_P_LETTER_SPACING = "-0.03em";

/**
 * Static logo SVG (canonical). Keep in sync with `web/public/logo.svg`.
 */
export function buildReactPressLogoSvg(fill: string = REACT_PRESS_BRAND_COLOR): string {
  const orbits = REACT_PRESS_ORBIT_PATHS.map(
    (d) =>
      `<path fill="none" stroke="${fill}" stroke-width="5.333" stroke-linecap="round" d="${d}"/>`,
  ).join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${REACT_PRESS_LOGO_VIEWBOX}" fill="none" role="img" aria-label="ReactPress">
  <title>ReactPress</title>
  <g>
    ${orbits}
  </g>
  <text
    x="${REACT_PRESS_P_CENTER.x}"
    y="${REACT_PRESS_P_CENTER.y}"
    text-anchor="middle"
    dominant-baseline="central"
    fill="${fill}"
    font-family="${REACT_PRESS_P_FONT_FAMILY}"
    font-size="${REACT_PRESS_P_FONT_SIZE}"
    font-weight="${REACT_PRESS_P_FONT_WEIGHT}"
    letter-spacing="${REACT_PRESS_P_LETTER_SPACING}"
  >P</text>
</svg>
`;
}

/**
 * Wordmark layout — tuned for resvg export; keep horizontal padding symmetric.
 */
export const REACT_PRESS_WORDMARK_LAYOUT = {
  padX: 8,
  padY: 4,
  iconScale: 0.86,
  iconGap: 12,
  textY: 53.5,
  textSize: 35,
  textWeight: 600,
  textLetterSpacing: "-0.03em",
  /** “ReactPress” render width at textSize (resvg bbox). */
  textWidth: 176,
  /** Extra right inset so the last glyph is not clipped on export. */
  textPadEnd: 10,
} as const;

const wordmarkIconWidth = REACT_PRESS_ICON_VIEWBOX.width * REACT_PRESS_WORDMARK_LAYOUT.iconScale;

export const REACT_PRESS_WORDMARK_VIEWBOX = {
  width: Math.round(
    REACT_PRESS_WORDMARK_LAYOUT.padX * 2 +
      wordmarkIconWidth +
      REACT_PRESS_WORDMARK_LAYOUT.iconGap +
      REACT_PRESS_WORDMARK_LAYOUT.textWidth +
      REACT_PRESS_WORDMARK_LAYOUT.textPadEnd,
  ),
  height: 96,
} as const;

export const REACT_PRESS_WORDMARK_ASPECT =
  REACT_PRESS_WORDMARK_VIEWBOX.width / REACT_PRESS_WORDMARK_VIEWBOX.height;

const wordmarkTextX = Math.round(
  REACT_PRESS_WORDMARK_LAYOUT.padX + wordmarkIconWidth + REACT_PRESS_WORDMARK_LAYOUT.iconGap,
);

/** Horizontal wordmark: atom + P icon + “ReactPress”. */
export function buildReactPressWordmarkSvg(fill: string = REACT_PRESS_BRAND_COLOR): string {
  const { padX, padY, iconScale, textY, textSize, textWeight, textLetterSpacing } =
    REACT_PRESS_WORDMARK_LAYOUT;
  const wordmarkFont = REACT_PRESS_WORDMARK_FONT_FAMILY;
  const orbits = REACT_PRESS_ORBIT_PATHS.map(
    (d) =>
      `<path fill="none" stroke="${fill}" stroke-width="5.333" stroke-linecap="round" d="${d}"/>`,
  ).join("\n      ");
  const { width, height } = REACT_PRESS_WORDMARK_VIEWBOX;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="ReactPress">
  <title>ReactPress</title>
  <g transform="translate(${padX} ${padY}) scale(${iconScale})">
    <g>
      ${orbits}
    </g>
    <text
      x="${REACT_PRESS_P_CENTER.x}"
      y="${REACT_PRESS_P_CENTER.y}"
      text-anchor="middle"
      dominant-baseline="central"
      fill="${fill}"
      font-family="${REACT_PRESS_WORDMARK_FONT_FAMILY}"
      font-size="${REACT_PRESS_P_FONT_SIZE}"
      font-weight="${REACT_PRESS_P_FONT_WEIGHT}"
      letter-spacing="${REACT_PRESS_P_LETTER_SPACING}"
    >P</text>
  </g>
  <text
    x="${wordmarkTextX}"
    y="${textY}"
    dominant-baseline="central"
    fill="${fill}"
    font-family="${wordmarkFont}"
    font-size="${textSize}"
    font-weight="${textWeight}"
    letter-spacing="${textLetterSpacing}"
  >ReactPress</text>
</svg>
`;
}
