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

log "Starting deployment..."

if [ ! -f "package.json" ]; then
  error_exit "Run this script from the repository root"
fi

log "Installing dependencies..."
pnpm install || error_exit "pnpm install failed"

log "Building toolkit, server, and client..."
pnpm run build || error_exit "pnpm build failed"

log "Stopping existing ReactPress PM2 apps (if any)..."
pm2 delete reactpress-server 2>/dev/null || true
pm2 delete @fecommunity/reactpress-server 2>/dev/null || true
pm2 delete @fecommunity/reactpress-client 2>/dev/null || true
pm2 delete reactpress-client 2>/dev/null || true

log "Starting API and client with PM2..."
pnpm run pm2 || error_exit "Failed to start PM2 processes"

log "Saving PM2 process list..."
pm2 save || log "WARN: pm2 save failed (run pm2 startup manually if needed)"

log "Deployment completed."
log "  Client: http://localhost:3001"
log "  API:    http://localhost:3002"
log "  Status: pnpm run status"

exit 0
