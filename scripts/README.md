# Tensorify Integration Test System

This directory contains development scripts and integration tests for the Tensorify plugin publishing system.

## Integration Test: Plugin Publishing Flow

The `integration-test-publish.js` script provides end-to-end testing of the complete plugin publishing pipeline.

### What it tests:

1. **Plugin Creation**: Uses `create-tensorify-plugin` to generate a test plugin
2. **CLI Publishing**: Publishes the plugin using the Tensorify CLI
3. **Backend Storage**: Verifies plugin files are stored correctly in S3/storage
4. **Frontend Database**: Checks plugin metadata is saved in the database
5. **Plugin Engine**: Tests plugin execution through the API
6. **Data Consistency**: Validates consistency between backend and frontend

### Security Features:

- **Environment Check**: Only runs in `NODE_ENV=development`
- **Test Authentication**: Uses development-only test tokens
- **Safe Cleanup**: Automatically removes test artifacts
- **Test User Management**: Creates and removes test users safely

### Prerequisites:

1. **Development Environment**:

   ```bash
   export NODE_ENV=development
   ```

2. **Services Running**:
   - Backend API: `http://localhost:3001`
   - Frontend: `http://localhost:3004`

3. **Dependencies Installed**:
   ```bash
   cd scripts
   npm install
   ```

### Usage:

#### From the scripts directory:

```bash
cd scripts
pnpm run integration-test
```

#### From the repository root:

```bash
NODE_ENV=development node scripts/integration-test-publish.js
```

#### With custom configuration:

```bash
NODE_ENV=development BACKEND_URL=http://localhost:3001 FRONTEND_URL=http://localhost:3004 node scripts/integration-test-publish.js
```

### Test Flow:

1. **Preflight Checks**
   - Validates environment is development
   - Checks required services are running
   - Verifies package dependencies exist

2. **Test Authentication Setup**
   - Creates a temporary test user
   - Generates development-only JWT token
   - Stores credentials for cleanup

3. **Plugin Creation**
   - Uses `create-tensorify-plugin` to scaffold test plugin
   - Applies test user namespace automatically
   - Verifies plugin structure and files

4. **Plugin Publishing**
   - Executes CLI publish command with test token
   - Monitors upload progress and validation
   - Captures any publishing errors

5. **Backend Verification**
   - Fetches plugin manifest from API
   - Validates S3 file storage
   - Checks manifest structure and fields

6. **Frontend Database Verification**
   - Queries plugin database via search API
   - Validates plugin metadata storage
   - Checks user association and access levels

7. **Plugin Engine Testing**
   - Executes plugin through backend API
   - Validates execution results
   - Tests plugin manifest retrieval

8. **Assertions and Validation**
   - Runs comprehensive data consistency checks
   - Validates plugin type and SDK version
   - Ensures proper namespacing and versioning

9. **Cleanup and Rollback**
   - Removes test plugin files and directories
   - Deletes plugin from frontend database
   - Revokes test authentication tokens
   - Cleans up temporary test user

### Logging:

All test activities are logged to timestamped files in the `logs/` directory:

```
logs/integration-test-2024-01-15T10-30-45.log
```

Log entries include:

- Timestamps for all actions
- Test ID for correlation
- Success/failure status
- Error details and stack traces
- Cleanup activities

### Error Handling:

The test system includes comprehensive error handling:

- **Graceful Failures**: Tests continue where possible after non-critical errors
- **Automatic Rollback**: Failed tests trigger immediate cleanup
- **Detailed Logging**: All errors are captured with context
- **Safe Cleanup**: Cleanup runs even if tests fail

### Test Cases:

The integration test includes these specific assertions:

1. **Plugin Existence**: Verifies plugin exists in both backend and frontend
2. **Plugin Execution**: Ensures plugin can be executed successfully
3. **Manifest Validation**: Checks all required manifest fields
4. **Database Consistency**: Validates data consistency across services
5. **Access Control**: Verifies proper public/private access handling
6. **Versioning**: Ensures correct SDK version and plugin versioning
7. **Namespacing**: Validates proper user namespace application

### Development API Endpoints:

The test system uses these development-only endpoints:

#### Backend (localhost:3001):

- `POST /api/test/auth` - Create test authentication
- `DELETE /api/test/auth/:userId` - Revoke test authentication
- `GET /api/test/auth` - List test users

#### Frontend (localhost:3004):

- `DELETE /api/test/plugins/:slug` - Remove test plugins
- `GET /api/test/plugins/:slug` - Check plugin existence

⚠️ **Security Note**: These endpoints only work when `NODE_ENV=development` and include additional safety checks.

### Troubleshooting:

#### Common Issues:

1. **Services Not Running**:

   ```
   Error: Backend service at http://localhost:3001 is not available
   ```

   - Start the backend API service
   - Check port availability

2. **Environment Not Set**:

   ```
   Error: This script can only run in development environment
   ```

   - Set `NODE_ENV=development`

3. **Authentication Failures**:

   ```
   Error: Failed to setup test authentication
   ```

   - Check backend test auth endpoints are working
   - Verify JWT secret configuration

