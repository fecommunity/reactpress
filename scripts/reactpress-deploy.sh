#!/bin/bash

# Exit on any error
set -e

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    exit 1
}

log "Starting deployment process..."

# Update code
log "Updating code from repository..."
git checkout master || error_exit "Failed to checkout master branch"
git pull || error_exit "Failed to pull latest changes"

# Install dependencies
log "Installing dependencies..."
pnpm install || error_exit "Failed to install dependencies"

# Build all packages using the unified build command
log "Building all packages..."
pnpm run build || error_exit "Failed to build packages"

# Kill existing PM2 processes
log "Stopping existing PM2 processes..."
pm2 kill || log "No existing PM2 processes found"

# Start services with PM2
log "Starting services with PM2..."
pnpm run pm2 || error_exit "Failed to start services with PM2"

# Set up PM2 startup script
log "Setting up PM2 startup script..."
pm2 startup || log "Failed to setup PM2 startup script"
pm2 save || error_exit "Failed to save PM2 configuration"

log "Deployment completed successfully!"