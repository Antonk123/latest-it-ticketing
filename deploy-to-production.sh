#!/bin/bash

# IT-Ticketing Production Deployment Script
# This script automates deployment to your work's Portainer server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/Antonk123/latest-it-ticketing.git"
DEFAULT_DEPLOY_DIR="/opt/it-ticketing"
DEFAULT_FRONTEND_PORT="8082"
DEFAULT_BACKEND_PORT="3002"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   IT-Ticketing Production Deployment Script   ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}═══ $1 ═══${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script should be run as root or with sudo"
    exit 1
fi

print_section "Step 1: Configuration"

# Prompt for deployment directory
echo -e "${YELLOW}Enter deployment directory [${DEFAULT_DEPLOY_DIR}]:${NC}"
read DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-$DEFAULT_DEPLOY_DIR}
print_success "Deployment directory: $DEPLOY_DIR"

# Prompt for server IP
echo -e "\n${YELLOW}Enter production server IP address:${NC}"
read SERVER_IP
if [ -z "$SERVER_IP" ]; then
    print_error "Server IP is required"
    exit 1
fi
print_success "Server IP: $SERVER_IP"

# Prompt for ports
echo -e "\n${YELLOW}Enter frontend port [${DEFAULT_FRONTEND_PORT}]:${NC}"
read FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-$DEFAULT_FRONTEND_PORT}

echo -e "${YELLOW}Enter backend port [${DEFAULT_BACKEND_PORT}]:${NC}"
read BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-$DEFAULT_BACKEND_PORT}

print_success "Frontend port: $FRONTEND_PORT"
print_success "Backend port: $BACKEND_PORT"

# Prompt for Supabase credentials
echo -e "\n${YELLOW}Enter Supabase Project ID:${NC}"
read SUPABASE_PROJECT_ID

echo -e "${YELLOW}Enter Supabase URL:${NC}"
read SUPABASE_URL

echo -e "${YELLOW}Enter Supabase Publishable Key:${NC}"
read -s SUPABASE_KEY
echo

