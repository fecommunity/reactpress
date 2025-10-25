#!/bin/bash

# ReactPress One-Command Installation Script
# This script clones the repository and deploys the complete ReactPress application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[ReactPress]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[ReactPress] Warning:${NC} $1"
}

error() {
    echo -e "${RED}[ReactPress] Error:${NC} $1"
    exit 1
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        error "Git is not installed. Please install Git first."
    fi
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first: https://docs.docker.com/get-docker/"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose: https://docs.docker.com/compose/install/"
    fi
    
    log "All dependencies found!"
}

# Clone ReactPress repository
clone_repository() {
    local install_dir=${1:-"reactpress-$(date +%Y%m%d%H%M)"}
    
    log "Cloning ReactPress repository to $install_dir..."
    
    # Check if directory already exists
    if [ -d "$install_dir" ]; then
        error "Directory $install_dir already exists. Please specify a different directory name or remove the existing one."
    fi
    
    # Clone repository
    if git clone https://github.com/fecommunity/reactpress.git --depth=1 "$install_dir"; then
        log "Repository cloned successfully!"
        cd "$install_dir"
    else
        error "Failed to clone repository. Please check your internet connection and try again."
    fi
}

# Deploy full ReactPress application
deploy_full_application() {
    log "Deploying full ReactPress application..."
    
    # Copy nginx.conf if it exists
    if [ -f "./nginx.conf" ]; then
        log "Found nginx.conf"
    else
        warn "nginx.conf not found, will use default configuration"
    fi
    
    # Start services with production configuration
    log "Starting all services..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to start
    log "Waiting for services to start (this may take a minute)..."
    sleep 30
    
    # Check service status
    log "Checking service status..."
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "✅ ReactPress deployed successfully!"
        log "📝 Access your application at: http://localhost:8080"
        log "📋 To view logs: docker-compose -f docker-compose.prod.yml logs -f"
        log "🔧 To stop services: docker-compose -f docker-compose.prod.yml down"
    else
        error "Failed to start one or more services. Check logs for details:"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
}

# Show help
show_help() {
    echo "ReactPress One-Command Installation Script"
    echo ""
    echo "Usage:"
    echo "  ./install.sh [directory]"
    echo ""
    echo "Arguments:"
    echo "  directory    Installation directory (default: reactpress-YYYYMMDDHHMM)"
    echo ""
    echo "This script will:"
    echo "  1. Check for required dependencies (Git, Docker, Docker Compose)"
    echo "  2. Clone the ReactPress repository to a timestamped directory"
    echo "  3. Deploy complete ReactPress application with all services"
    echo ""
    echo "Services deployed:"
    echo "  - MySQL 5.7 database"
    echo "  - NestJS server (API) service"
    echo "  - Next.js client (frontend) service"
    echo "  - Nginx proxy (exposed on port 8080)"
    echo ""
    echo "Access your application at: http://localhost:8080"
    echo ""
    echo "Requirements:"
    echo "  - Git installed"
    echo "  - Docker installed and running"
    echo "  - Docker Compose installed"
}

# Main execution
main() {
    # Parse command line arguments
    local install_dir="reactpress-$(date +%Y%m%d%H%M)"
    
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            if [ -n "$1" ]; then
                install_dir="$1"
            fi
            ;;
    esac
    
    # Execution steps
    check_dependencies
    clone_repository "$install_dir"
    deploy_full_application
    
    log "🎉 ReactPress installation completed!"
    log "🌐 Visit your new ReactPress site at: http://localhost:8080"
}

# Run main function with all arguments
main "$@"