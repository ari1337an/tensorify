import { Command } from "commander";
import chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { build } from "esbuild";
import FormData from "form-data";
import axios from "axios";
import { validatePlugin } from "@tensorify.io/sdk";
import { getAuthToken, getConfig } from "../auth/session-storage";

interface PublishOptions {
  access: "public" | "private";
  directory?: string;
  backend?: string;
  frontend?: string;
  dev?: boolean;
}

interface PackageJson {
  name: string;
  version: string;
  private?: boolean;
  repository?: {
    type: string;
    url: string;
  };
  "tensorify-settings": {
    "sdk-version": string;
  };
  scripts: {
    build: string;
    [key: string]: string;
  };
  main?: string; // Added for new logic
  [key: string]: any;
}

interface ManifestJson {
  name: string;
  version: string;
  entrypointClassName: string;
  description?: string;
  author?: string;
  [key: string]: any;
}

/**
 * Publish command implementation
 */
export const publishCommand = new Command()
  .name("publish")
  .description("Publish a Tensorify plugin to the registry")
  .option("--access <type>", "Set access level (public|private)", "public")
  .option("--directory <path>", "Plugin directory path", process.cwd())
  .option("--backend <url>", "Backend API URL", "https://backend.tensorify.io")
  .option(
    "--frontend <url>",
    "Frontend API URL",
    "https://plugins.tensorify.io"
  )
  .option("-d, --dev", "Use development environment")
  .action(async (options: PublishOptions) => {
    try {
      console.log(chalk.blue("🚀 Starting plugin publish process...\n"));

      const publisher = new PluginPublisher(options);
      await publisher.publish();
    } catch (error) {
      console.error(
        chalk.red("❌ Publish failed:"),
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  });

/**
 * Plugin publisher class that handles the complete publishing workflow
 */
class PluginPublisher {
  private options: PublishOptions;
  private directory: string;
  private packageJson: PackageJson;
  private manifestJson: ManifestJson;
  private authToken: string;
  private sdkVersion: string;

  constructor(options: PublishOptions) {
    this.options = this.resolveOptions(options);
    this.directory = path.resolve(this.options.directory || process.cwd());
    this.packageJson = {} as PackageJson;
    this.manifestJson = {} as ManifestJson;
    this.authToken = "";
    this.sdkVersion = this.getSDKVersion();
  }

  /**
   * Resolve options with development environment configuration
   */
  private resolveOptions(options: PublishOptions): PublishOptions {
    // Determine if we should use dev environment
    // Priority: explicit --dev flag > saved config > NODE_ENV
    let isDev = options.dev;
    if (isDev === undefined) {
      // We'll resolve this async in the publish method
      isDev = process.env.NODE_ENV === "development";
    }

    // Set default URLs based on environment
    const resolvedOptions = { ...options };

    if (isDev) {
      // Override URLs for development environment if not explicitly set
      if (
        !options.backend ||
        options.backend === "https://backend.tensorify.io"
      ) {
        resolvedOptions.backend = "http://localhost:3001";
      }
      if (
        !options.frontend ||
        options.frontend === "https://plugins.tensorify.io"
      ) {
        resolvedOptions.frontend = "http://localhost:3000";
      }
    }

    return resolvedOptions;
  }

  /**
   * Get the SDK version from CLI's package.json dependencies
   */
  private getSDKVersion(): string {
    try {
      // Try to read CLI's package.json to get SDK version
      const cliPackageJsonPath = path.resolve(__dirname, "../../package.json");
      const cliPackageJson = JSON.parse(
        fs.readFileSync(cliPackageJsonPath, "utf-8")
      );

      // Check dependencies for @tensorify.io/sdk
      const sdkDependency = cliPackageJson.dependencies?.["@tensorify.io/sdk"];

      if (sdkDependency) {
        // If it's a file reference, try to read the actual SDK package.json
        if (sdkDependency.startsWith("file:")) {
          const sdkPath = path.resolve(
            path.dirname(cliPackageJsonPath),
            sdkDependency.replace("file:", "")
          );
          const sdkPackageJsonPath = path.join(sdkPath, "package.json");

          if (fs.existsSync(sdkPackageJsonPath)) {
            const sdkPackageJson = JSON.parse(
              fs.readFileSync(sdkPackageJsonPath, "utf-8")
            );
            return sdkPackageJson.version || "0.0.1";
          }
        }

        // For version ranges like "^1.0.0", extract the base version
        const versionMatch = sdkDependency.match(/(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          return versionMatch[1];
        }
      }

      // Fallback to reading from node_modules if available
      const nodeModulesSDKPath = path.resolve(
        __dirname,
        "../../node_modules/@tensorify.io/sdk/package.json"
      );
      if (fs.existsSync(nodeModulesSDKPath)) {
        const sdkPackageJson = JSON.parse(
          fs.readFileSync(nodeModulesSDKPath, "utf-8")
        );
        return sdkPackageJson.version || "0.0.1";
      }

      // Final fallback
      return "0.0.1";
    } catch (error) {
      console.warn(
        chalk.yellow("⚠️ Could not determine SDK version, using fallback 0.0.1")
      );
      return "0.0.1";
    }
  }

  /**
   * Main publish workflow
   */
  async publish(): Promise<void> {
    // Resolve development environment from saved config if not explicitly set
    await this.resolveDevelopmentEnvironment();

    // Step 1: Check backend service health
    await this.checkBackendHealth();

    // Step 2: Pre-flight validation
    await this.validatePrerequisites();

    // Step 3: Authentication check
    await this.checkAuthentication();

    // Step 4: Validate plugin
    await this.validatePluginStructure();

    // Step 5: Validate access level consistency
    await this.validateAccessLevel();

    // Step 6: Check version conflicts
    await this.checkVersionConflicts();

    // Step 7: Build and bundle
    await this.buildAndBundle();

    // Step 8: Upload files
    await this.uploadFiles();

    console.log(chalk.green("✅ Plugin published successfully!"));
  }

  /**
   * Resolve development environment configuration
   */
  private async resolveDevelopmentEnvironment(): Promise<void> {
    // If --dev flag was not explicitly set, check saved config
    if (this.options.dev === undefined) {
      const config = await getConfig();
      const isDev = config.isDev || process.env.NODE_ENV === "development";

      if (isDev) {
        console.log(
          chalk.cyan("🔧 Using development environment (from saved config)")
        );

        // Update options with development URLs if defaults are being used
        if (
          !this.options.backend ||
          this.options.backend === "https://backend.tensorify.io"
        ) {
          this.options.backend = "http://localhost:3001";
        }
        if (
          !this.options.frontend ||
          this.options.frontend === "https://plugins.tensorify.io"
        ) {
          this.options.frontend = "http://localhost:3000";
        }
      }
    } else if (this.options.dev) {
      console.log(chalk.cyan("🔧 Using development environment (--dev flag)"));
    }
  }

  /**
   * Validate basic prerequisites before attempting to publish
   */
  private async validatePrerequisites(): Promise<void> {
    console.log(chalk.yellow("🔍 Validating prerequisites..."));

    // Check if directory exists
    if (!fs.existsSync(this.directory)) {
      throw new Error(`Directory does not exist: ${this.directory}`);
    }

    // Check for essential files
    const essentialFiles = ["package.json", "manifest.json"];
    const missingEssentialFiles = essentialFiles.filter(
      (file) => !fs.existsSync(path.join(this.directory, file))
    );

    if (missingEssentialFiles.length > 0) {
      console.error(chalk.red(`❌ Missing essential files:`));
      missingEssentialFiles.forEach((file) => {
        console.error(chalk.red(`  • ${file}`));
      });
      throw new Error("Essential files are missing");
    }

    // Load package.json for further validation
    try {
      const packageJsonContent = fs.readFileSync(
        path.join(this.directory, "package.json"),
        "utf-8"
      );
      this.packageJson = JSON.parse(packageJsonContent);
    } catch (error) {
      throw new Error(
        "Invalid package.json file. Please check for syntax errors."
      );
    }

    // Check for TypeScript source files (more intelligent check)
    const hasValidEntryPoint = this.validateEntryPointExists();
    if (!hasValidEntryPoint) {
      console.error(chalk.red(`❌ No valid TypeScript entry point found`));
      console.error(chalk.yellow("\n💡 Expected one of:"));
      console.error(chalk.gray("  • src/index.ts (recommended)"));
      console.error(chalk.gray("  • index.ts"));
      console.error(
        chalk.gray("  • A TypeScript file matching package.json main field")
      );
      console.error(chalk.gray("  • Any .ts file in src/ directory"));
      console.error(chalk.yellow("\n💡 Tips:"));
      console.error(
        chalk.gray("  • Use 'create-tensorify-plugin' to scaffold a new plugin")
      );
      console.error(
        chalk.gray("  • Make sure you're in the correct plugin directory")
      );
      console.error(
        chalk.gray("  • Check if the plugin was properly initialized")
      );
      throw new Error("No valid TypeScript entry point found");
    }

    // Check if manifest.json is valid JSON
    try {
      const manifestJsonContent = fs.readFileSync(
        path.join(this.directory, "manifest.json"),
        "utf-8"
      );
      JSON.parse(manifestJsonContent);
    } catch (error) {
      throw new Error(
        "Invalid manifest.json file. Please check for syntax errors."
      );
    }

    // Check if TypeScript is available
    try {
      execSync("npx tsc --version", { cwd: this.directory, stdio: "pipe" });
    } catch (error) {
      console.error(chalk.red("❌ TypeScript not available"));
      console.error(chalk.yellow("\n💡 Tips:"));
      console.error(
        chalk.gray("  • Run 'npm install' to install dependencies")
      );
      console.error(
        chalk.gray("  • Make sure typescript is listed in devDependencies")
      );
      throw new Error("TypeScript is required but not available");
    }

    console.log(chalk.green("✅ Prerequisites validated\n"));
  }

  /**
   * Check if a valid TypeScript entry point exists
   */
  private validateEntryPointExists(): boolean {
    try {
      this.resolveEntryPoint();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if backend service is healthy and available
   */
  private async checkBackendHealth(): Promise<void> {
    console.log(chalk.yellow("🔍 Checking backend service health..."));

    try {
      const healthUrl = `${this.options.backend}/health`;
      const response = await axios.get(healthUrl, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          "User-Agent": "tensorify-cli",
        },
      });

      if (response.status === 200) {
        console.log(chalk.green("✅ Backend service is healthy\n"));
        return;
      }

      // If we get here, the service responded but not with 200
      throw new Error(`Backend service returned status: ${response.status}`);
    } catch (error) {
      console.error(chalk.red("❌ Backend service is not available"));

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
          console.error(
            chalk.yellow(
              "🔧 Tensorify servers are currently under maintenance to provide you with a smoother experience. Please try again in a few hours."
            )
          );
        } else if (error.response?.status === 503) {
          console.error(
            chalk.yellow(
              "🔧 Tensorify servers are currently under maintenance to provide you with a smoother experience. Please try again in a few hours."
            )
          );
        } else {
          console.error(chalk.red(`Network error: ${error.message}`));
        }
      } else {
        console.error(
          chalk.red(
            `Health check failed: ${
              error instanceof Error ? error.message : error
            }`
          )
        );
      }

      console.error(chalk.gray("\n💡 Tips:"));
      console.error(chalk.gray("  • Check your internet connection"));
      console.error(chalk.gray("  • Verify the backend URL is correct"));
      console.error(chalk.gray("  • Try again in a few minutes"));
      console.error(
        chalk.gray(`  • Current backend URL: ${this.options.backend}\n`)
      );

      throw new Error(
        "Backend service is not available. Please try again later."
      );
    }
  }

  /**
   * Check if user is authenticated
   */
  private async checkAuthentication(): Promise<void> {
    console.log(chalk.yellow("🔐 Checking authentication..."));

    const token = await getAuthToken();
    if (!token) {
      throw new Error('Not authenticated. Please run "tensorify login" first.');
    }

    this.authToken = token;
    console.log(chalk.green("✅ Authentication verified\n"));
  }

  /**
   * Validate plugin structure using SDK validation rules
   */
  private async validatePluginStructure(): Promise<void> {
    console.log(chalk.yellow("🔍 Validating plugin structure..."));

    const validationResult = await validatePlugin(
      this.directory,
      this.sdkVersion
    );

    if (!validationResult.valid) {
      this.displayValidationErrors(validationResult);
      throw new Error("Plugin validation failed. Please fix the errors above.");
    }

    // Load package.json and manifest.json for later use
    this.packageJson = JSON.parse(
      fs.readFileSync(path.join(this.directory, "package.json"), "utf-8")
    );
    this.manifestJson = JSON.parse(
      fs.readFileSync(path.join(this.directory, "manifest.json"), "utf-8")
    );

    console.log(chalk.green("✅ Plugin structure validated\n"));
  }

  /**
   * Display structured validation errors with detailed information
   */
  private displayValidationErrors(validationResult: any): void {
    console.error(chalk.red("\n❌ Plugin validation failed!\n"));

    // Group errors by file for better organization
    const errorsByFile = this.groupErrorsByFile(validationResult.errors);

    // Display errors grouped by file
    Object.entries(errorsByFile).forEach(([file, errors]) => {
      if (file === "unknown") {
        console.error(chalk.red("🔧 General Errors:"));
      } else {
        console.error(chalk.red(`📄 Errors in ${chalk.bold(file)}:`));
      }

      errors.forEach((error: any, index: number) => {
        this.displaySingleError(error, index + 1);
      });

      console.error(""); // Empty line between file groups
    });

    // Display summary
    const totalErrors = validationResult.errors.length;
    const fileCount = Object.keys(errorsByFile).length;
    console.error(
      chalk.red(
        `📊 Summary: ${chalk.bold(totalErrors)} error${
          totalErrors !== 1 ? "s" : ""
        } found across ${chalk.bold(fileCount)} file${
          fileCount !== 1 ? "s" : ""
        }\n`
      )
    );

    // Display helpful tips
    this.displayValidationTips(validationResult.errors);
  }

  /**
   * Group validation errors by file for better organization
   */
  private groupErrorsByFile(errors: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};

    errors.forEach((error) => {
      const file = error.file || "unknown";
      if (!grouped[file]) {
        grouped[file] = [];
      }
      grouped[file].push(error);
    });

    return grouped;
  }

  /**
   * Display a single validation error with detailed formatting
   */
  private displaySingleError(error: any, index: number): void {
    const errorIcon = this.getErrorIcon(error.type);
    const errorTypeColor = this.getErrorTypeColor(error.type);

    console.error(
      chalk.red(
        `  ${index}. ${errorIcon} ${errorTypeColor(
          `[${error.type.toUpperCase()}]`
        )} ${error.message}`
      )
    );

    // Display additional details if available
    if (error.details && Array.isArray(error.details)) {
      this.displayZodErrorDetails(error.details);
    }

    // Display file location if available
    if (error.file) {
      console.error(chalk.gray(`     📁 File: ${error.file}`));
    }

    // Provide specific suggestions based on error type
    this.displayErrorSuggestions(error);
  }

  /**
   * Display detailed Zod validation errors with paths and expected values
   */
  private displayZodErrorDetails(zodErrors: any[]): void {
    zodErrors.forEach((zodError, index) => {
      const path =
        zodError.path && zodError.path.length > 0
          ? zodError.path.join(".")
          : "root";

      console.error(
        chalk.gray(`     └─ ${index + 1}. Path: ${chalk.cyan(path)}`)
      );
      console.error(chalk.gray(`        Issue: ${zodError.message}`));

      if (zodError.received !== undefined) {
        console.error(
          chalk.gray(
            `        Received: ${chalk.red(JSON.stringify(zodError.received))}`
          )
        );
      }

      if (zodError.expected) {
        console.error(
          chalk.gray(`        Expected: ${chalk.green(zodError.expected)}`)
        );
      }
    });
  }

  /**
   * Get appropriate icon for error type
   */
  private getErrorIcon(errorType: string): string {
    switch (errorType) {
      case "missing_file":
        return "📄";
      case "invalid_content":
        return "🔧";
      case "schema_error":
        return "📋";
      case "interface_error":
        return "🔗";
      case "version_mismatch":
        return "🔄";
      default:
        return "⚠️";
    }
  }

  /**
   * Get appropriate color for error type
   */
  private getErrorTypeColor(errorType: string): (text: string) => string {
    switch (errorType) {
      case "missing_file":
        return chalk.magenta;
      case "invalid_content":
        return chalk.yellow;
      case "schema_error":
        return chalk.red;
      case "interface_error":
        return chalk.blue;
      case "version_mismatch":
        return chalk.cyan;
      default:
        return chalk.red;
    }
  }

  /**
   * Display error-specific suggestions and fixes
   */
  private displayErrorSuggestions(error: any): void {
    let suggestion = "";

    switch (error.type) {
      case "missing_file":
        if (error.file === "package.json") {
          suggestion = "Create a package.json file with the required fields";
        } else if (error.file === "manifest.json") {
          suggestion = "Create a manifest.json file with plugin metadata";
        } else if (error.file === "index.ts") {
          suggestion =
            "Create an index.ts file with your plugin implementation";
        } else if (error.file === "icon.svg") {
          suggestion = "Create an icon.svg file for your plugin icon";
        }
        break;

      case "schema_error":
        if (error.file === "package.json") {
          suggestion =
            "Check package.json structure against Tensorify requirements";
        } else if (error.file === "manifest.json") {
          suggestion = "Verify manifest.json fields match the required schema";
        }
        break;

      case "interface_error":
        suggestion =
          "Ensure your class implements INode interface and matches manifest.json";
        break;

      case "version_mismatch":
        suggestion = `Update SDK version to ${this.sdkVersion} in package.json`;
        break;

      case "invalid_content":
        suggestion = "Check file syntax and structure";
        break;
    }

    if (suggestion) {
      console.error(chalk.gray(`     💡 Suggestion: ${suggestion}`));
    }
  }

  /**
   * Display general validation tips and resources
   */
  private displayValidationTips(errors: any[]): void {
    console.error(chalk.yellow("💡 Need help fixing these errors?"));
    console.error(
      chalk.gray("   • Check the documentation: https://docs.tensorify.io")
    );
    console.error(
      chalk.gray(
        "   • Use 'npx create-tensorify-plugin' to create a valid template"
      )
    );
    console.error(
      chalk.gray(
        "   • Ensure all required files exist and follow the correct schema"
      )
    );

    // Show specific tips based on error types present
    const errorTypes = [...new Set(errors.map((e) => e.type))];

    if (errorTypes.includes("schema_error")) {
      console.error(
        chalk.gray(
          "   • Schema errors: Double-check JSON syntax and required fields"
        )
      );
    }

    if (errorTypes.includes("version_mismatch")) {
      console.error(
        chalk.gray(
          `   • Version mismatch: Update to SDK version ${this.sdkVersion}`
        )
      );
    }

    if (errorTypes.includes("interface_error")) {
      console.error(
        chalk.gray(
          "   • Interface errors: Ensure class name matches manifest.json"
        )
      );
    }
  }

  /**
   * Validate access level consistency
   */
  private async validateAccessLevel(): Promise<void> {
    console.log(chalk.yellow("🔒 Validating access level..."));

    const isPrivatePackage = this.packageJson.private === true;
    const requestedAccess = this.options.access;

    // Check consistency between package.json private flag and requested access
    if (requestedAccess === "public" && isPrivatePackage) {
      throw new Error(
        'Cannot publish as public: package.json has "private": true'
      );
    }

    if (requestedAccess === "private" && !isPrivatePackage) {
      throw new Error(
        'Cannot publish as private: package.json has "private": false or not set'
      );
    }

    // For public packages, ensure repository URL exists
    if (requestedAccess === "public" && !this.packageJson.repository?.url) {
      throw new Error(
        "Public plugins must have a repository URL in package.json"
      );
    }

    console.log(chalk.green(`✅ Access level validated: ${requestedAccess}\n`));
  }

  /**
   * Check version conflicts with existing plugins
   */
  private async checkVersionConflicts(): Promise<void> {
    console.log(chalk.yellow("🔄 Checking version conflicts..."));

    try {
      const response = await axios.post(
        `${this.options.frontend}/api/plugins/version-check`,
        {
          name: this.packageJson.name,
          version: this.packageJson.version,
          access: this.options.access,
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.conflict) {
        throw new Error(
          `Version conflict: ${this.packageJson.name}@${this.packageJson.version} already exists with ${response.data.existingAccess} access`
        );
      }

      if (response.data.accessMismatch) {
        throw new Error(
          `Access level mismatch: Previous versions were ${response.data.previousAccess}, but requesting ${this.options.access}`
        );
      }

      console.log(chalk.green("✅ No version conflicts found\n"));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          console.log(chalk.green("✅ New plugin - no conflicts\n"));
          return;
        }
        throw new Error(
          `Version check failed: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw error;
    }
  }

  /**
   * Build and bundle the plugin
   */
  private async buildAndBundle(): Promise<void> {
    console.log(chalk.yellow("🔨 Building and bundling plugin..."));

    const buildDir = path.join(this.directory, "dist");
    const bundleFile = path.join(buildDir, "bundle.js");

    // Create dist directory
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    // Step 1: Run build script (TypeScript compilation)
    console.log(chalk.blue("  📦 Running build script..."));
    try {
      execSync(this.packageJson.scripts.build, {
        cwd: this.directory,
        stdio: "pipe",
      });
      console.log(chalk.green("  ✅ Build completed"));
    } catch (error) {
      throw new Error(
        `Build failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    // Step 2: Determine entry point intelligently
    const entryPoint = this.resolveEntryPoint();
    console.log(
      chalk.blue(`  📦 Creating bundle from entry point: ${entryPoint}`)
    );

    try {
      await build({
        entryPoints: [entryPoint],
        bundle: true,
        outfile: bundleFile,
        format: "cjs",
        target: "node16",
        external: ["@tensorify.io/sdk"],
        minify: true,
        sourcemap: false,
      });
      console.log(chalk.green("  ✅ Bundle created"));
    } catch (error) {
      throw new Error(
        `Bundling failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    console.log(chalk.green("✅ Build and bundle completed\n"));
  }

  /**
   * Intelligently resolve the entry point for bundling
   */
  private resolveEntryPoint(): string {
    // Try multiple strategies to find the entry point

    // Strategy 1: Check if there's already a built main file and trace it back to TypeScript
    const mainField = this.packageJson.main;
    if (mainField) {
      const mainPath = path.resolve(this.directory, mainField);

      // Try to find the TypeScript source equivalent
      // e.g., "dist/index.js" -> "src/index.ts"
      const possibleTsFiles = [
        // If main is dist/index.js, try src/index.ts
        mainField.replace(/^dist\//, "src/").replace(/\.js$/, ".ts"),
        // If main is lib/index.js, try src/index.ts
        mainField.replace(/^lib\//, "src/").replace(/\.js$/, ".ts"),
        // Direct replacement .js -> .ts
        mainField.replace(/\.js$/, ".ts"),
        // Try adding .ts extension
        `${mainField}.ts`,
      ];

      for (const tsFile of possibleTsFiles) {
        const tsPath = path.resolve(this.directory, tsFile);
        if (fs.existsSync(tsPath)) {
          return tsPath;
        }
      }

      // If main file exists as built JS, use it directly
      if (fs.existsSync(mainPath)) {
        return mainPath;
      }
    }

    // Strategy 2: Look for common TypeScript entry points
    const commonEntryPoints = [
      "src/index.ts",
      "index.ts",
      "src/main.ts",
      "main.ts",
    ];

    for (const entryPoint of commonEntryPoints) {
      const entryPath = path.resolve(this.directory, entryPoint);
      if (fs.existsSync(entryPath)) {
        return entryPath;
      }
    }

    // Strategy 3: Look for any TypeScript file in src directory
    const srcDir = path.join(this.directory, "src");
    if (fs.existsSync(srcDir)) {
      const tsFiles = fs
        .readdirSync(srcDir)
        .filter((file) => file.endsWith(".ts"));
      if (tsFiles.length > 0) {
        const firstTsFile = path.join(srcDir, tsFiles[0]);
        console.log(
          chalk.yellow(`  ⚠️  Using first TypeScript file found: ${tsFiles[0]}`)
        );
        return firstTsFile;
      }
    }

    // Fallback: throw descriptive error
    throw new Error(
      `Could not determine entry point for bundling. Tried:\n` +
        `  • Following package.json main field: ${
          mainField || "not specified"
        }\n` +
        `  • Common entry points: ${commonEntryPoints.join(", ")}\n` +
        `  • Files in src/ directory\n\n` +
        `Please ensure your project has a valid entry point or fix the "main" field in package.json.`
    );
  }

  /**
   * Upload files using form data
   */
  private async uploadFiles(): Promise<void> {
    console.log(chalk.yellow("📤 Uploading plugin files..."));

    const filesToUpload = [
      { path: "dist/bundle.js", fieldName: "bundle" },
      { path: "manifest.json", fieldName: "manifest" },
      { path: "icon.svg", fieldName: "icon" },
    ];

    try {
      // Create form data
      const form = new FormData();

      // Add plugin metadata
      form.append("pluginName", this.packageJson.name);
      form.append("pluginVersion", this.packageJson.version);

      // Add files to form
      for (const file of filesToUpload) {
        const filePath = path.join(this.directory, file.path);
        const fileStream = fs.createReadStream(filePath);
        form.append(file.fieldName, fileStream, {
          filename: path.basename(file.path),
          contentType: this.getContentType(file.path),
        });
        console.log(chalk.blue(`  📁 Added ${file.fieldName} to upload...`));
      }

      // Upload all files at once
      console.log(chalk.blue(`  📤 Uploading to backend...`));

      const response = await axios.post(
        `${this.options.backend}/api/upload/multiple`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${this.authToken}`,
          },
          timeout: 300000, // 5 minute timeout for large files
        }
      );

      if (response.data.success) {
        console.log(chalk.green("✅ All files uploaded successfully"));

        // Send completion webhook
        await this.notifyUploadComplete(response.data.files);

        console.log(chalk.green("✅ Upload completed\n"));
      } else {
        throw new Error(
          `Upload failed: ${response.data.error || "Unknown error"}`
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error || error.message;
        throw new Error(`Upload failed: ${errorMsg}`);
      }
      throw new Error(
        `Upload failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get content type for file
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".js":
        return "application/javascript";
      case ".json":
        return "application/json";
      case ".svg":
        return "image/svg+xml";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Notify backend that upload is complete (triggers webhook to frontend)
   */
  private async notifyUploadComplete(uploadedFiles: string[]): Promise<void> {
    console.log(chalk.yellow("🔔 Notifying upload completion..."));

    try {
      await axios.post(
        `${this.options.backend}/api/publish-complete`,
        {
          pluginData: {
            name: this.packageJson.name,
            version: this.packageJson.version,
            slug: `${this.packageJson.name}:${this.packageJson.version}`,
            description: this.manifestJson.description,
            author: this.manifestJson.author,
            access: this.options.access,
            entrypointClassName: this.manifestJson.entrypointClassName,
            repository: this.packageJson.repository?.url,
            files: uploadedFiles,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(chalk.green("✅ Upload completion notified"));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Notification failed: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw error;
    }
  }
}

export default publishCommand;
