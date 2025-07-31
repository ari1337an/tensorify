# Visual Configuration Test Plugin Seeder

This directory contains scripts to seed all 15 visual configuration test cases from `.tmp-integration-tests/visual-config-test-cases.txt` into the database as installed plugins for a specific workflow.

## Overview

The scripts will:

- Parse all 15 test cases from the visual config file
- Install them as plugins in workflow `c31c0fdc-8764-473b-9821-5412a0d7131f`
- Use slug pattern: `@test/testNum1:0.0.1`, `@test/testNum2:0.0.1`, etc.
- Handle updates if plugins already exist

## Available Scripts

### 1. `seed-test-plugins-simple.js` (Recommended)

Simple Node.js script that works out of the box.

**Prerequisites:**

```bash
# 1. Make sure database is running
# 2. Install dependencies
cd services/app.tensorify.io
npm install

# 3. Generate Prisma client (if not already done)
npx prisma generate
```

**Run:**

```bash
node seed-test-plugins-simple.js
```

### 2. `seed-test-plugins.ts` (TypeScript)

TypeScript version with better type safety.

**Prerequisites:**

```bash
# Install ts-node if not available
npm install -g ts-node

# Or use via npx
```

**Run:**

```bash
npx ts-node seed-test-plugins.ts
```

### 3. `seed-test-plugins.js` (Advanced)

More complex version with dynamic imports.

## Configuration

### Workflow ID

The scripts target workflow: `c31c0fdc-8764-473b-9821-5412a0d7131f`

To change this, edit the `WORKFLOW_ID` constant in any script:

```javascript
const WORKFLOW_ID = "your-workflow-id-here";
```

### Test Cases File

The scripts read from: `.tmp-integration-tests/visual-config-test-cases.txt`

To change this, edit the `TEST_CASES_FILE` constant:

```javascript
const TEST_CASES_FILE = "path/to/your/test-cases.txt";
```

## What Gets Installed

Each test case becomes an installed plugin with:

- **Slug**: `@test/testNum{N}:0.0.1` (e.g., `@test/testNum1:0.0.1`)
- **Description**: `Test case #{N}: {title} - Visual configuration testing`
- **Plugin Type**: From manifest or `custom`
- **Manifest**: Complete JSON configuration from test file

## Database Schema

The scripts insert into the `WorkflowInstalledPlugins` table:

```sql
Table: WorkflowInstalledPlugins
- id: UUID (auto-generated)
- slug: String (e.g., "@test/testNum1:0.0.1")
- description: String
- pluginType: String (from manifest)
- manifest: JSON (complete test case config)
- workflowId: String (target workflow)
- createdAt: DateTime
- updatedAt: DateTime
```

## Test Cases Overview

The scripts will install 15 test cases covering:

1. **Test #1**: Basic DEFAULT handles with all types
2. **Test #2**: CIRCLE_LG handles with complex positioning
3. **Test #3**: DIAMOND and SQUARE handles with CIRCLE container
4. **Test #4**: TRIANGLE handles with LEFT_ROUND container
5. **Test #5**: VERTICAL_BOX handles with all icon positions
6. **Test #6**: Mixed handle types with complex validation
7. **Test #7**: Minimal configuration with defaults
8. **Test #8**: All edge types and positions
9. **Test #9**: All icon combinations
10. **Test #10**: Label variations and dynamic templates
11. **Test #11**: Size constraints and aspect ratios
12. **Test #12**: Extreme styling and shadows
13. **Test #13**: No icons, minimal styling
14. **Test #14**: Complex validation patterns
15. **Test #15**: Error fallbacks and invalid configs

## Usage in Workflow

After running the seeder:

1. Open your workflow in the app
2. Look for plugins with slugs `@test/testNum1:0.0.1` through `@test/testNum15:0.0.1`
3. Add them to your canvas to test visual configurations
4. Each plugin will show:
   - Title: "Test #1", "Test #2", etc.
   - Input handles labeled with their viewType (e.g., "Input (circle-lg)")
   - All visual styling from the test configuration

## Troubleshooting

### Database Connection Issues

```
Error: ECONNREFUSED
```

- Make sure PostgreSQL is running
- Check `DATABASE_URL` in your `.env` file
- Verify database credentials

### Prisma Client Issues

```
Error: Cannot find module '@prisma/client'
```

```bash
cd services/app.tensorify.io
npx prisma generate
```

### Workflow Not Found

```
Error: Workflow with ID {id} not found
```

- Verify the workflow exists in your database
- Update `WORKFLOW_ID` in the script if needed

### TypeScript Issues

```
Error: Cannot use import statement outside a module
```

- Use the simple Node.js version instead: `seed-test-plugins-simple.js`
- Or install ts-node: `npm install -g ts-node`

## Cleanup

To remove all test plugins:

```sql
DELETE FROM "WorkflowInstalledPlugins"
WHERE "workflowId" = 'c31c0fdc-8764-473b-9821-5412a0d7131f'
AND slug LIKE '@test/testNum%';
```

Or run the script again - it will clean up existing test plugins automatically.

## Development

To modify the test cases:

1. Edit `.tmp-integration-tests/visual-config-test-cases.txt`
2. Run the seeder script again
3. Existing plugins will be updated automatically

## Security Note

These scripts are for **development and testing only**. Do not run in production environments.
