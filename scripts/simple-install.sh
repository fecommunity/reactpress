#!/bin/bash

# ReactPress One-Command Installation Script
# This script initializes Node.js and MySQL environments

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
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first: https://docs.docker.com/get-docker/"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose: https://docs.docker.com/compose/install/"
    fi
    
    log "All dependencies found!"
}

# Initialize ReactPress environments
init_environments() {
    log "Initializing ReactPress environments..."
    
    # Create ReactPress directory
    mkdir -p reactpress && cd reactpress
    
    # Create a minimal docker-compose file for Node.js and MySQL only
    log "Creating docker-compose.yml for Node.js and MySQL environments..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: reactpress
      MYSQL_USER: reactpress
      MYSQL_PASSWORD: reactpress
    volumes:
      - db_data:/var/lib/mysql

  node:
    image: node:18-alpine
    restart: always
    volumes:
      - ../:/app
    working_dir: /app
    command: tail -f /dev/null

volumes:
  db_data:
EOF
    
    # Start services
    log "Starting Node.js and MySQL environments..."
    docker-compose up -d
    
    log "✅ ReactPress environments initialized successfully!"
    log "📝 The environments are now ready:"
    log "   - Node.js environment: Access with 'docker-compose exec node sh'"
    log "   - MySQL database: Access with 'docker-compose exec db mysql -u reactpress -preactpress reactpress'"
    log "   - Database connection details:"
    log "     * Host: db"
    log "     * Port: 3306"
    log "     * User: reactpress"
    log "     * Password: reactpress"
    log "     * Database: reactpress"
    log "📋 To check logs: docker-compose logs -f"
}

# Show help
show_help() {
    echo "ReactPress Environment Initialization"
    echo ""
    echo "Usage:"
    echo "  curl -fsSL https://raw.githubusercontent.com/fecommunity/reactpress/main/scripts/install.sh | bash"
    echo ""
    echo "This script will:"
    echo "  1. Check for required dependencies (Docker, Docker Compose)"
    echo "  2. Initialize Node.js and MySQL environments"
    echo ""
    echo "Environments will be available:"
    echo "  - Node.js environment: Access with 'docker-compose exec node sh'"
    echo "  - MySQL database: Access with 'docker-compose exec db mysql -u reactpress -preactpress reactpress'"
    echo ""
    echo "Requirements:"
    echo "  - Docker installed and running"
    echo "  - Docker Compose installed"
}

# Main execution
main() {
    # Parse command line arguments
    case "${1:-}" in
        -h|--help)
            show_help
            ;;
        *)
            check_dependencies
            init_environments
            ;;
    esac
}

# Run main function
main "$@"