if [ -z "$SUPABASE_PROJECT_ID" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    print_error "All Supabase credentials are required"
    exit 1
fi

print_section "Step 2: Pre-deployment Checks"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker is installed"

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed"
    exit 1
fi
print_success "Docker Compose is installed"

# Check if Git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi
print_success "Git is installed"

# Check if ports are available
if netstat -tuln | grep -q ":${FRONTEND_PORT} "; then
    print_warning "Port $FRONTEND_PORT is already in use"
    echo -e "${YELLOW}Continue anyway? (y/n):${NC}"
    read CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

if netstat -tuln | grep -q ":${BACKEND_PORT} "; then
    print_warning "Port $BACKEND_PORT is already in use"
    echo -e "${YELLOW}Continue anyway? (y/n):${NC}"
    read CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

print_section "Step 3: Backup Existing Installation (if any)"

if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_DIR="${DEPLOY_DIR}-backup-$(date +%Y%m%d-%H%M%S)"
    print_warning "Existing installation found"
    echo -e "${YELLOW}Creating backup at: $BACKUP_DIR${NC}"

    # Stop existing containers
    if [ -f "$DEPLOY_DIR/docker-compose.yml" ]; then
        cd "$DEPLOY_DIR"
        docker compose down 2>/dev/null || true
        print_success "Stopped existing containers"
    fi

    # Create backup
    mv "$DEPLOY_DIR" "$BACKUP_DIR"
    print_success "Backup created: $BACKUP_DIR"
else
    print_success "No existing installation found"
fi

print_section "Step 4: Clone Repository"

# Create deployment directory
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

# Clone repository
echo -e "${YELLOW}Cloning repository...${NC}"
git clone "$REPO_URL" .
print_success "Repository cloned successfully"

print_section "Step 5: Configure Environment"

# Create .env file
cat > .env << EOF
VITE_SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_KEY
VITE_SUPABASE_URL=$SUPABASE_URL
EOF
print_success "Created .env file"

# Update docker-compose.yml with production settings
print_warning "Updating docker-compose.yml with production settings..."

# Backup original docker-compose.yml
cp docker-compose.yml docker-compose.yml.backup

# Update ports in docker-compose.yml
sed -i "s/- \"8082:80\"/- \"${FRONTEND_PORT}:80\"/" docker-compose.yml
sed -i "s/- \"3002:3001\"/- \"${BACKEND_PORT}:3001\"/" docker-compose.yml

# Update VITE_API_URL in docker-compose.yml
sed -i "s|VITE_API_URL: http://.*:.*\/api|VITE_API_URL: http://${SERVER_IP}:${BACKEND_PORT}/api|" docker-compose.yml

print_success "Updated docker-compose.yml"

# Check if Dockerfiles exist, if not warn user
if [ ! -f "Dockerfile.client" ] || [ ! -f "Dockerfile.server" ]; then
    print_error "Dockerfiles not found in repository!"
    print_warning "You need to push Dockerfile.client and Dockerfile.server to GitHub first"
    echo -e "${YELLOW}Do you want to continue anyway? (y/n):${NC}"
    read CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

print_section "Step 6: Build and Deploy"

echo -e "${YELLOW}Building and starting containers...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}\n"

# Build and start containers
docker compose up -d --build

if [ $? -eq 0 ]; then
    print_success "Containers built and started successfully"
else
    print_error "Failed to start containers"
    exit 1
fi

# Wait for containers to be healthy
echo -e "\n${YELLOW}Waiting for containers to be ready...${NC}"
sleep 5

print_section "Step 7: Verify Deployment"

# Check if containers are running
FRONTEND_RUNNING=$(docker ps | grep "it-ticketing-frontend" | wc -l)
BACKEND_RUNNING=$(docker ps | grep "it-ticketing-backend" | wc -l)

if [ $FRONTEND_RUNNING -eq 1 ] && [ $BACKEND_RUNNING -eq 1 ]; then
    print_success "All containers are running"
else
    print_error "Some containers failed to start"
    echo -e "${YELLOW}Run 'docker ps -a' to see container status${NC}"
    exit 1
fi

# Test backend health endpoint
echo -e "\n${YELLOW}Testing backend health endpoint...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:${BACKEND_PORT}/api/health || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed"
fi

# Test frontend
echo -e "${YELLOW}Testing frontend...${NC}"
FRONTEND_CHECK=$(curl -s http://localhost:${FRONTEND_PORT} || echo "failed")
if echo "$FRONTEND_CHECK" | grep -q "IT-Ticket"; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend accessibility check failed"
fi

print_section "Step 8: Firewall Configuration (Optional)"

echo -e "${YELLOW}Do you want to configure firewall rules? (y/n):${NC}"
read CONFIGURE_FIREWALL

if [ "$CONFIGURE_FIREWALL" = "y" ]; then
    if command -v ufw &> /dev/null; then
        echo -e "${YELLOW}Configuring UFW firewall...${NC}"
        ufw allow ${FRONTEND_PORT}/tcp
        ufw allow ${BACKEND_PORT}/tcp
        print_success "Firewall rules added"
    elif command -v firewall-cmd &> /dev/null; then
        echo -e "${YELLOW}Configuring firewalld...${NC}"
        firewall-cmd --permanent --add-port=${FRONTEND_PORT}/tcp
        firewall-cmd --permanent --add-port=${BACKEND_PORT}/tcp
        firewall-cmd --reload
        print_success "Firewall rules added"
    else
        print_warning "No supported firewall found (ufw or firewalld)"
    fi
fi

print_section "Deployment Complete!"

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Deployment Summary                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}Frontend URL:${NC} http://${SERVER_IP}:${FRONTEND_PORT}"
echo -e "${BLUE}Backend URL:${NC} http://${SERVER_IP}:${BACKEND_PORT}"
echo -e "${BLUE}Deployment Directory:${NC} $DEPLOY_DIR"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Update Supabase Dashboard → Authentication → URL Configuration"
echo "   Add redirect URL: http://${SERVER_IP}:${FRONTEND_PORT}/**"
echo ""
echo "2. Test the application:"
echo "   - Open: http://${SERVER_IP}:${FRONTEND_PORT}"
echo "   - Try creating an account"
echo "   - Test login functionality"
echo ""
echo "3. Monitor logs:"
echo "   - Frontend: docker logs it-ticketing-frontend"
echo "   - Backend: docker logs it-ticketing-backend"
echo ""
echo "4. To stop the application:"
echo "   cd $DEPLOY_DIR && docker compose down"
echo ""
echo "5. To update the application:"
echo "   cd $DEPLOY_DIR && git pull && docker compose up -d --build"

echo -e "\n${GREEN}Deployment script completed successfully!${NC}\n"

# Save deployment info
cat > "${DEPLOY_DIR}/DEPLOYMENT_INFO.txt" << EOF
Deployment Date: $(date)
Server IP: ${SERVER_IP}
Frontend Port: ${FRONTEND_PORT}
Backend Port: ${BACKEND_PORT}
Deployment Directory: ${DEPLOY_DIR}
Repository: ${REPO_URL}

Frontend URL: http://${SERVER_IP}:${FRONTEND_PORT}
Backend URL: http://${SERVER_IP}:${BACKEND_PORT}

Supabase Project ID: ${SUPABASE_PROJECT_ID}
Supabase URL: ${SUPABASE_URL}
EOF

print_success "Deployment info saved to: ${DEPLOY_DIR}/DEPLOYMENT_INFO.txt"
