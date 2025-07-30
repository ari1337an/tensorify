#!/bin/bash

# Build All Services Script for Tensorify Monorepo
# Cleans, installs, and builds all services in the ./services folder
# Stops on first failure

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service configurations: directory_name:package_name
SERVICES=(
  "api:@tensorify.io/backend-api"
  "app.tensorify.io:@tensorify.io/services-app-tensorify-io"
  "auth.tensorify.io:@tensorify.io/services-auth-tensorify-io"
  "controls.tensorify.io:@tensorify.io/services-controls-tensorify-io"
  "plugins.tensorify.io:@tensorify/plugins.tensorify.io"
  "tensorify.io:@tensorify.io/services-tensorify-io"
)

# Function to print header
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Tensorify Services Build Script${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Function to print step header
print_step() {
    echo -e "${YELLOW}▶️  $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Function to run cleanup
run_cleanup() {
    print_step "Step 1/3: Running cleanup script..."
    
    if [ ! -f "./scripts/cleanup-package-installs.sh" ]; then
        print_error "Cleanup script not found: ./scripts/cleanup-package-installs.sh"
        exit 1
    fi
    
    if ./scripts/cleanup-package-installs.sh -y; then
        print_success "Cleanup completed successfully"
    else
        print_error "Cleanup failed"
        exit 1
    fi
    
    echo ""
}

# Function to install dependencies for a service
install_service() {
    local service_dir=$1
    local package_name=$2
    
    print_step "Installing dependencies for $service_dir ($package_name)..."
    
    if pnpm install --filter="$package_name"; then
        print_success "Dependencies installed for $service_dir"
    else
        print_error "Failed to install dependencies for $service_dir"
        exit 1
    fi
}

# Function to build a service
build_service() {
    local service_dir=$1
    local package_name=$2
    
    print_step "Building $service_dir ($package_name)..."
    
    if pnpm run build --filter="$package_name"; then
        print_success "Build completed for $service_dir"
    else
        print_error "Build failed for $service_dir"
        exit 1
    fi
}

# Function to run install for all services
run_install() {
    print_step "Step 2/3: Installing dependencies for all services..."
    echo ""
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r service_dir package_name <<< "$service"
        
        # Check if service directory exists
        if [ ! -d "./services/$service_dir" ]; then
            print_error "Service directory not found: ./services/$service_dir"
            exit 1
        fi
        
        install_service "$service_dir" "$package_name"
    done
    
    print_success "All dependencies installed successfully"
    echo ""
}

# Function to run build for all services
run_build() {
    print_step "Step 3/3: Building all services..."
    echo ""
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r service_dir package_name <<< "$service"
        build_service "$service_dir" "$package_name"
    done
    
    print_success "All services built successfully"
    echo ""
}

# Function to show help
show_help() {
    print_header
    echo "Usage: $0 [options]"
    echo ""
    echo "This script performs the following operations:"
    echo "  1. Runs cleanup script to remove node_modules, dist, .next, etc."
    echo "  2. Installs dependencies for all services"
    echo "  3. Builds all services"
    echo ""
    echo "Services that will be processed:"
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r service_dir package_name <<< "$service"
        echo "  • $service_dir ($package_name)"
    done
    echo ""
    echo "Options:"
    echo "  --help, -h      Show this help message"
    echo "  --cleanup-only  Run only the cleanup step"
    echo "  --install-only  Run only the install step (skips cleanup)"
    echo "  --build-only    Run only the build step (skips cleanup and install)"
    echo "  --no-cleanup    Skip the cleanup step"
    echo ""
    echo "Examples:"
    echo "  $0              # Run full cleanup, install, and build"
    echo "  $0 --cleanup-only  # Run only cleanup"
    echo "  $0 --no-cleanup    # Skip cleanup, run install and build"
    echo ""
}

# Function to verify prerequisites
verify_prerequisites() {
    # Check if we're in the right directory (should have services folder)
    if [ ! -d "./services" ]; then
        print_error "Services directory not found. Please run this script from the repository root."
        exit 1
    fi
    
    # Check if pnpm is available
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm is not installed or not in PATH"
        exit 1
    fi
    
    # Check if all service directories exist
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r service_dir package_name <<< "$service"
        if [ ! -d "./services/$service_dir" ]; then
            print_error "Service directory not found: ./services/$service_dir"
            exit 1
        fi
        
        if [ ! -f "./services/$service_dir/package.json" ]; then
            print_error "package.json not found in: ./services/$service_dir"
            exit 1
        fi
    done
}

# Function to show summary
show_summary() {
    echo ""
    echo -e "${GREEN}🎉 All operations completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Summary:${NC}"
    echo "  • Cleanup: ✅ Completed"
    echo "  • Install: ✅ Completed for ${#SERVICES[@]} services"
    echo "  • Build: ✅ Completed for ${#SERVICES[@]} services"
    echo ""
    echo -e "${BLUE}Services processed:${NC}"
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r service_dir package_name <<< "$service"
        echo "  ✅ $service_dir"
    done
    echo ""
}

# Main execution function
main() {
    local cleanup_only=false
    local install_only=false
    local build_only=false
    local no_cleanup=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --cleanup-only)
                cleanup_only=true
                shift
                ;;
            --install-only)
                install_only=true
                shift
                ;;
            --build-only)
                build_only=true
                shift
                ;;
            --no-cleanup)
                no_cleanup=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use '$0 --help' for usage information"
                exit 1
                ;;
        esac
    done
    
    print_header
    print_info "Verifying prerequisites..."
    verify_prerequisites
    print_success "Prerequisites verified"
    echo ""
    
    # Execute based on options
    if $cleanup_only; then
        run_cleanup
    elif $install_only; then
        run_install
    elif $build_only; then
        run_build
    else
        # Full execution
        if ! $no_cleanup; then
            run_cleanup
        fi
        run_install
        run_build
        show_summary
    fi
}

# Error handler
handle_error() {
    local exit_code=$?
    echo ""
    print_error "Script failed with exit code $exit_code"
    print_info "Check the error messages above for details"
    exit $exit_code
}

# Set up error handling
trap handle_error ERR

# Run main function with all arguments
main "$@" 