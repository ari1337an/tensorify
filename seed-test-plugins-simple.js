#!/usr/bin/env node

/**
 * Simple Node.js seed script to install all visual configuration test cases as plugins
 * into the specified workflow for testing purposes.
 *
 * Prerequisites:
 * 1. Make sure the database is running
 * 2. Make sure the .env file is properly configured
 * 3. Run: npm install in services/app.tensorify.io
 *
 * Run with: node seed-test-plugins-simple.js
 */

const {
  PrismaClient,
} = require("./services/app.tensorify.io/src/server/database/prisma/generated/client");
const fs = require("fs").promises;

const WORKFLOW_ID = "c31c0fdc-8764-473b-9821-5412a0d7131f";
const TEST_CASES_FILE = ".tmp-integration-tests/visual-config-test-cases.txt";

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Parse the test cases file and extract JSON manifests
 */
async function parseTestCases() {
  try {
    const content = await fs.readFile(TEST_CASES_FILE, "utf-8");
    return parseTestCasesLineBased(content);
  } catch (error) {
    console.error("Error reading test cases file:", error);
    throw error;
  }
}

/**
 * Line-based parser that properly handles JSON brace counting
 */
function parseTestCasesLineBased(content) {
  const lines = content.split("\n");
  const testCases = [];
  let currentJson = "";
  let insideJson = false;
  let braceCount = 0;
  let testCaseNumber = 0;

  // Helper function to count braces while ignoring those inside strings
  function countBraces(text) {
    let count = 0;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") count++;
        if (char === "}") count--;
      }
    }

    return count;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip comments and empty lines when not inside JSON
    if (!insideJson && (trimmedLine.startsWith("#") || trimmedLine === "")) {
      continue;
    }

    // Start of a JSON object
    if (!insideJson && trimmedLine === "{") {
      insideJson = true;
      braceCount = 1;
      currentJson = "{\n";
      testCaseNumber++;
      continue;
    }

    if (insideJson) {
      currentJson += line + "\n";

      // Count braces properly, ignoring those in strings
      braceCount += countBraces(line);

      // End of JSON object
      if (braceCount === 0) {
        try {
          const cleanJson = currentJson.trim();
          const manifest = JSON.parse(cleanJson);
          testCases.push({
            testNumber: testCaseNumber,
            manifest,
          });
          console.log(
            `✓ Parsed test case #${testCaseNumber}: ${manifest.name || manifest.id}`
          );
        } catch (error) {
          console.error(
            `✗ Failed to parse test case #${testCaseNumber}:`,
            error.message
          );
          console.error("JSON preview:", cleanJson.substring(0, 100) + "...");
        }

        insideJson = false;
        currentJson = "";
      }
    }
  }

  return testCases;
}

/**
 * Insert a test case as an installed plugin
 */
async function insertTestPlugin(testCase) {
  const { testNumber, manifest } = testCase;

  const slug = `@test/testNum${testNumber}:0.0.1`;

  try {
    const installedPlugin = await prisma.workflowInstalledPlugins.create({
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
        const updatedPlugin = await prisma.workflowInstalledPlugins.update({
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
    const workflow = await prisma.workflow.findUnique({
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
    const result = await prisma.workflowInstalledPlugins.deleteMany({
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
    // Connect to database
    await prisma.$connect();
    console.log("✓ Database connected");

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
    console.log("\n💡 You can now test these plugins in your workflow!");
  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);

    // Show helpful error messages
    if (error.code === "ECONNREFUSED") {
      console.log("\n🔧 Troubleshooting:");
      console.log("• Make sure the database is running");
      console.log("• Check your DATABASE_URL in .env file");
    } else if (error.code === "P1001") {
      console.log("\n🔧 Troubleshooting:");
      console.log("• Check database connection string");
      console.log("• Verify database is accessible");
    }

    process.exit(1);
  } finally {
    // Close database connection
    await prisma.$disconnect();
    console.log("\n🔌 Database connection closed");
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.log("\n⏹ Process interrupted, closing database connection...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏹ Process terminated, closing database connection...");
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { parseTestCases, insertTestPlugin, verifyWorkflow };
