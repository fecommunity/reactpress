#!/bin/bash

# ReactPress One-Command Installation Script
# Fixed version that handles pnpm lockfile issues

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${GREEN}[ReactPress]${NC} $1"
}

info() {
    echo -e "${BLUE}[ReactPress]${NC} $1"
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
    
    # Check for docker compose
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
        info "Using Docker Compose V2"
    elif command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
        info "Using Docker Compose V1"
    else
        error "Docker Compose is not installed. Please install Docker Compose: https://docs.docker.com/compose/install/"
    fi
    
    # Check if Docker daemon is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker daemon is not running. Please start Docker and run this script again."
    fi
    
    log "All dependencies found!"
}

# Clone ReactPress repository
clone_repository() {
    local install_dir=${1:-"reactpress-$(date +%Y%m%d%H%M%S)"}
    
    log "Cloning ReactPress repository to $install_dir..."
    
    if [ -d "$install_dir" ]; then
        error "Directory $install_dir already exists. Please specify a different directory name or remove the existing one."
    fi
    
    if git clone https://github.com/fecommunity/reactpress.git --depth=1 "$install_dir"; then
        log "Repository cloned successfully!"
        cd "$install_dir"
    else
        error "Failed to clone repository. Please check your internet connection and try again."
    fi
}

# Setup environment configuration
setup_environment() {
    log "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# ReactPress Production Environment
# Database Configuration
MYSQL_ROOT_PASSWORD=root
DB_DATABASE=reactpress
DB_USER=reactpress
DB_PASSWD=reactpress
DB_HOST=db
DB_PORT=3306

# Application URLs
CLIENT_SITE_URL=http://localhost:3001
SERVER_SITE_URL=http://localhost:3002

# Nginx Configuration
NGINX_HOST=localhost
NGINX_PORT=8080
EOF
        info "Created .env file with default configuration"
    else
        info ".env file already exists, using existing configuration"
    fi
}

# Create nginx configuration
setup_nginx_config() {
    log "Setting up nginx configuration..."
    
    if [ ! -f "nginx.conf" ]; then
        cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    
    # Client application (Next.js)
    location / {
        proxy_pass http://client:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
    
    # Server API (NestJS)
    location /api/ {
        proxy_pass http://server:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
            add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization';
            add_header 'Access-Control-Max-Age' 86400;
            return 204;
        }
    }
    
    # Health checks
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
        log "Created nginx.conf with default configuration"
    else
        info "nginx.conf already exists, using existing configuration"
    fi
}

# Create .dockerignore file
setup_dockerignore() {
    log "Setting up .dockerignore file..."
    
    cat > .dockerignore << 'EOF'
.git
.gitignore
README.md
.dockerignore
docker-compose.prod.yml
node_modules
*.log
.env
.env.local
.docs
.husky
scripts/
public/
docs/
EOF
    log "Created .dockerignore file"
}

# Verify project structure
verify_project_structure() {
    log "Verifying project structure..."
    
    # Check for essential files
    if [ ! -f "package.json" ]; then
        error "package.json not found"
    fi
    
    if [ ! -f "pnpm-lock.yaml" ]; then
        warn "pnpm-lock.yaml not found, but will continue with --no-frozen-lockfile"
    else
        info "pnpm-lock.yaml found ($(du -h pnpm-lock.yaml | cut -f1))"
    fi
    
    if [ ! -f "pnpm-workspace.yaml" ]; then
        error "pnpm-workspace.yaml not found"
    fi
    
    if [ ! -f "client/package.json" ]; then
        error "client/package.json not found"
    fi
    
    if [ ! -f "server/package.json" ]; then
        error "server/package.json not found"
    fi
    
    log "Project structure verification passed!"
}

