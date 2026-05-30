/**
 * ReactPress brand SVG sources + export manifest.
 * Layout numbers: keep in sync with `web/src/shared/brand/reactPressLogoPaths.ts`
 * and `scripts/brand-wordmark-layout.mjs`.
 */
import {
  REACT_PRESS_BRAND_FONT,
  REACT_PRESS_ICON_P,
  REACT_PRESS_WORDMARK_LAYOUT,
  REACT_PRESS_WORDMARK_VIEWBOX,
  wordmarkTextX,
} from "./brand-wordmark-layout.mjs";

export const BRAND_FILL = "#087ea4";

export const ICON_VIEWBOX = { width: 112, height: 102 };

/** Root `public/` layout (marketing files stay at `public/` root). */
export const ROOT_PUBLIC_DIRS = {
  brand: "public/brand",
  favicon: "public/favicon",
  icons: "public/icons",
};

const ORBITS = [
  "M56 75.165c29.455 0 53.333-10.745 53.333-24s-23.878-24-53.333-24-53.334 10.745-53.334 24 23.879 24 53.334 24Z",
  "M35.215 63.165c14.728 25.509 35.972 40.815 47.451 34.188 11.48-6.628 8.846-32.68-5.882-58.188-14.727-25.51-35.972-40.816-47.45-34.188-11.48 6.627-8.846 32.679 5.881 58.188Z",
  "M35.215 39.165c-14.727 25.509-17.36 51.56-5.882 58.188 11.48 6.627 32.724-8.68 47.451-34.188 14.728-25.51 17.362-51.56 5.883-58.188-11.48-6.628-32.724 8.679-47.452 34.188Z",
];

function orbitPaths(fill = BRAND_FILL) {
  return ORBITS.map(
    (d) =>
      `<path fill="none" stroke="${fill}" stroke-width="5.333" stroke-linecap="round" d="${d}"/>`,
  );
}

/** Icon-only SVG (112×102) — favicon source. */
export function buildIconSvg(fill = BRAND_FILL) {
  const paths = orbitPaths(fill).join("\n    ");
  const { fontSize, fontWeight, letterSpacing } = REACT_PRESS_ICON_P;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ICON_VIEWBOX.width} ${ICON_VIEWBOX.height}" fill="none" role="img" aria-label="ReactPress">
  <title>ReactPress</title>
  <g>${paths}</g>
  <text x="56" y="52" text-anchor="middle" dominant-baseline="central" fill="${fill}" font-family="${REACT_PRESS_BRAND_FONT}" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}">P</text>
</svg>`;
}

/** Horizontal wordmark SVG — logo.png source. */
export function buildWordmarkSvg(fill = BRAND_FILL) {
  const { padX, padY, iconScale, textY, textSize, textWeight, textLetterSpacing } =
    REACT_PRESS_WORDMARK_LAYOUT;
  const { width, height } = REACT_PRESS_WORDMARK_VIEWBOX;
  const paths = orbitPaths(fill).join("\n      ");
  const { fontSize, fontWeight, letterSpacing } = REACT_PRESS_ICON_P;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="ReactPress">
  <title>ReactPress</title>
  <g transform="translate(${padX} ${padY}) scale(${iconScale})">
    <g>${paths}</g>
    <text x="56" y="52" text-anchor="middle" dominant-baseline="central" fill="${fill}" font-family="${REACT_PRESS_BRAND_FONT}" font-size="${fontSize}" font-weight="${fontWeight}" letter-spacing="${letterSpacing}">P</text>
  </g>
  <text x="${wordmarkTextX}" y="${textY}" dominant-baseline="central" fill="${fill}" font-family="${REACT_PRESS_BRAND_FONT}" font-size="${textSize}" font-weight="${textWeight}" letter-spacing="${textLetterSpacing}">ReactPress</text>
</svg>`;
}

/** Flat runtime dirs (web / server / theme — unchanged deploy paths). */
const RUNTIME_PUBLIC_DIRS = [
  "web/public",
  "themes/twentytwentyfive/public",
  "cli/server/public",
  "server/public",
];

/** @type {readonly string[]} Legacy flat paths under `public/` (removed after export). */
export const ROOT_PUBLIC_LEGACY_BRAND_FILES = [
  "public/logo.svg",
  "public/logo.png",
  "public/logo-400.png",
  "public/logo-200.png",
  "public/favicon.ico",
  "public/favicon.png",
  "public/favicon-16.png",
  "public/favicon-32.png",
  "public/favicon-48.png",
  "public/apple-touch-icon.png",
  "public/icon-192.png",
  "public/icon-512.png",
];

export const BRAND_EXPORT_MANIFEST = {
  iconSvg: [
    "web/public/logo.svg",
    `${ROOT_PUBLIC_DIRS.brand}/logo.svg`,
    "docs/static/img/logo.svg",
    "themes/twentytwentyfive/public/logo.svg",
    "cli/server/public/logo.svg",
    "server/public/logo.svg",
  ],

  wordmarkSvg: "web/public/logo-wordmark.svg",

  wordmarkSvgCopies: [`${ROOT_PUBLIC_DIRS.brand}/wordmark.svg`],

  faviconPng: [
    { name: "favicon-16.png", width: 16 },
    { name: "favicon-32.png", width: 32 },
    { name: "favicon-48.png", width: 48 },
    { name: "favicon.png", width: 32 },
  ],

  pwaPng: [
    { name: "apple-touch-icon.png", width: 180 },
    { name: "icon-192.png", width: 192 },
    { name: "icon-512.png", width: 512 },
  ],

  runtimePublicDirs: RUNTIME_PUBLIC_DIRS,

  wordmarkPng: [
    { name: "logo.png", width: 800 },
    { name: "logo-400.png", width: 400 },
    { name: "logo-200.png", width: 200 },
  ],

  wordmarkRuntimeDirs: RUNTIME_PUBLIC_DIRS,

  wordmarkRootDir: ROOT_PUBLIC_DIRS.brand,

  faviconIcoSizes: [16, 32, 48],
  faviconIco: [
    "web/public/favicon.ico",
    `${ROOT_PUBLIC_DIRS.favicon}/favicon.ico`,
    "docs/static/img/favicon.ico",
    "themes/twentytwentyfive/public/favicon.ico",
    "cli/server/public/favicon.ico",
    "server/public/favicon.ico",
  ],
};
