#!/bin/bash

# Quick script to push all changes to GitHub

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Push to GitHub                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Not a git repository. Initializing...${NC}"
    git init
    git remote add origin https://github.com/Antonk123/latest-it-ticketing.git
fi

# Show current status
echo -e "${YELLOW}Current status:${NC}"
git status

echo -e "\n${YELLOW}Enter commit message:${NC}"
read COMMIT_MESSAGE

if [ -z "$COMMIT_MESSAGE" ]; then
    COMMIT_MESSAGE="Update: $(date +%Y-%m-%d\ %H:%M:%S)"
    echo -e "${YELLOW}Using default message: $COMMIT_MESSAGE${NC}"
fi

# Add all changes
echo -e "\n${YELLOW}Adding all changes...${NC}"
git add .

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "$COMMIT_MESSAGE"

# Push to GitHub
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push origin main || git push origin master

echo -e "\n${GREEN}✓ Successfully pushed to GitHub!${NC}\n"

echo -e "${BLUE}Repository:${NC} https://github.com/Antonk123/latest-it-ticketing"
echo -e "${BLUE}Commit:${NC} $COMMIT_MESSAGE\n"
