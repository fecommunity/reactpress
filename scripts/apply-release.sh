#!/bin/bash
# Apply a release tarball from scripts/build.sh
set -e

ARCHIVE="${1:?Usage: sh scripts/apply-release.sh dist/reactpress-release-*.tar.gz}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f "$ARCHIVE" ]; then
  echo "Archive not found: $ARCHIVE" >&2
  exit 1
fi

echo "[reactpress] Applying release from $ARCHIVE"

ACTIVE="$(node -e "
  const { readActiveThemeManifest, resolveThemeDirectory } = require('./cli/out/lib/theme-runtime');
  const { activeTheme } = readActiveThemeManifest(process.cwd());
  const dir = resolveThemeDirectory(process.cwd(), activeTheme);
  if (!dir) process.exit(1);
  console.log(activeTheme + '|' + dir);
")" || { echo "Cannot resolve active theme"; exit 1; }

THEME_ID="${ACTIVE%%|*}"
THEME_DIR="${ACTIVE#*|}"

tar -xzf "$ARCHIVE" -C "$ROOT"

STAMP="$THEME_DIR/.next/.reactpress-theme-id"
if [ ! -f "$STAMP" ] || [ "$(cat "$STAMP" | tr -d '\n')" != "$THEME_ID" ]; then
  mkdir -p "$THEME_DIR/.next"
  printf '%s' "$THEME_ID" > "$STAMP"
fi

node scripts/verify-build-artifacts.mjs
echo "[reactpress] Release applied. Run: pnpm run deploy"
