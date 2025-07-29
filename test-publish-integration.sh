#!/bin/bash

# Tensorify Plugin Publishing Integration Test Runner
# 
# This script runs the comprehensive integration test for the plugin publishing pipeline.
# It must be run in development environment with the required services running.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Tensorify Plugin Publishing Integration Test${NC}"
echo -e "${BLUE}=================================================${NC}\n"

# Check environment
if [[ "$NODE_ENV" != "development" ]]; then
    echo -e "${RED}❌ Error: NODE_ENV must be set to 'development'${NC}"
    echo -e "${YELLOW}   Run: export NODE_ENV=development${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment check passed (NODE_ENV=development)${NC}"

# Check if we're in the right directory
if [[ ! -f "scripts/integration-test-publish.js" ]]; then
    echo -e "${RED}❌ Error: Must be run from the repository root${NC}"
    echo -e "${YELLOW}   This script should be in the same directory as packages/ and services/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Directory check passed${NC}"

# Check if dependencies are installed in scripts directory
if [[ ! -d "scripts/node_modules" ]]; then
    echo -e "${YELLOW}📦 Installing script dependencies...${NC}"
    cd scripts
    npm install
    cd ..
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Check if required services are running
echo -e "${YELLOW}🔍 Checking required services...${NC}"

# Check backend
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend API (localhost:3001) is not running${NC}"
    echo -e "${YELLOW}   Start with: cd services/api && pnpm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend API (localhost:3001) is running${NC}"

# Check frontend
if ! curl -s http://localhost:3004/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend (localhost:3004) is not running${NC}"
    echo -e "${YELLOW}   Start with: cd services/plugins.tensorify.io && pnpm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend (localhost:3004) is running${NC}"

# Create logs directory if it doesn't exist
mkdir -p logs

echo -e "\n${YELLOW}🚀 Starting integration test...${NC}\n"

# Run the integration test
if [[ "$1" == "--quiet" || "$1" == "-q" ]]; then
    NODE_ENV=development node scripts/integration-test-publish.js "$1"
else
    NODE_ENV=development node scripts/integration-test-publish.js
fi

# Check exit code
if [[ $? -eq 0 ]]; then
    echo -e "\n${GREEN}🎉 Integration test completed successfully!${NC}"
    echo -e "${GREEN}   All plugin publishing pipeline components are working correctly.${NC}"
else
    echo -e "\n${RED}💥 Integration test failed!${NC}"
    echo -e "${YELLOW}   Check the logs in the logs/ directory for details.${NC}"
    exit 1
fi 