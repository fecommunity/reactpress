#!/bin/bash
# Production deploy: apply release (optional) → install → verify → nginx → PM2.
# Does not run build — use `pnpm run build` on CI/local first.
#
# Usage (must use `pnpm run deploy`, not `pnpm deploy`):
#   pnpm run deploy
#   pnpm run deploy -- dist/reactpress-release-*.tar.gz
#
set -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
  log "ERROR: $1"
  exit 1
}

RELEASE=""
for arg in "$@"; do
  case "$arg" in
    --release=*) RELEASE="${arg#*=}" ;;
    *.tar.gz) RELEASE="$arg" ;;
  esac
done

log "Starting production deploy..."

if [ ! -f "package.json" ]; then
  error_exit "Run this script from the repository root"
fi

if [ -n "$RELEASE" ]; then
  log "Applying release package: $RELEASE"
  sh scripts/apply-release.sh "$RELEASE"
fi

log "Installing dependencies..."
pnpm install || error_exit "pnpm install failed"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

NGINX_ENTRY_URL="${NGINX_ENTRY_URL:-http://localhost}"
CLIENT_PORT="${CLIENT_PORT:-3001}"
SERVER_PORT="${SERVER_PORT:-3002}"
export NGINX_ENTRY_URL
export REACTPRESS_NGINX_ENTRY_URL="${REACTPRESS_NGINX_ENTRY_URL:-$NGINX_ENTRY_URL}"
export NEXT_PUBLIC_REACTPRESS_ADMIN_URL="${NEXT_PUBLIC_REACTPRESS_ADMIN_URL:-${NGINX_ENTRY_URL%/}/admin}"
export CLIENT_PORT
export SERVER_PORT
export PORT="$CLIENT_PORT"
export CLIENT_SITE_URL="${CLIENT_SITE_URL:-http://localhost:${CLIENT_PORT}}"
export SERVER_SITE_URL="${SERVER_SITE_URL:-http://localhost:${SERVER_PORT}}"
export REACTPRESS_API_URL="${REACTPRESS_API_URL:-http://127.0.0.1:${SERVER_PORT}/api}"
export NEXT_PUBLIC_REACTPRESS_API_URL="${NEXT_PUBLIC_REACTPRESS_API_URL:-${NGINX_ENTRY_URL%/}/api}"

log "Verifying production artifacts..."
node scripts/verify-build-artifacts.mjs || error_exit "Artifacts missing — run pnpm run build on CI/local first"

log "Syncing PM2 daemon..."
pm2 update 2>/dev/null || true

log "Stopping existing ReactPress PM2 apps (if any)..."
pm2 delete reactpress-server 2>/dev/null || true
pm2 delete @fecommunity/reactpress-server 2>/dev/null || true
pm2 delete @fecommunity/reactpress-client 2>/dev/null || true
pm2 delete reactpress-client 2>/dev/null || true
pm2 delete @fecommunity/reactpress-template-twentytwentyfive 2>/dev/null || true
pm2 delete @fecommunity/reactpress-template-hello-world 2>/dev/null || true

log "Starting nginx reverse proxy (production)..."
if docker info >/dev/null 2>&1; then
  node ./cli/bin/reactpress.js nginx restart --prod || error_exit "Failed to start nginx"
else
  log "WARN: Docker not running — nginx redirect ports unavailable"
fi

log "Starting API and client with PM2 (internal ports :$CLIENT_PORT / :$SERVER_PORT)..."
REACTPRESS_API_URL="$REACTPRESS_API_URL" \
  NEXT_PUBLIC_REACTPRESS_API_URL="$NEXT_PUBLIC_REACTPRESS_API_URL" \
  NGINX_ENTRY_URL="$NGINX_ENTRY_URL" \
  REACTPRESS_NGINX_ENTRY_URL="$REACTPRESS_NGINX_ENTRY_URL" \
  CLIENT_PORT="$CLIENT_PORT" SERVER_PORT="$SERVER_PORT" PORT="$PORT" \
  pnpm run pm2 || error_exit "Failed to start PM2 processes"

log "Saving PM2 process list..."
pm2 save || log "WARN: pm2 save failed (run pm2 startup manually if needed)"

log "Deploy completed."
if docker info >/dev/null 2>&1; then
  log "  Site:   $NGINX_ENTRY_URL/"
  log "  Admin:  ${NGINX_ENTRY_URL%/}/admin/"
  log "  API:    ${NGINX_ENTRY_URL%/}/api"
else
  log "  WARN: start Docker and re-run deploy so nginx can expose the unified entry"
fi

wait_for_http() {
  local url="$1"
  local i=0
  while [ "$i" -lt 15 ]; do
    if curl -sf -o /dev/null --max-time 3 "$url"; then
      return 0
    fi
    i=$((i + 1))
    sleep 1
  done
  return 1
}

if wait_for_http "http://127.0.0.1:${CLIENT_PORT}/"; then
  log "  Health: visitor site OK (http://127.0.0.1:${CLIENT_PORT}/)"
else
  log "  WARN: visitor site not responding on :${CLIENT_PORT} — check: pm2 logs reactpress-client"
fi
if wait_for_http "http://127.0.0.1:${SERVER_PORT}/api/health"; then
  log "  Health: API OK (http://127.0.0.1:${SERVER_PORT}/api/health)"
else
  log "  WARN: API not responding on :${SERVER_PORT} — check DB and: pm2 logs reactpress-server"
fi
log "  Status: pnpm run status"

exit 0
