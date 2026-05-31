#!/bin/bash
# Build production artifacts (CI / local). Output: dist/ + optional release tarball.
#
# Usage:
#   sh scripts/build.sh           # build + verify + pack dist/reactpress-release-*.tar.gz
#   sh scripts/build.sh --no-pack # build + verify only (artifacts in tree)
#
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PACK=1
for arg in "$@"; do
  case "$arg" in
    --no-pack) PACK=0 ;;
  esac
done

log() { echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"; }

log "Building production artifacts (toolkit, server, web, active theme)..."
node ./cli/bin/reactpress.js build

log "Ensuring active theme build stamp..."
node -e "
  const { buildActiveTheme } = require('./cli/lib/theme-prod');
  buildActiveTheme(process.cwd());
"

log "Verifying artifacts..."
node scripts/verify-build-artifacts.mjs

if [ "$PACK" = "0" ]; then
  log "Build complete (artifacts in server/dist, web/dist, toolkit/dist, theme .next)."
  exit 0
fi

VERSION="$(node -p "require('./package.json').version")"
STAMP="$(date +%Y%m%d%H%M%S)"
OUT="dist/reactpress-release-${VERSION}-${STAMP}.tar.gz"
mkdir -p dist

ACTIVE="$(node -e "
  const { readActiveThemeManifest, resolveThemeDirectory } = require('./cli/lib/theme-runtime');
  const { activeTheme } = readActiveThemeManifest(process.cwd());
  const dir = resolveThemeDirectory(process.cwd(), activeTheme);
  if (!dir) process.exit(1);
  console.log(dir);
")"

THEME_REL="$(node -e "
  const path = require('path');
  console.log(path.relative('$ROOT', '$ACTIVE'));
")"

log "Packing → $OUT"
tar -czf "$OUT" -C "$ROOT" \
  server/dist \
  web/dist \
  toolkit/dist \
  "$THEME_REL/.next"

log "Build complete: $OUT ($(du -h "$OUT" | cut -f1))"
log "Deploy on server: pnpm run deploy -- $OUT"
