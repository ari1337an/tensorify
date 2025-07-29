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
npm run integration-test
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
