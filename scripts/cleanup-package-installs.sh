#!/bin/bash

# Cleanup Script for Tensorify Monorepo
# Removes build artifacts, dependencies, and cache files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print header
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Tensorify Monorepo Cleanup Script${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Function to confirm action
confirm_cleanup() {
    echo -e "${YELLOW}This will remove the following from the entire monorepo:${NC}"
    echo "  • All node_modules directories"
    echo "  • All .next directories (Next.js build output)"
    echo "  • All .turbo directories (Turborepo cache)"
    echo "  • All dist directories (build output)"
    echo "  • All package-lock.json files"
    echo "  • All yarn.lock files"
    echo "  • All pnpm-lock.yaml files"
    echo ""
    
    if [[ "${1:-}" != "--force" && "${1:-}" != "-f" ]]; then
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Cleanup cancelled.${NC}"
            exit 0
        fi
        echo ""
    fi
}

# Function to remove directories
remove_directories() {
    local dir_pattern=$1
    local description=$2
    
    echo -e "${YELLOW}Removing $description...${NC}"
    
    # Find and count directories first
    local count=$(find . -type d -name "$dir_pattern" -not -path "./node_modules/*" | wc -l)
    
    if [ "$count" -gt 0 ]; then
        echo "  Found $count $description to remove:"
        find . -type d -name "$dir_pattern" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' dir; do
            echo "    Removing: $dir"
            rm -rf "$dir"
        done
        echo -e "  ${GREEN}✓ Removed $count $description${NC}"
    else
        echo -e "  ${BLUE}ℹ No $description found${NC}"
    fi
    echo ""
}

# Function to remove files
remove_files() {
    local file_pattern=$1
    local description=$2
    
    echo -e "${YELLOW}Removing $description...${NC}"
    
    # Find and count files first
    local count=$(find . -type f -name "$file_pattern" -not -path "./node_modules/*" | wc -l)
    
    if [ "$count" -gt 0 ]; then
        echo "  Found $count $description to remove:"
        find . -type f -name "$file_pattern" -not -path "./node_modules/*" -print0 | while IFS= read -r -d '' file; do
            echo "    Removing: $file"
            rm -f "$file"
        done
        echo -e "  ${GREEN}✓ Removed $count $description${NC}"
    else
        echo -e "  ${BLUE}ℹ No $description found${NC}"
    fi
    echo ""
}

# Function to show disk space saved
show_disk_usage() {
    echo -e "${GREEN}Cleanup completed!${NC}"
    echo ""
    echo -e "${BLUE}You can now run:${NC}"
    echo "  npm install    # to reinstall dependencies"
    echo "  npm run build  # to rebuild all packages"
    echo ""
}

# Main cleanup function
perform_cleanup() {
    print_header
    confirm_cleanup "$1"
    
    echo -e "${GREEN}Starting cleanup process...${NC}"
    echo ""
    
    # Remove node_modules directories
    remove_directories "node_modules" "node_modules directories"
    
    # Remove Next.js build output
    remove_directories ".next" "Next.js build directories"
    
    # Remove Turborepo cache
    remove_directories ".turbo" "Turborepo cache directories"
    
    # Remove dist directories
    remove_directories "dist" "dist directories"
    
    # Remove package lock files
    remove_files "package-lock.json" "package-lock.json files"
    remove_files "yarn.lock" "yarn.lock files"
    remove_files "pnpm-lock.yaml" "pnpm-lock.yaml files"
    
    # Also remove common cache directories
    remove_directories ".npm" ".npm cache directories"
    remove_directories ".yarn" ".yarn cache directories"
    remove_directories "coverage" "test coverage directories"
    
    show_disk_usage
}

# Handle command line arguments
case "${1:-}" in
    "--help"|"-h"|"help")
        print_header
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --force, -f     Skip confirmation prompt"
        echo "  --help, -h      Show this help message"
        echo ""
        echo "This script removes:"
        echo "  • node_modules directories"
        echo "  • .next directories (Next.js)"
        echo "  • .turbo directories (Turborepo)"
        echo "  • dist directories"
        echo "  • package-lock.json files"
        echo "  • yarn.lock files"
        echo "  • pnpm-lock.yaml files"
        echo "  • .npm/.yarn cache directories"
        echo "  • coverage directories"
        echo ""
        echo "Examples:"
        echo "  $0              # Interactive cleanup"
        echo "  $0 --force      # Force cleanup without confirmation"
        ;;
    "--force"|"-f")
        perform_cleanup "--force"
        ;;
    "")
        perform_cleanup
        ;;
    *)
        echo -e "${RED}Unknown option: $1${NC}"
        echo "Use '$0 --help' for usage information"
        exit 1
        ;;
esac 