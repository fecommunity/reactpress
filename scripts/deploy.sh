#!/bin/bash

# ReactPress production deploy (monorepo: server + client on host with PM2)
set -e

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error_exit() {
  log "ERROR: $1"
  exit 1
}

# Persist deploy ports/URLs into .env so PM2 + dotenv pick them up on restart
set_env_kv() {
  local key="$1"
  local value="$2"
  local file=".env"
  if [ ! -f "$file" ]; then
    echo "$key=$value" >>"$file"
    return
  fi
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    if sed --version 2>/dev/null | grep -q GNU; then
      sed -i "s|^${key}=.*|${key}=${value}|" "$file"
    else
      sed -i '' "s|^${key}=.*|${key}=${value}|" "$file"
    fi
  else
    echo "$key=$value" >>"$file"
  fi
}

log "Starting deployment..."

if [ ! -f "package.json" ]; then
  error_exit "Run this script from the repository root"
fi

log "Installing dependencies..."
pnpm install || error_exit "pnpm install failed"

NGINX_ENTRY_URL="${NGINX_ENTRY_URL:-http://localhost}"
# PM2 binds internal ports; nginx owns public :3000/:3001/:3002 and redirects to :80
REACTPRESS_VISITOR_INTERNAL_PORT="${REACTPRESS_VISITOR_INTERNAL_PORT:-13001}"
REACTPRESS_API_INTERNAL_PORT="${REACTPRESS_API_INTERNAL_PORT:-13002}"
export NGINX_ENTRY_URL
export REACTPRESS_NGINX_ENTRY_URL="${REACTPRESS_NGINX_ENTRY_URL:-$NGINX_ENTRY_URL}"
export NEXT_PUBLIC_REACTPRESS_ADMIN_URL="${NEXT_PUBLIC_REACTPRESS_ADMIN_URL:-${NGINX_ENTRY_URL%/}/admin}"
export CLIENT_PORT="$REACTPRESS_VISITOR_INTERNAL_PORT"
export SERVER_PORT="$REACTPRESS_API_INTERNAL_PORT"
export PORT="$CLIENT_PORT"
export CLIENT_SITE_URL="${CLIENT_SITE_URL:-$NGINX_ENTRY_URL}"
export SERVER_SITE_URL="${SERVER_SITE_URL:-$NGINX_ENTRY_URL}"
export REACTPRESS_API_URL="${REACTPRESS_API_URL:-http://127.0.0.1:${REACTPRESS_API_INTERNAL_PORT}/api}"
export NEXT_PUBLIC_REACTPRESS_API_URL="${NEXT_PUBLIC_REACTPRESS_API_URL:-${NGINX_ENTRY_URL%/}/api}"

set_env_kv "CLIENT_PORT" "$REACTPRESS_VISITOR_INTERNAL_PORT"
set_env_kv "SERVER_PORT" "$REACTPRESS_API_INTERNAL_PORT"
set_env_kv "CLIENT_SITE_URL" "$CLIENT_SITE_URL"
set_env_kv "SERVER_SITE_URL" "$SERVER_SITE_URL"

log "Building toolkit, server, web (admin static /admin/), and client..."
log "  Entry: $NGINX_ENTRY_URL (PM2 :$CLIENT_PORT visitor, :$SERVER_PORT API)"
pnpm run build || error_exit "pnpm build failed"

if [ ! -f "web/dist/index.html" ]; then
  error_exit "web/dist/index.html missing — run pnpm build:web (needs web/.env.production with VITE_ADMIN_BASE=/admin/)"
fi

log "Syncing PM2 daemon (clears in-memory vs local version mismatch)..."
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
  # Start nginx before PM2 so :13001/:13002 stay free on the host (compose maps :3001/:3002 → redirect only)
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

log "Deployment completed."
if docker info >/dev/null 2>&1; then
  log "  Site:   $NGINX_ENTRY_URL/"
  log "  Admin:  ${NGINX_ENTRY_URL%/}/admin/"
  log "  API:    ${NGINX_ENTRY_URL%/}/api"
  log "  (legacy :3000 / :3001 / :3002 redirect to the URLs above)"
else
  log "  WARN: start Docker and re-run deploy so nginx can expose the unified entry"
fi
log "  Status: pnpm run status"

exit 0