4. **Plugin Creation Failures**:

   ```
   Error: Failed to create plugin
   ```

   - Ensure `create-tensorify-plugin` package is built
   - Check for missing dependencies

5. **Database Connection Issues**:

   ```
   Error: Frontend database verification failed
   ```

   - Verify frontend service database connection
   - Check Prisma configuration

#### Debug Mode:

For additional debugging, check the generated log files in the `logs/` directory. Each test run creates a comprehensive log with all activities and error details.

### Contributing:

When adding new test cases:

1. Add assertions to the `runAssertions()` method
2. Update logging for new test steps
3. Add cleanup for any new resources created
4. Update this documentation with new test coverage

### Related Files:

- `integration-test-publish.js` - Main test script
- `package.json` - Dependencies and scripts
- `../packages/create-tensorify-plugin/` - Plugin creation tool
- `../packages/cli/` - Tensorify CLI
- `../services/api/` - Backend API with test endpoints
- `../services/plugins.tensorify.io/` - Frontend with cleanup endpoints

## Services Build Script

The `build-all-services.sh` script provides a single command to clean, install dependencies, and build all services in the Tensorify monorepo.

### What it does:

1. **Cleanup**: Runs the cleanup script to remove `node_modules`, `dist`, `.next`, and other build artifacts
2. **Install**: Installs dependencies for all services using pnpm with workspace filters
3. **Build**: Builds all services in the correct order with proper dependency handling

### Features:

- **Fail-Fast**: Stops execution immediately if any step fails
- **Progress Tracking**: Shows clear progress indicators for each step
- **Service Validation**: Verifies all service directories and package.json files exist
- **Flexible Options**: Run individual steps or skip certain operations
- **Color Output**: Uses colored output for better readability
- **Comprehensive Error Handling**: Provides detailed error messages and exit codes

### Prerequisites:

1. **PNPM**: Must be installed and available in PATH
2. **Repository Structure**: Must be run from the repository root
3. **Service Directories**: All service directories must exist in `./services/`

### Usage:

#### Basic usage (full build):

```bash
./scripts/build-all-services.sh
```

#### Available options:

```bash
./scripts/build-all-services.sh --help          # Show help message
./scripts/build-all-services.sh --cleanup-only  # Run only cleanup
./scripts/build-all-services.sh --install-only  # Run only install (skip cleanup)
./scripts/build-all-services.sh --build-only    # Run only build (skip cleanup and install)
./scripts/build-all-services.sh --no-cleanup    # Skip cleanup, run install and build
```

### Services Processed:

The script automatically processes these services:

- `api` (`@tensorify.io/backend-api`)
- `app.tensorify.io` (`@tensorify.io/services-app-tensorify-io`)
- `auth.tensorify.io` (`@tensorify.io/services-auth-tensorify-io`)
- `controls.tensorify.io` (`@tensorify.io/services-controls-tensorify-io`)
- `plugins.tensorify.io` (`@tensorify/plugins.tensorify.io`)
- `tensorify.io` (`@tensorify.io/services-tensorify-io`)

### Error Handling:

- **Exit on First Error**: Uses `set -e` to stop execution on any command failure
- **Detailed Error Messages**: Provides context about which step and service failed
- **Prerequisites Validation**: Checks all requirements before starting
- **Error Trap**: Captures and reports unexpected errors with exit codes

### Examples:

#### Development workflow:

```bash
# Full clean rebuild of all services
./scripts/build-all-services.sh

# Quick rebuild without cleanup (faster for development)
./scripts/build-all-services.sh --no-cleanup

# Only build services (if dependencies are already installed)
./scripts/build-all-services.sh --build-only
```

#### CI/CD workflow:

```bash
# Clean build for production deployment
./scripts/build-all-services.sh

# The script will exit with code 1 if any service fails to build
# Perfect for CI/CD pipelines that need to fail fast
```

### Output Format:

The script provides clear, colored output showing:

```
========================================
  Tensorify Services Build Script
========================================

ℹ️  Verifying prerequisites...
✅ Prerequisites verified

▶️  Step 1/3: Running cleanup script...
✅ Cleanup completed successfully

▶️  Step 2/3: Installing dependencies for all services...

▶️  Installing dependencies for api (@tensorify.io/backend-api)...
✅ Dependencies installed for api

[... continues for all services ...]

▶️  Step 3/3: Building all services...

▶️  Building api (@tensorify.io/backend-api)...
✅ Build completed for api

[... continues for all services ...]

🎉 All operations completed successfully!

Summary:
  • Cleanup: ✅ Completed
  • Install: ✅ Completed for 6 services
  • Build: ✅ Completed for 6 services

Services processed:
  ✅ api
  ✅ app.tensorify.io
  ✅ auth.tensorify.io
  ✅ controls.tensorify.io
  ✅ plugins.tensorify.io
  ✅ tensorify.io
```

### Related Files:

- `build-all-services.sh` - Main build script
- `cleanup-package-installs.sh` - Cleanup script (called by build script)
- `../services/*/package.json` - Service package configurations
