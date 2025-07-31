#!/usr/bin/env node

/**
 * Seed script to install all visual configuration test cases as plugins
 * into the specified workflow for testing purposes.
 *
 * Run with: node seed-test-plugins.js
 */

const fs = require("fs").promises;
const path = require("path");

// For TypeScript imports, we need to use dynamic import or compile
let db;

async function initializeDb() {
  try {
    // Try to import the compiled JavaScript version first
    try {
      db =
        require("./services/app.tensorify.io/dist/server/database/db.js").default;
    } catch {
      // Fallback: use dynamic import for TypeScript
      const dbModule = await import(
        "./services/app.tensorify.io/src/server/database/db.ts"
      );
      db = dbModule.default;
    }

    if (!db) {
      throw new Error("Failed to initialize database client");
    }

    console.log("✓ Database client initialized");
  } catch (error) {
    console.error("Error initializing database:", error.message);
    console.log("\nNote: Make sure to build the TypeScript files first:");
    console.log("cd services/app.tensorify.io && npm run build");
    throw error;
  }
}

const WORKFLOW_ID = "c31c0fdc-8764-473b-9821-5412a0d7131f";
const TEST_CASES_FILE = ".tmp-integration-tests/visual-config-test-cases.txt";

/**
 * Parse the test cases file and extract JSON manifests
 */
async function parseTestCases() {
  try {
    const content = await fs.readFile(TEST_CASES_FILE, "utf-8");
    const lines = content.split("\n");

    const testCases = [];
    let currentJson = "";
    let insideJson = false;
    let braceCount = 0;
    let testCaseNumber = 0;
    let jsonStartIndent = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip comments and empty lines
      if (trimmedLine.startsWith("#") || trimmedLine === "") {
        continue;
      }

      // Start of a JSON object - but only if it's at the root level (no indentation)
      if (trimmedLine === "{" && !insideJson && line.indexOf("{") === 0) {
        insideJson = true;
        braceCount = 1;
        currentJson = "{\n";
        testCaseNumber++;
        jsonStartIndent = line.indexOf("{");
        continue;
      }

      if (insideJson) {
        currentJson += line + "\n";

        // Count braces to know when JSON ends
        for (const char of line) {
          if (char === "{") braceCount++;
          if (char === "}") braceCount--;
        }

        // End of JSON object - must be at the same indent level as start
        if (
          braceCount === 0 &&
          trimmedLine === "}" &&
          line.indexOf("}") === jsonStartIndent
        ) {
          try {
            const manifest = JSON.parse(currentJson);
            testCases.push({
              testNumber: testCaseNumber,
              manifest,
            });
            console.log(
              `✓ Parsed test case #${testCaseNumber}: ${manifest.name}`
            );
          } catch (error) {
            console.error(
              `✗ Failed to parse test case #${testCaseNumber}:`,
              error.message
            );
            console.log("Failed JSON (first 500 chars):");
            console.log(currentJson.substring(0, 500) + "...");
          }

          insideJson = false;
          currentJson = "";
          jsonStartIndent = -1;
        }
      }
    }

    return testCases;
  } catch (error) {
    console.error("Error reading test cases file:", error);
    throw error;
  }
}

/**
 * Insert a test case as an installed plugin
 */
async function insertTestPlugin(testCase) {
  const { testNumber, manifest } = testCase;

  const slug = `@test/testNum${testNumber}:0.0.1`;

  try {
    const installedPlugin = await db.workflowInstalledPlugins.create({
      data: {
        slug,
        description: `Test case #${testNumber}: ${manifest.name} - Visual configuration testing`,
        pluginType: manifest.pluginType || "custom",
        manifest: manifest,
        workflowId: WORKFLOW_ID,
      },
    });

    console.log(`✓ Installed plugin: ${slug}`);
    return installedPlugin;
  } catch (error) {
    if (error.code === "P2002") {
      // Unique constraint violation - plugin already exists
      console.log(`⚠ Plugin already exists: ${slug}, updating...`);

      try {
        const updatedPlugin = await db.workflowInstalledPlugins.update({
          where: {
            workflowId_slug: {
              workflowId: WORKFLOW_ID,
              slug: slug,
            },
          },
          data: {
            description: `Test case #${testNumber}: ${manifest.name} - Visual configuration testing`,
            pluginType: manifest.pluginType || "custom",
            manifest: manifest,
          },
        });

        console.log(`✓ Updated plugin: ${slug}`);
        return updatedPlugin;
      } catch (updateError) {
        console.error(
          `✗ Failed to update plugin ${slug}:`,
          updateError.message
        );
        throw updateError;
      }
    } else {
      console.error(`✗ Failed to install plugin ${slug}:`, error.message);
      throw error;
    }
  }
}

/**
 * Verify the target workflow exists
 */
async function verifyWorkflow() {
  try {
    const workflow = await db.workflow.findUnique({
      where: { id: WORKFLOW_ID },
      select: { id: true, name: true },
    });

    if (!workflow) {
      throw new Error(`Workflow with ID ${WORKFLOW_ID} not found`);
    }

    console.log(`✓ Target workflow found: ${workflow.name} (${workflow.id})`);
    return workflow;
  } catch (error) {
    console.error("Error verifying workflow:", error.message);
    throw error;
  }
}

/**
 * Clean up old test plugins (optional)
 */
async function cleanupOldTestPlugins() {
  try {
    const result = await db.workflowInstalledPlugins.deleteMany({
      where: {
        workflowId: WORKFLOW_ID,
        slug: {
          startsWith: "@test/testNum",
        },
      },
    });

    console.log(`🧹 Cleaned up ${result.count} existing test plugins`);
  } catch (error) {
    console.error("Error cleaning up old plugins:", error.message);
    // Don't throw, this is optional
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log("🚀 Starting test plugin seeding process...\n");

  try {
    // Initialize database first
    await initializeDb();

    // Verify workflow exists
    await verifyWorkflow();

    // Parse test cases
    console.log("\n📖 Parsing test cases...");
    const testCases = await parseTestCases();

    if (testCases.length === 0) {
      console.log("⚠ No test cases found!");
      return;
    }

    console.log(`📦 Found ${testCases.length} test cases\n`);

    // Optional: Clean up existing test plugins
    console.log("🧹 Cleaning up existing test plugins...");
    await cleanupOldTestPlugins();

    // Install each test case as a plugin
    console.log("\n📥 Installing test plugins...");
    const results = [];

    for (const testCase of testCases) {
      try {
        const result = await insertTestPlugin(testCase);
        results.push(result);
      } catch (error) {
        console.error(
          `Failed to process test case #${testCase.testNumber}:`,
          error.message
        );
      }
    }

    console.log(
      `\n✅ Successfully processed ${results.length}/${testCases.length} test plugins`
    );

    // Summary
    console.log("\n📊 Summary:");
    console.log(`• Workflow ID: ${WORKFLOW_ID}`);
    console.log(`• Test plugins installed: ${results.length}`);
    console.log(`• Slug pattern: @test/testNum[1-${testCases.length}]:0.0.1`);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await db.$disconnect();
    console.log("\n🔌 Database connection closed");
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n⏹ Process interrupted, closing database connection...");
  await db.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏹ Process terminated, closing database connection...");
  await db.$disconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseTestCases, insertTestPlugin, verifyWorkflow };
