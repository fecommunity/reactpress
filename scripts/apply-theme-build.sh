#!/bin/bash
# Apply a theme .next tarball produced by scripts/package-theme-build.sh
set -e

ARCHIVE="${1:?Usage: sh scripts/apply-theme-build.sh dist/theme-build-*.tar.gz}"
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

echo "Applying build to theme $THEME_ID ($THEME_DIR) from $ARCHIVE"
rm -rf "$THEME_DIR/.next"
tar -xzf "$ARCHIVE" -C "$THEME_DIR"
printf '%s' "$THEME_ID" > "$THEME_DIR/.next/.reactpress-theme-id"
echo "Done. Restart visitor: node ./cli/bin/reactpress.js client restart --pm2"
