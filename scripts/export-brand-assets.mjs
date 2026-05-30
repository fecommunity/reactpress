#!/usr/bin/env node
/**
 * Regenerate logo.svg / logo-wordmark.svg / logo.png from brand source.
 * Run: node scripts/export-brand-assets.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  REACT_PRESS_BRAND_FONT,
  REACT_PRESS_ICON_P,
  REACT_PRESS_WORDMARK_LAYOUT,
  REACT_PRESS_WORDMARK_VIEWBOX,
  wordmarkTextX,
} from "./brand-wordmark-layout.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ORBITS = [
  "M56 75.165c29.455 0 53.333-10.745 53.333-24s-23.878-24-53.333-24-53.334 10.745-53.334 24 23.879 24 53.334 24Z",
  "M35.215 63.165c14.728 25.509 35.972 40.815 47.451 34.188 11.48-6.628 8.846-32.68-5.882-58.188-14.727-25.51-35.972-40.816-47.45-34.188-11.48 6.627-8.846 32.679 5.881 58.188Z",
  "M35.215 39.165c-14.727 25.509-17.36 51.56-5.882 58.188 11.48 6.627 32.724-8.68 47.451-34.188 14.728-25.51 17.362-51.56 5.883-58.188-11.48-6.628-32.724 8.679-47.452 34.188Z",
];
const FILL = "#087ea4";

function iconSvg() {
  const orbits = ORBITS.map(
    (d) =>
      `<path fill="none" stroke="${FILL}" stroke-width="5.333" stroke-linecap="round" d="${d}"/>`,
  ).join("\n    ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 102" fill="none" role="img" aria-label="ReactPress">
  <title>ReactPress</title>
  <g>${orbits}</g>
  <text x="56" y="52" text-anchor="middle" dominant-baseline="central" fill="${FILL}" font-family="${REACT_PRESS_BRAND_FONT}" font-size="${REACT_PRESS_ICON_P.fontSize}" font-weight="${REACT_PRESS_ICON_P.fontWeight}" letter-spacing="${REACT_PRESS_ICON_P.letterSpacing}">P</text>
</svg>`;
}

function wordmarkSvg() {
  const { padX, padY, iconScale, textY, textSize, textWeight, textLetterSpacing } =
    REACT_PRESS_WORDMARK_LAYOUT;
  const { width, height } = REACT_PRESS_WORDMARK_VIEWBOX;
  const orbits = ORBITS.map(
    (d) =>
      `<path fill="none" stroke="${FILL}" stroke-width="5.333" stroke-linecap="round" d="${d}"/>`,
  ).join("\n      ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-label="ReactPress">
  <title>ReactPress</title>
  <g transform="translate(${padX} ${padY}) scale(${iconScale})">
    <g>${orbits}</g>
    <text x="56" y="52" text-anchor="middle" dominant-baseline="central" fill="${FILL}" font-family="${REACT_PRESS_BRAND_FONT}" font-size="${REACT_PRESS_ICON_P.fontSize}" font-weight="${REACT_PRESS_ICON_P.fontWeight}" letter-spacing="${REACT_PRESS_ICON_P.letterSpacing}">P</text>
  </g>
  <text x="${wordmarkTextX}" y="${textY}" dominant-baseline="central" fill="${FILL}" font-family="${REACT_PRESS_BRAND_FONT}" font-size="${textSize}" font-weight="${textWeight}" letter-spacing="${textLetterSpacing}">ReactPress</text>
</svg>`;
}

const icon = iconSvg();
const wordmark = wordmarkSvg();

const svgTargets = [
  "web/public/logo.svg",
  "docs/static/img/logo.svg",
  "themes/twentytwentyfive/public/logo.svg",
  "cli/server/public/logo.svg",
  "server/public/logo.svg",
];

for (const rel of svgTargets) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, icon);
}

const wordmarkSvgPath = path.join(root, "web/public/logo-wordmark.svg");
fs.writeFileSync(wordmarkSvgPath, wordmark);

/** Wordmark PNG — site header (`logo.png`), symmetric viewBox, fit-width 800. */
const pngTargets = [
  "public/logo.png",
  "themes/twentytwentyfive/public/logo.png",
  "web/public/logo.png",
];

const tmpSvg = path.join(root, "web/public/.logo-wordmark-export.svg");
fs.writeFileSync(tmpSvg, wordmark);

for (const rel of pngTargets) {
  const dest = path.join(root, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  execSync(
    `npx --yes @resvg/resvg-js-cli "${tmpSvg}" "${dest}" --fit-width 800`,
    { stdio: "inherit", cwd: root },
  );
}

fs.unlinkSync(tmpSvg);

console.log(
  `Wordmark viewBox: ${REACT_PRESS_WORDMARK_VIEWBOX.width}×${REACT_PRESS_WORDMARK_VIEWBOX.height}`,
);
console.log("Exported:", [...svgTargets, wordmarkSvgPath, ...pngTargets].join("\n  "));
