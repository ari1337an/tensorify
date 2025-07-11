#!/bin/bash

# Version Management Script for Tensorify Monorepo
# Manages versions for CLI, SDK, and Create Plugin packages

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Package directories
PACKAGES=(
  "packages/cli"
  "packages/sdk"
  "packages/create-tensorify-plugin"
)

# Function to get current version from package.json
get_version() {
  local package_dir=$1
  node -p "require('./$package_dir/package.json').version"
}

# Function to update version in package.json
update_version() {
  local package_dir=$1
  local new_version=$2
  
  echo -e "${YELLOW}Updating $package_dir to version $new_version...${NC}"
  
  # Update version in package.json
  cd "$package_dir"
  npm version "$new_version" --no-git-tag-version
  cd - > /dev/null
}

# Function to display current versions
show_versions() {
  echo -e "${GREEN}Current versions:${NC}"
  for package in "${PACKAGES[@]}"; do
    version=$(get_version "$package")
    echo "  $package: $version"
  done
}

# Function to bump versions
bump_versions() {
  local bump_type=$1
  
  echo -e "${GREEN}Bumping all packages ($bump_type)...${NC}"
  
  # Get current version from CLI package (use as reference)
  local current_version=$(get_version "packages/cli")
  echo "Current reference version: $current_version"
  
  # Calculate new version based on bump type
  local new_version
  case $bump_type in
    "patch")
      new_version=$(node -p "
        const semver = require('semver');
        semver.inc('$current_version', 'patch');
      " 2>/dev/null || {
        # Fallback if semver is not available
        IFS='.' read -ra ADDR <<< "$current_version"
        echo "${ADDR[0]}.${ADDR[1]}.$((ADDR[2]+1))"
      })
      ;;
    "minor")
      new_version=$(node -p "
        const semver = require('semver');
        semver.inc('$current_version', 'minor');
      " 2>/dev/null || {
        # Fallback if semver is not available
        IFS='.' read -ra ADDR <<< "$current_version"
        echo "${ADDR[0]}.$((ADDR[1]+1)).0"
      })
      ;;
    "major")
      new_version=$(node -p "
        const semver = require('semver');
        semver.inc('$current_version', 'major');
      " 2>/dev/null || {
        # Fallback if semver is not available
        IFS='.' read -ra ADDR <<< "$current_version"
        echo "$((ADDR[0]+1)).0.0"
      })
      ;;
    *)
      echo -e "${RED}Invalid bump type. Use: patch, minor, or major${NC}"
      exit 1
      ;;
  esac
  
  echo "New version will be: $new_version"
  
  # Update all packages
  for package in "${PACKAGES[@]}"; do
    update_version "$package" "$new_version"
  done
  
  echo -e "${GREEN}All packages updated to version $new_version${NC}"
}

# Function to build all packages
build_packages() {
  echo -e "${GREEN}Building all packages...${NC}"
  npm run build
  echo -e "${GREEN}Build completed${NC}"
}

# Function to publish all packages
publish_packages() {
  echo -e "${GREEN}Publishing all packages...${NC}"
  
  # Build first
  build_packages
  
  # Publish each package
  for package in "${PACKAGES[@]}"; do
    echo -e "${YELLOW}Publishing $package...${NC}"
    cd "$package"
    npm publish
    cd - > /dev/null
    echo -e "${GREEN}$package published successfully${NC}"
  done
  
  echo -e "${GREEN}All packages published successfully${NC}"
}

# Function to sync versions (make all packages have the same version)
sync_versions() {
  echo -e "${GREEN}Syncing all package versions...${NC}"
  
  # Get the highest version among all packages
  local highest_version=""
  for package in "${PACKAGES[@]}"; do
    local version=$(get_version "$package")
    if [[ -z "$highest_version" ]] || [[ "$version" > "$highest_version" ]]; then
      highest_version=$version
    fi
  done
  
  echo "Syncing all packages to version: $highest_version"
  
  # Update all packages to the highest version
  for package in "${PACKAGES[@]}"; do
    update_version "$package" "$highest_version"
  done
  
  echo -e "${GREEN}All packages synced to version $highest_version${NC}"
}

# Main script logic
case "${1:-}" in
  "show"|"status")
    show_versions
    ;;
  "patch")
    bump_versions "patch"
    show_versions
    ;;
  "minor")
    bump_versions "minor"
    show_versions
    ;;
  "major")
    bump_versions "major"
    show_versions
    ;;
  "sync")
    sync_versions
    show_versions
    ;;
  "build")
    build_packages
    ;;
  "publish")
    publish_packages
    ;;
  "release")
    echo -e "${GREEN}Performing full release (patch bump + publish)...${NC}"
    bump_versions "patch"
    show_versions
    publish_packages
    ;;
  "help"|"")
    echo "Tensorify Version Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  show, status    - Show current versions"
    echo "  patch           - Bump patch version for all packages"
    echo "  minor           - Bump minor version for all packages"
    echo "  major           - Bump major version for all packages"
    echo "  sync            - Sync all packages to the same version (highest)"
    echo "  build           - Build all packages"
    echo "  publish         - Build and publish all packages"
    echo "  release         - Bump patch version and publish all packages"
    echo "  help            - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 show         - Display current versions"
    echo "  $0 patch        - Bump patch version (0.0.8 → 0.0.9)"
    echo "  $0 minor        - Bump minor version (0.0.8 → 0.1.0)"
    echo "  $0 publish      - Build and publish all packages"
    echo "  $0 release      - Bump patch and publish in one command"
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    echo "Use '$0 help' for usage information"
    exit 1
    ;;
esac 