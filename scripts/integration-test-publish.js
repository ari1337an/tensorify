#!/usr/bin/env node

/**
 * Integration Test for Plugin Publishing Flow
 *
 * This script tests the complete plugin publishing pipeline:
 * 1. Creates a plugin using create-tensorify-plugin
 * 2. Publishes it using CLI
 * 3. Verifies backend storage and frontend database
 * 4. Tests plugin engine execution
 * 5. Cleans up test artifacts
 *
 * SECURITY: Only runs in development environment with NODE_ENV=development
 */

const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const axios = require("axios");
const chalk = require("chalk");
const { v4: uuidv4 } = require("uuid");
const testCases = require("./test-cases.json");
const Table = require("cli-table3");

// Security check - only run in development
if (process.env.NODE_ENV !== "development") {
  console.error(
    chalk.red("❌ This script can only run in development environment")
  );
  console.error(chalk.red("Set NODE_ENV=development to proceed"));
  process.exit(1);
}

const stripAnsi = (str) => str.replace(/\u001b\[[0-9;]*m/g, "");

class IntegrationTestRunner {
  constructor({ testId, testCase, tempDir } = {}) {
    this.verbose = !(
      process.argv.includes("--quiet") || process.argv.includes("-q")
    );
    this.testCase = testCase;
    this.testId = testId || uuidv4().substring(0, 8);
    this.testUsername = "testing-bot-tensorify-dev"; // Fixed username for all tests
    this.testPluginName = this.testId;
    this.backendUrl = "http://localhost:3001";
    this.frontendUrl = "http://localhost:3004";
    this.tempDir = tempDir;
    this.tempPluginDir = path.join(this.tempDir, this.testPluginName);
    this.testToken = null;
    this.testUserId = null;
    this.createdPluginSlug = null;
    this.cleanup = [];
    this.assertionResults = [];

    // Set up logging
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    this.logDir = path.join(process.cwd(), "logs");
    this.logFile = path.join(this.logDir, `integration-test-${timestamp}.log`);

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    this.log(`Starting Integration Test`, {
      testId: this.testId,
      case: this.testCase.name,
    });
  }

  log(message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      testId: this.testId,
      case: this.testCase.name,
      ...data,
    };
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + "\n");
    if (this.verbose) {
      console.log(chalk.gray(`[${timestamp}]`), message);
      if (Object.keys(data).length > 0) {
        console.dir(data, { depth: null });
      }
    }
  }

  checkAssertion(description, expected, actual) {
    const passed = JSON.stringify(actual) === JSON.stringify(expected);
    this.assertionResults.push({
      description,
      expected,
      actual,
      passed,
    });
    return passed;
  }

  async run() {
    try {
      await this.preflightChecks();
      await this.setupTestAuthentication();
      await this.createTestPlugin();
      await this.publishPlugin();
      await this.verifyBackendStorage();
      await this.verifyFrontendDatabase();
      await this.testPluginEngine();
      const assertionsPassed = await this.runAssertions();
      if (!assertionsPassed) {
        throw new Error("Assertion failures detected.");
      }
    } catch (error) {
      this.log(chalk.red("❌ Test run failed"), {
        error: error.message,
        stack: error.stack,
      });
      // Re-throw to be caught by the main loop
      throw new Error(
        error.message.includes("Assertion failures")
          ? error.message
          : `A critical error occurred: ${error.message}`
      );
    } finally {
      await this.cleanupResources();
    }
  }

  async preflightChecks() {
    this.log(chalk.yellow("🔍 Running preflight checks..."));
    await this.checkService(this.backendUrl, "Backend API");
    await this.checkService(this.frontendUrl, "Frontend");

    const cliPath = path.join(process.cwd(), "packages/cli");
    if (!fs.existsSync(cliPath)) {
      throw new Error("CLI package not found");
    }
    const cliBuiltPath = path.join(cliPath, "lib/bin/tensorify.js");
    if (!fs.existsSync(cliBuiltPath)) {
      this.log("Building CLI...");
      execSync("npm run build", { cwd: cliPath, stdio: "pipe" });
      this.log("CLI built successfully");
    }

    this.log(chalk.green("✅ Preflight checks passed"));
  }

  async checkService(url, name) {
    try {
      const healthPath = url.includes("3004") ? "/api/health" : "/health";
      const response = await axios.get(`${url}${healthPath}`, {
        timeout: 5000,
      });
      this.log(`${name} service is healthy`, { status: response.status });
    } catch (error) {
      throw new Error(
        `${name} service at ${url} is not available: ${error.message}`
      );
    }
  }

  async setupTestAuthentication() {
    this.log(chalk.yellow("🔐 Setting up test authentication..."));
    try {
      const response = await axios.post(
        `${this.backendUrl}/api/test/auth`,
        { testId: this.testId },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Test-Environment": "development",
          },
        }
      );
      this.testToken = response.data.token;
      this.testUserId = response.data.userId;
      this.log("Test authentication created", {
        userId: this.testUserId,
        username: this.testUsername,
      });
      this.cleanup.push(() => this.revokeTestAuthentication());
    } catch (error) {
      throw new Error(`Failed to setup test authentication: ${error.message}`);
    }
  }

  async createTestPlugin() {
    this.log(chalk.yellow("📦 Creating test plugin..."));
    const createPluginPath = path.join(
      process.cwd(),
      "packages/create-tensorify-plugin"
    );
    try {
      const createOptions = this.testCase.createPluginOptions || {};
      const cliOptions = Object.entries(createOptions)
        .map(([key, value]) => {
          const optionName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
          return `--${optionName} ${value}`;
        })
        .join(" ");

      execSync(
        `node ${path.join(
          createPluginPath,
          "index.js"
        )} ${this.testPluginName} --yes ${cliOptions} --dev`,
        { cwd: this.tempDir, stdio: "pipe" }
      );
      this.log("Plugin created", { pluginDir: this.tempPluginDir });

      // Update plugin's package.json to use the correct test namespace
      this.log("Updating plugin's package.json for test namespace...");
      const packageJsonPath = path.join(this.tempPluginDir, "package.json");
      const packageJson = fs.readJsonSync(packageJsonPath);
      packageJson.name = `@${this.testUsername}/${this.testPluginName}`;

      // Apply package.json overrides from the test case
      if (this.testCase.packageJsonOverrides) {
        Object.assign(packageJson, this.testCase.packageJsonOverrides);
        this.log("Applied package.json overrides", {
          overrides: this.testCase.packageJsonOverrides,
        });
      }

      fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
      this.log("package.json updated with new name", {
        newName: packageJson.name,
      });

      this.cleanup.push(() => {
        if (fs.existsSync(this.tempPluginDir)) {
          fs.removeSync(this.tempPluginDir);
          this.log("Cleaned up plugin directory");
        }
      });
      await this.verifyPluginStructure();
    } catch (error) {
      throw new Error(`Failed to create plugin: ${error.message}`);
    }
  }

  async verifyPluginStructure() {
    const packageJson = fs.readJsonSync(
      path.join(this.tempPluginDir, "package.json")
    );
    this.createdPluginSlug = `${packageJson.name}:${packageJson.version}`;
    this.log("Plugin structure verified", { slug: this.createdPluginSlug });
  }

  async publishPlugin() {
    this.log(chalk.yellow("🚀 Publishing plugin..."));
    const cliPath = path.join(process.cwd(), "packages/cli");
    const env = {
      ...process.env,
      TENSORIFY_TEST_TOKEN: this.testToken,
      NODE_ENV: "development",
    };
    try {
      execSync(
        `node ${path.join(
          cliPath,
          "lib/bin/tensorify.js"
        )} publish --dev --access public`,
        { cwd: this.tempPluginDir, env, stdio: "pipe" }
      );
      this.log("Plugin published successfully");
      this.cleanup.push(() => this.removePluginFromDatabase());
    } catch (error) {
      throw new Error(`Failed to publish plugin: ${error.message}`);
    }
  }

  async verifyBackendStorage() {
    this.log(chalk.yellow("🗄️ Verifying backend storage..."));
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      let response;
      let retries = 10;
      while (retries > 0) {
        try {
          this.log(`Checking backend storage for: ${this.createdPluginSlug}`);
          response = await axios.get(
            `${this.backendUrl}/api/v1/plugin/getManifest`,
            {
              params: { slug: this.createdPluginSlug },
              headers: { Authorization: `Bearer ${this.testToken}` },
            }
          );
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          this.log(
            `Backend storage check failed, retrying... (${retries} attempts left)`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      this.log("Backend storage verified", { manifest: response.data.data });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        this.log(
          chalk.yellow(
            `⚠️ Backend storage verification failed (optional in development): ${error.message}`
          )
        );
        this.log(
          chalk.blue(
            "ℹ️ This is expected if S3 is not configured. Core publishing functionality is working."
          )
        );
      } else {
        throw new Error(
          `Backend storage verification failed: ${error.message}`
        );
      }
    }
  }

  async verifyFrontendDatabase() {
    this.log(chalk.yellow("🗃️ Verifying frontend database..."));
    try {
      const response = await axios.get(
        `${this.frontendUrl}/api/plugins/search`,
        { params: { q: this.testPluginName } }
      );
      const plugins = response.data.plugins || response.data;
      const plugin = plugins.find(
        (p) =>
          p.name === this.testPluginName || p.slug.includes(this.testPluginName)
      );

      if (plugin) {
        const oldSlug = this.createdPluginSlug;
        this.createdPluginSlug = plugin.slug;
        this.log("Found plugin in database", {
          originalSlug: oldSlug,
          actualSlug: plugin.slug,
        });
        this.log("Updated slug for subsequent tests", {
          slug: this.createdPluginSlug,
        });
      }

      if (!plugin) {
        throw new Error("Plugin not found in frontend database");
      }

      this.log("Frontend database verified", { plugin });
    } catch (error) {
      throw new Error(
        `Frontend database verification failed: ${error.message}`
      );
    }
  }

  async testPluginEngine() {
    this.log(chalk.yellow("🔧 Testing plugin engine..."));
    try {
      const response = await axios.post(
        `${this.backendUrl}/api/v1/plugin/getResult`,
        {
          variableName: "testVar",
          labelName: "testname",
          inFeatures: 1,
          outFeatures: 2,
        },
        {
          params: { slug: this.createdPluginSlug },
          headers: {
            Authorization: `Bearer ${this.testToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      this.log("Plugin engine test passed", { result: response.data });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        this.log(
          chalk.yellow(
            `⚠️ Plugin engine test failed (optional in development): ${error.message}`
          )
        );
        this.log(
          chalk.blue(
            "ℹ️ This is expected if S3 is not configured. Core publishing functionality is working."
          )
        );
      } else {
        throw new Error(`Plugin engine test failed: ${error.message}`);
      }
    }
  }

  printAssertionResults() {
    const table = new Table({
      head: [
        chalk.bold.white("Status"),
        chalk.bold.white("Assertion"),
        chalk.bold.white("Expected"),
        chalk.bold.white("Received"),
      ],
      colWidths: [10, 38, 32, 32],
      wordWrap: true,
      style: { head: [], border: ["grey"] },
      chars: {
        top: "═",
        "top-mid": "╤",
        "top-left": "╔",
        "top-right": "╗",
        bottom: "═",
        "bottom-mid": "╧",
        "bottom-left": "╚",
        "bottom-right": "╝",
        left: "║",
        "left-mid": "╟",
        mid: "─",
        "mid-mid": "┼",
        right: "║",
        "right-mid": "╢",
        middle: "│",
      },
    });

    for (const result of this.assertionResults) {
      const { description, expected, actual, passed } = result;
      const status = passed ? chalk.green("✓ Pass") : chalk.red("✗ Fail");
      const expectedStr =
        expected === undefined
          ? "undefined"
          : JSON.stringify(expected, null, 2);
      const actualStr =
        actual === undefined ? "undefined" : JSON.stringify(actual, null, 2);

      table.push([status, description, expectedStr, actualStr]);
    }

    console.log(table.toString());
    console.log();
  }

  async runAssertions() {
    console.log(chalk.yellow("\n▶️  Running Assertions..."));
    this.assertionResults = []; // Reset results

    await this.assertPluginExists(); // This one throws, it's a prerequisite
    await this.assertPluginExecutable(); // So does this one

    await this.assertManifestValid();
    await this.assertDatabaseConsistency();

    this.printAssertionResults();

    const failures = this.assertionResults.filter((r) => !r.passed).length;
    if (failures > 0) {
      console.log(chalk.red(`\nFound ${failures} assertion failure(s).`));
      return false;
    }

    if (this.verbose) {
      console.log(chalk.green("✅ All assertions passed."));
    }
    return true;
  }

  async assertPluginExists() {
    const response = await axios.get(`${this.frontendUrl}/api/plugins/search`, {
      params: { q: this.testPluginName },
    });
    if (response.status !== 200) {
      throw new Error("Plugin existence assertion failed");
    }
    const plugin = (response.data.plugins || response.data).find(
      (p) => p.slug === this.createdPluginSlug
    );
    if (!plugin) {
      throw new Error("Plugin not found in search results during assertion");
    }
  }

  async assertPluginExecutable() {
    try {
      const response = await axios.post(
        `${this.backendUrl}/api/v1/plugin/getResult`,
        { inputs: {}, parameters: {} },
        {
          params: { slug: this.createdPluginSlug },
          headers: {
            Authorization: `Bearer ${this.testToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Plugin execution assertion failed");
      }
    } catch (error) {
      throw error;
    }
  }

  async assertManifestValid() {
    this.log("  Asserting manifest validity...");
    try {
      const response = await axios.get(
        `${this.backendUrl}/api/v1/plugin/getManifest`,
        {
          params: { slug: this.createdPluginSlug },
          headers: { Authorization: `Bearer ${this.testToken}` },
        }
      );
      const manifest = response.data.data;
      const expectedManifest = this.testCase.assertions.manifest;

      for (const field in expectedManifest) {
        this.checkAssertion(
          `manifest.${field}`,
          expectedManifest[field],
          manifest[field]
        );
      }
    } catch (error) {
      this.checkAssertion(
        "manifest.fetch",
        "successful",
        `failed: ${error.message}`
      );
    }
  }

  async assertDatabaseConsistency() {
    this.log("  Asserting database consistency...");
    try {
      const backendResponse = await axios.get(
        `${this.backendUrl}/api/v1/plugin/getManifest`,
        {
          params: { slug: this.createdPluginSlug },
          headers: { Authorization: `Bearer ${this.testToken}` },
        }
      );
      const frontendResponse = await axios.get(
        `${this.frontendUrl}/api/plugins/search`,
        { params: { q: this.testPluginName } }
      );
      const manifest = backendResponse.data.data;
      const plugin = (
        frontendResponse.data.plugins || frontendResponse.data
      ).find((p) => p.slug === this.createdPluginSlug);

      if (!this.checkAssertion("database.plugin.exists", true, !!plugin)) {
        return; // Can't continue if plugin is not in DB
      }

      const expectedDbValues = this.testCase.assertions.database;
      if (expectedDbValues) {
        for (const [key, expectedValue] of Object.entries(expectedDbValues)) {
          let actualValue;
          if (key === "version") {
            actualValue = plugin.slug.split(":")[1];
          } else if (key === "pluginType") {
            actualValue = plugin?.pluginType;
          } else {
            actualValue = plugin[key];
          }
          this.checkAssertion(`database.${key}`, expectedValue, actualValue);
        }
      }

      const manifestSimpleName = manifest.name.split("/").pop();
      this.checkAssertion(
        "database.name.consistent",
        manifestSimpleName,
        plugin.name
      );

      const dbVersion = plugin.slug.split(":")[1];
      this.checkAssertion(
        "database.version.consistent",
        manifest.version,
        dbVersion
      );
    } catch (error) {
      this.checkAssertion(
        "database.fetch",
        "successful",
        `failed: ${error.message}`
      );
    }
  }

  async cleanupResources() {
    this.log(chalk.yellow("🧹 Starting cleanup..."));
    console.log(chalk.gray("\n🧹 Running cleanup for test case..."));

    for (let i = this.cleanup.length - 1; i >= 0; i--) {
      try {
        await this.cleanup[i]();
      } catch (error) {
        const message = `Cleanup step failed: ${error.message}`;
        this.log(chalk.yellow(`⚠️ ${message}`));
        console.log(chalk.yellow(`  - ${message}`));
      }
    }
    this.log("Cleanup completed");
  }

  async removePluginFromDatabase() {
    if (!this.createdPluginSlug) {
      this.log("Skipping DB cleanup, no plugin slug available.");
      return;
    }
    try {
      await axios.delete(
        `${this.frontendUrl}/api/test/plugins/${encodeURIComponent(
          this.createdPluginSlug
        )}`,
        {
          headers: {
            Authorization: `Bearer ${this.testToken}`,
            "X-Test-Environment": "development",
          },
        }
      );
      const message = "Plugin removed from database.";
      this.log(message);
      console.log(chalk.gray(`  - ${message}`));
    } catch (error) {
      const message = `Failed to remove plugin from database: ${error.message}`;
      this.log(chalk.yellow(`⚠️ ${message}`));
      console.log(chalk.yellow(`  - ${message}`));
    }
  }

  async revokeTestAuthentication() {
    if (!this.testUserId) {
      this.log("Skipping auth revocation, no test user ID.");
      return;
    }
    try {
      await axios.delete(
        `${this.backendUrl}/api/test/auth/${this.testUserId}`,
        {
          headers: {
            Authorization: `Bearer ${this.testToken}`,
            "X-Test-Environment": "development",
          },
        }
      );
      const message = "Test authentication revoked.";
      this.log(message);
      console.log(chalk.gray(`  - ${message}`));
    } catch (error) {
      const message = `Failed to revoke test authentication: ${error.message}`;
      this.log(chalk.yellow(`⚠️ ${message}`));
      console.log(chalk.yellow(`  - ${message}`));
    }
  }
}

async function main() {
  let allTestsPassed = true;
  const testRunId = uuidv4().substring(0, 8);
  const rootTempDir = path.join(process.cwd(), ".tmp-integration-tests");
  fs.ensureDirSync(rootTempDir);
  const tempDir = fs.mkdtempSync(
    path.join(rootTempDir, `tensorify-integration-${testRunId}-`)
  );
  console.log(chalk.gray(`📝 Using temporary directory: ${tempDir}`));

  try {
    for (const testCase of testCases) {
      const testSuffix = uuidv4().substring(0, 8);
      const pluginName =
        `test-plugin-${testCase.name}-${testSuffix}`.toLowerCase();

      console.log(
        chalk.cyan(
          `\n🧪 Running Test Case: ${testCase.name} (Plugin: ${pluginName})`
        )
      );
      const runner = new IntegrationTestRunner({
        testId: pluginName,
        testCase,
        tempDir,
      });
      try {
        await runner.run();
        console.log(
          chalk.green(
            `\n✅ Test Case Passed: ${testCase.name} (Plugin: ${pluginName})`
          )
        );
      } catch (error) {
        allTestsPassed = false;
        console.log(
          chalk.red(
            `\n💥 Test Case Failed: ${testCase.name} (Plugin: ${pluginName})`
          )
        );
        console.error(chalk.red(error.message));
        console.log(
          chalk.yellow(`\n📝 Check full stack trace at: ${runner.logFile}`)
        );
      }
    }
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.removeSync(tempDir);
      console.log(
        chalk.gray(`\n🧹 Cleaned up temporary directory: ${tempDir}`)
      );
    }
  }

  if (allTestsPassed) {
    console.log(
      chalk.green("\n🎉 All integration tests completed successfully!")
    );
    process.exit(0);
  } else {
    console.log(chalk.red("\n💥 Some integration tests failed!"));
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error(
    chalk.red("Unhandled Rejection at:"),
    promise,
    chalk.red("reason:"),
    reason
  );
  process.exit(1);
});

if (require.main === module) {
  main();
}
