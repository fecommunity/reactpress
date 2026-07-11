#!/bin/bash
# Build active theme on a powerful machine (CI / laptop), pack .next for upload to 2GB VPS.
# Usage (from repo root):
#   sh scripts/package-theme-build.sh
#   scp dist/theme-build-*.tar.gz user@server:/path/to/reactpress/
# On server:
#   sh scripts/apply-theme-build.sh dist/theme-build-*.tar.gz
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ACTIVE="$(node -e "
  const { readActiveThemeManifest, resolveThemeDirectory } = require('./cli/out/lib/theme-runtime');
  const { activeTheme } = readActiveThemeManifest(process.cwd());
  const dir = resolveThemeDirectory(process.cwd(), activeTheme);
  if (!dir) process.exit(1);
  console.log(activeTheme + '|' + dir);
")" || { echo "Cannot resolve active theme"; exit 1; }

THEME_ID="${ACTIVE%%|*}"
THEME_DIR="${ACTIVE#*|}"
STAMP=".next/.reactpress-theme-id"

if [ ! -d "$THEME_DIR/.next" ]; then
  echo "Building theme $THEME_ID under $THEME_DIR ..."
  REACTPRESS_BUILD_ACTIVE=1 pnpm run --dir "$THEME_DIR" build
fi

mkdir -p "$(dirname "$THEME_DIR/$STAMP")"
printf '%s' "$THEME_ID" > "$THEME_DIR/$STAMP"

OUT="dist/theme-build-${THEME_ID}-$(date +%Y%m%d%H%M%S).tar.gz"
mkdir -p dist
tar -czf "$OUT" -C "$THEME_DIR" .next
echo "Packed: $OUT ($(du -h "$OUT" | cut -f1))"
echo "Upload to server and run: sh scripts/apply-theme-build.sh $OUT"