# Update Dockerfiles to use --no-frozen-lockfile
update_dockerfiles() {
    log "Updating Dockerfiles to use --no-frozen-lockfile..."
    
    # Update client Dockerfile
    cat > client/Dockerfile << 'EOF'
# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy ALL files from the project root
COPY . .

# Debug: Show what files were copied
RUN echo "=== Files in /app ===" && ls -la
RUN echo "=== pnpm-lock.yaml exists? ===" && test -f pnpm-lock.yaml && echo "YES" || echo "NO"
RUN echo "=== pnpm-workspace.yaml exists? ===" && test -f pnpm-workspace.yaml && echo "YES" || echo "NO"
RUN echo "=== client/package.json exists? ===" && test -f client/package.json && echo "YES" || echo "NO"

# Install dependencies - ALWAYS use --no-frozen-lockfile to avoid issues
RUN pnpm install --no-frozen-lockfile

# Build the client application
WORKDIR /app/client
RUN pnpm run build

# Expose port
EXPOSE 3001

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Start the application
CMD ["pnpm", "run", "start"]
EOF

    # Update server Dockerfile
    cat > server/Dockerfile << 'EOF'
# Use Node.js 18 as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy ALL files from the project root
COPY . .

# Debug: Show what files were copied
RUN echo "=== Files in /app ===" && ls -la
RUN echo "=== pnpm-lock.yaml exists? ===" && test -f pnpm-lock.yaml && echo "YES" || echo "NO"
RUN echo "=== pnpm-workspace.yaml exists? ===" && test -f pnpm-workspace.yaml && echo "YES" || echo "NO"
RUN echo "=== server/package.json exists? ===" && test -f server/package.json && echo "YES" || echo "NO"

# Install dependencies - ALWAYS use --no-frozen-lockfile to avoid issues
RUN pnpm install --no-frozen-lockfile

# Build the server application
WORKDIR /app/server
RUN pnpm run build

# Expose port
EXPOSE 3002

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Start the application
CMD ["pnpm", "run", "start"]
EOF

    log "Dockerfiles updated successfully!"
}

# Clean Docker cache
clean_docker_cache() {
    log "Cleaning Docker cache to ensure fresh build..."
    docker system prune -f > /dev/null 2>&1 || warn "Could not clean Docker system"
    docker builder prune -f > /dev/null 2>&1 || warn "Could not clean Docker builder cache"
}

# Build and start services
build_and_start_services() {
    log "Building and starting services..."
    
    # Clean cache
    clean_docker_cache
    
    # Build and start all services
    log "Starting all services (this may take 5-10 minutes)..."
    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up --build -d
    
    # Wait for services
    log "Waiting for services to start..."
    sleep 30
    
    # Check status
    if $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "✅ Services started successfully!"
    else
        error "Failed to start services. Check logs with: $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs"
    fi
}

# Deploy full application
deploy_full_application() {
    log "Deploying full ReactPress application..."
    
    # Setup configurations
    setup_environment
    setup_nginx_config
    setup_dockerignore
    
    # Verify structure
    verify_project_structure
    
    # Update Dockerfiles
    update_dockerfiles
    
    # Build and start
    build_and_start_services
    
    # Show final status
    log "🎉 ReactPress deployed successfully!"
    log "🌐 Access your application at: http://localhost:8080"
    log "📊 Service status:"
    $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml ps
    
    echo ""
    log "🔧 Management commands:"
    log "   View logs: $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml logs -f"
    log "   Stop services: $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down"
    log "   Restart: $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml restart"
}

# Show help
show_help() {
    echo "ReactPress One-Command Installation Script"
    echo ""
    echo "Usage:"
    echo "  curl -fsSL https://raw.githubusercontent.com/fecommunity/reactpress/main/install.sh | bash"
    echo "  Or run: ./install.sh [directory]"
    echo ""
    echo "Arguments:"
    echo "  directory    Installation directory (default: reactpress-YYYYMMDDHHMMSS)"
    echo ""
    echo "This script provides true one-command installation using Docker Compose."
    echo ""
    echo "Access your application at: http://localhost:8080"
}

# Main execution
main() {
    local install_dir="reactpress-$(date +%Y%m%d%H%M%S)"
    
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
    
    log "Starting ReactPress installation..."
    check_dependencies
    clone_repository "$install_dir"
    deploy_full_application
    
    log "📖 Documentation: https://github.com/fecommunity/reactpress"
}

# Run main function
main "$@"