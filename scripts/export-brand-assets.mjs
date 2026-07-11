#!/usr/bin/env node
/**
 * Export ReactPress brand assets (SVG, PNG, ICO) from canonical SVG sources.
 *
 *   pnpm export:brand
 *
 * Root `public/` layout: `brand/`, `favicon/`, `icons/` (see `public/README.md`).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  BRAND_EXPORT_MANIFEST,
  ROOT_PUBLIC_DIRS,
  ROOT_PUBLIC_LEGACY_BRAND_FILES,
  buildIconSvg,
  buildSquareIconSvg,
  buildWordmarkSvg,
} from "./brand-assets.mjs";
import { REACT_PRESS_WORDMARK_VIEWBOX } from "./brand-wordmark-layout.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmpDir = path.join(root, ".brand-export");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeText(relPath, content) {
  const dest = path.join(root, relPath);
  ensureDir(dest);
  fs.writeFileSync(dest, content);
}

function resvgPng(svgPath, pngPath, width) {
  ensureDir(pngPath);
  execSync(
    `npx --yes @resvg/resvg-js-cli "${svgPath}" "${pngPath}" --fit-width ${width}`,
    { stdio: "pipe", cwd: root },
  );
}

function copyToDirs(tmpFile, dirs, name) {
  const written = [];
  for (const dir of dirs) {
    const dest = path.join(root, dir, name);
    ensureDir(dest);
    fs.copyFileSync(tmpFile, dest);
    written.push(`${dir}/${name}`);
  }
  return written;
}

function mirrorPngGroup(svgPath, items, dirs, label) {
  const written = [];
  for (const { name, width } of items) {
    const tmpPng = path.join(tmpDir, name);
    resvgPng(svgPath, tmpPng, width);
    for (const rel of copyToDirs(tmpPng, dirs, name)) {
      written.push(`${rel} (${width}px, ${label})`);
    }
  }
  return written;
}

function removeLegacyRootPublicBrand() {
  for (const rel of ROOT_PUBLIC_LEGACY_BRAND_FILES) {
    const dest = path.join(root, rel);
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
    }
  }
}

async function writeFaviconIco() {
  const { faviconIcoSizes, faviconIco } = BRAND_EXPORT_MANIFEST;
  const pngPaths = faviconIcoSizes.map((size) =>
    path.join(tmpDir, `favicon-${size}.png`),
  );

  let toIco;
  try {
    ({ default: toIco } = await import("to-ico"));
  } catch {
    console.warn(
      "Skip favicon.ico: install devDependency `to-ico` (pnpm add -D to-ico).",
    );
    return [];
  }

  const buf = await toIco(pngPaths.map((p) => fs.readFileSync(p)));
  const written = [];
  for (const rel of faviconIco) {
    const dest = path.join(root, rel);
    ensureDir(dest);
    fs.writeFileSync(dest, buf);
    written.push(rel);
  }
  return written;
}

function cleanup() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

async function main() {
  fs.mkdirSync(tmpDir, { recursive: true });

  const iconSvg = buildIconSvg();
  const wordmarkSvg = buildWordmarkSvg();
  const {
    runtimePublicDirs,
    wordmarkRuntimeDirs,
    wordmarkRootDir,
    faviconPng,
    pwaPng,
  } = BRAND_EXPORT_MANIFEST;

  const faviconDirs = [...runtimePublicDirs, ROOT_PUBLIC_DIRS.favicon];
  const pwaDirs = [...runtimePublicDirs, ROOT_PUBLIC_DIRS.icons];

  for (const rel of BRAND_EXPORT_MANIFEST.iconSvg) {
    writeText(rel, iconSvg);
  }
  writeText(BRAND_EXPORT_MANIFEST.wordmarkSvg, wordmarkSvg);
  for (const rel of BRAND_EXPORT_MANIFEST.wordmarkSvgCopies) {
    writeText(rel, wordmarkSvg);
  }

  const iconSvgTmp = path.join(tmpDir, "icon.svg");
  const wordmarkSvgTmp = path.join(tmpDir, "wordmark.svg");
  fs.writeFileSync(iconSvgTmp, iconSvg);
  fs.writeFileSync(wordmarkSvgTmp, wordmarkSvg);

  console.log("SVG");
  console.log("  icon:", BRAND_EXPORT_MANIFEST.iconSvg.join("\n        "));
  console.log("  wordmark:", BRAND_EXPORT_MANIFEST.wordmarkSvg);
  console.log(
    "  copies:",
    BRAND_EXPORT_MANIFEST.wordmarkSvgCopies.join(", "),
  );
  console.log(
    `  viewBox: icon 112×102, wordmark ${REACT_PRESS_WORDMARK_VIEWBOX.width}×${REACT_PRESS_WORDMARK_VIEWBOX.height}`,
  );

  console.log("\nPNG → public/favicon + runtime");
  for (const line of mirrorPngGroup(iconSvgTmp, faviconPng, faviconDirs, "favicon")) {
    console.log(`  ${line}`);
  }

  console.log("\nPNG → public/icons + runtime");
  for (const line of mirrorPngGroup(iconSvgTmp, pwaPng, pwaDirs, "pwa")) {
    console.log(`  ${line}`);
  }

  console.log("\nPNG → public/brand + runtime (wordmark)");
  for (const line of mirrorPngGroup(
    wordmarkSvgTmp,
    BRAND_EXPORT_MANIFEST.wordmarkPng,
    [...wordmarkRuntimeDirs, wordmarkRootDir],
    "wordmark",
  )) {
    console.log(`  ${line}`);
  }

  console.log("\nICO");
  for (const rel of await writeFaviconIco()) {
    console.log(`  ${rel}`);
  }

  const { desktopAppIcon } = BRAND_EXPORT_MANIFEST;
  if (desktopAppIcon) {
    const squareSvg = buildSquareIconSvg(desktopAppIcon.size);
    const squareSvgTmp = path.join(tmpDir, "icon-square.svg");
    fs.writeFileSync(squareSvgTmp, squareSvg);
    const dest = path.join(root, desktopAppIcon.path);
    resvgPng(squareSvgTmp, dest, desktopAppIcon.size);
    console.log(`\nPNG → desktop (${desktopAppIcon.size}px square)`);
    console.log(`  ${desktopAppIcon.path}`);
  }

  removeLegacyRootPublicBrand();
  console.log("\nRemoved legacy flat brand files under public/ (root).");

  cleanup();
  console.log("\nDone. Root layout:", Object.values(ROOT_PUBLIC_DIRS).join(", "));
}

main().catch((err) => {
  cleanup();
  console.error(err);
  process.exit(1);
});
