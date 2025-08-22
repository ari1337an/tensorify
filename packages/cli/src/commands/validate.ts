import { Command } from "commander";
import chalk from "chalk";
import fs from "fs";
import path from "path";

interface ValidateOptions {
  directory?: string;
  verbose?: boolean;
  json?: boolean;
  sdkVersion?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: any[];
  warnings: any[];
}

interface ValidationError {
  type: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  code?: string;
  suggestion?: string;
}

class PluginValidator {
  private directory: string;
  private options: ValidateOptions;
  private manifestJson: any;
  private packageJson: any;

  constructor(directory: string, options: ValidateOptions) {
    this.directory = path.resolve(directory);
    this.options = options;
  }

  /**
   * Main validation workflow
   */
  async validate(): Promise<ValidationResult> {
    try {
      console.log(chalk.blue(`🔍 Validating plugin at: ${this.directory}\n`));

      // Step 1: Validate prerequisites
      await this.validatePrerequisites();

      // Step 2: Build plugin for validation
      await this.buildPlugin();

      // Step 3: Validate plugin structure
      const validationResult = await this.validatePluginStructure();

      // Step 4: Display results
      this.displayResults(validationResult);

      return validationResult;
    } catch (error: any) {
      const validationResult: ValidationResult = {
        isValid: false,
        errors: [{ type: "fatal_error", message: error.message }],
        warnings: [],
      };

      if (this.options.json) {
        console.log(JSON.stringify(validationResult, null, 2));
      } else {
        console.error(chalk.red(`\n❌ Validation failed: ${error.message}`));
      }

      return validationResult;
    }
  }

  /**
   * Validate basic prerequisites
   */
  private async validatePrerequisites(): Promise<void> {
    if (this.options.verbose) {
      console.log(chalk.yellow("🔍 Validating prerequisites..."));
    }

    // Check if directory exists
    if (!fs.existsSync(this.directory)) {
      throw new Error(`Directory does not exist: ${this.directory}`);
    }

    // Check for essential files
    const essentialFiles = ["package.json"];
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

    // Load package.json
    try {
      const packageJsonPath = path.join(this.directory, "package.json");
      this.packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    } catch (error: any) {
      throw new Error(`Failed to parse package.json: ${error.message}`);
    }

    // Validate package.json has required tensorify settings
    if (!this.packageJson["tensorify-settings"]) {
      throw new Error("package.json missing 'tensorify-settings' field");
    }

    if (this.options.verbose) {
      console.log(chalk.green("✅ Prerequisites validated"));
    }
  }

  /**
   * Build plugin before validation
   */
  private async buildPlugin(): Promise<void> {
    if (this.options.verbose) {
      console.log(chalk.yellow("🔧 Building plugin..."));
    }

    try {
      // Check if package.json has a build script
      if (!this.packageJson.scripts?.build) {
        if (this.options.verbose) {
          console.log(
            chalk.yellow("⚠️  No build script found in package.json")
          );
        }
        return;
      }

      // Run the build command
      const { spawn } = await import("child_process");
      const { promisify } = await import("util");

      const buildProcess = spawn("npm", ["run", "build"], {
        cwd: this.directory,
        stdio: this.options.verbose ? "inherit" : "pipe",
      });

      // Wait for build to complete
      await new Promise<void>((resolve, reject) => {
        buildProcess.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Build failed with exit code ${code}`));
          }
        });

        buildProcess.on("error", (error) => {
          reject(new Error(`Build process error: ${error.message}`));
        });
      });

      if (this.options.verbose) {
        console.log(chalk.green("✅ Plugin built successfully"));
      }
    } catch (error: any) {
      if (this.options.verbose) {
        console.log(chalk.red(`❌ Build failed: ${error.message}`));
        console.log(
          chalk.yellow("⚠️  Continuing with validation using existing build...")
        );
      }
      // Don't throw - continue with validation using whatever build exists
    }
  }

  /**
   * Validate plugin structure and schema with precise error locations
   */
  private async validatePluginStructure(): Promise<ValidationResult> {
    if (this.options.verbose) {
      console.log(chalk.yellow("🔍 Validating plugin structure..."));
    }

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Generate manifest.json from package.json and capture SDK validation errors
      const manifestResult = await this.generateManifestFromPackageJson();
      const hasSDKValidationError = !!manifestResult.error;

      if (manifestResult.error) {
        errors.push(manifestResult.error);
      }

      // Check if plugin was built successfully (should be built automatically now)
      const builtPath = path.join(this.directory, "dist/index.js");
      if (!fs.existsSync(builtPath)) {
        warnings.push({
          type: "build_warning",
          message:
            "Plugin build output not found - some validations may be incomplete.",
        });
      }

      // Only run additional validation checks if we don't already have a clear SDK validation error
      if (!hasSDKValidationError) {
        // Analyze source files for precise error locations
        await this.analyzeSourceFiles(errors, warnings);

        // Check if this is a variable provider plugin that doesn't need prev/next handles
        const pluginType = (this.manifestJson.pluginType || "").toLowerCase();
        const isVariableProvider = ["dataset", "dataloader"].includes(
          pluginType
        );

        if (!isVariableProvider) {
          // For non-variable providers, validate prev/next handles
          const inputHandles = this.manifestJson.inputHandles || [];
          const outputHandles = this.manifestJson.outputHandles || [];

          const hasPrev = inputHandles.some(
            (h: any) =>
              h.id === "prev" && h.position === "left" && h.required === true
          );
          const hasNext = outputHandles.some(
            (h: any) => h.id === "next" && h.position === "right"
          );

          if (!hasPrev) {
            const sourceFile = path.join(this.directory, "src/index.ts");
            const handleError = await this.findInputHandleError(sourceFile);
            errors.push({
              type: "schema_error",
              message: "Missing required 'prev' input handle",
              file: handleError.file,
              line: handleError.line,
              code: handleError.code,
              suggestion: handleError.suggestion,
            });
          }
          if (!hasNext) {
            const sourceFile = path.join(this.directory, "src/index.ts");
            const handleError = await this.findOutputHandleError(sourceFile);
            errors.push({
              type: "schema_error",
              message: "Missing required 'next' output handle",
              file: handleError.file,
              line: handleError.line,
              code: handleError.code,
              suggestion: handleError.suggestion,
            });
          }
        }

        // Validate using SDK contracts (with flexible validation for variable providers)
        try {
          const { normalizeUiManifest } = await import(
            "@tensorify.io/sdk/contracts"
          );

          const uiManifest = normalizeUiManifest({
            name: this.manifestJson.name,
            version: this.manifestJson.version,
            description: this.manifestJson.description,
            author: this.manifestJson.author,
            main: this.manifestJson.main,
            entrypointClassName: this.manifestJson.entrypointClassName,
            keywords: this.manifestJson.keywords,
            pluginType: this.manifestJson.pluginType,
            frontendConfigs: {
              id: this.manifestJson.name,
              name: this.manifestJson.name,
              category: this.manifestJson.pluginType,
              nodeType: this.manifestJson.pluginType,
              visual: this.manifestJson.visual,
              inputHandles: this.manifestJson.inputHandles || [],
              outputHandles: this.manifestJson.outputHandles || [],
              settingsFields: this.manifestJson.settingsFields || [],
              settingsGroups: this.manifestJson.settingsGroups || [],
            },
            capabilities: this.manifestJson.capabilities || [],
            requirements: this.manifestJson.requirements || {},
          } as any);

          // Use result to avoid TS unused var
          if (!uiManifest) throw new Error("Manifest normalization failed");
        } catch (e: any) {
          const message =
            e?.issues?.map((i: any) => i.message).join(", ") || e?.message;

          // Don't add prev/next handle errors if they're already handled above
          if (
            !message.includes("input handle 'prev'") &&
            !message.includes("output handle 'next'")
          ) {
            // Find precise location of schema errors in source
            const sourceError = await this.findSchemaErrorLocation(message);
            errors.push({
              type: "schema_error",
              message: this.cleanErrorMessage(message),
              file: sourceError.file,
              line: sourceError.line,
              code: sourceError.code,
              suggestion: sourceError.suggestion,
            });
          }
        }
      } // Close the if (!hasSDKValidationError) block

      // These validations should always run regardless of SDK validation errors

      // Validate SDK version compatibility
      if (this.options.sdkVersion) {
        const currentSdkVersion =
          this.packageJson["tensorify-settings"]?.["sdk-version"];
        if (currentSdkVersion !== this.options.sdkVersion) {
          warnings.push({
            type: "version_warning",
            message: `Plugin uses SDK version ${currentSdkVersion}, but validation requested for ${this.options.sdkVersion}`,
            file: "package.json",
            line: await this.findPackageJsonLine("sdk-version"),
          });
        }
      }

      // Check for required files (only if we don't have SDK validation errors to avoid clutter)
      if (!hasSDKValidationError) {
        const requiredFiles = ["src/index.ts"];
        const optionalFiles = ["icon.svg", "README.md"];

        requiredFiles.forEach((file) => {
          if (!fs.existsSync(path.join(this.directory, file))) {
            errors.push({
              type: "missing_file",
              message: `Required file missing: ${file}`,
              file: file,
              suggestion: this.getFileSuggestion(file),
            });
          }
        });

        optionalFiles.forEach((file) => {
          if (!fs.existsSync(path.join(this.directory, file))) {
            warnings.push({
              type: "missing_optional_file",
              message: `Optional file missing: ${file}`,
              file: file,
              suggestion: this.getFileSuggestion(file),
            });
          }
        });
      }
    } catch (error: any) {
      errors.push({
        type: "validation_error",
        message: `Validation failed: ${error.message}`,
      });
    }

    const validationResult: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
    };

    if (this.options.verbose) {
      if (validationResult.isValid) {
        console.log(chalk.green("✅ Plugin structure validated"));
      } else {
        console.log(chalk.red("❌ Plugin structure validation failed"));
      }
    }

    return validationResult;
  }

  /**
   * Generate manifest.json from package.json
   */
  private async generateManifestFromPackageJson(): Promise<{
    error?: ValidationError;
  }> {
    const tensorifySettings = this.packageJson["tensorify-settings"];

    this.manifestJson = {
      name: this.packageJson.name,
      version: this.packageJson.version,
      description: this.packageJson.description || "",
      author: this.packageJson.author || "",
      main: this.packageJson.main || "dist/index.js",
      entrypointClassName: tensorifySettings.entrypointClassName,
      keywords: this.packageJson.keywords || [],
      pluginType: tensorifySettings.pluginType?.toLowerCase() || "custom", // Normalize to lowercase
      capabilities: [],
      requirements: {},
      inputHandles: [],
      outputHandles: [],
      settingsFields: [],
      settingsGroups: [],
      visual: {},
    };

    // Load built plugin to extract configuration
    try {
      const builtPath = path.join(this.directory, "dist/index.js");
      if (fs.existsSync(builtPath)) {
        const pluginModule = await import(builtPath);
        const PluginClass = pluginModule.default;

        if (PluginClass) {
          const pluginInstance = new PluginClass();
          const definition = pluginInstance.getDefinition();

          // Extract configuration from plugin definition
          if (definition.visual) {
            this.manifestJson.visual = definition.visual;
          }
          if (definition.inputHandles) {
            this.manifestJson.inputHandles = definition.inputHandles;
          }
          if (definition.outputHandles) {
            this.manifestJson.outputHandles = definition.outputHandles;
          }
          if (definition.settings?.fields) {
            this.manifestJson.settingsFields = definition.settings.fields;
          }
          if (definition.settings?.groups) {
            this.manifestJson.settingsGroups = definition.settings.groups;
          }
          if (definition.capabilities) {
            this.manifestJson.capabilities = definition.capabilities;
          }
          if (definition.requirements) {
            this.manifestJson.requirements = definition.requirements;
          }
          if (definition.nodeType) {
            this.manifestJson.nodeType = definition.nodeType;
          }
        }
      }
    } catch (error: any) {
      if (this.options.verbose) {
        console.log(chalk.yellow(`⚠️  Could not load built plugin: ${error}`));
        console.log(
          chalk.gray("  This is normal if the plugin hasn't been built yet")
        );
      }

      // Check if this is a meaningful SDK validation error
      const errorMessage = error?.message || error?.toString() || "";
      if (
        errorMessage.includes("Plugin definition validation failed") ||
        errorMessage.includes("Plugin must define")
      ) {
        // This is a real SDK validation error, not just a build issue
        return {
          error: {
            type: "sdk_validation_error",
            message: this.extractSDKValidationError(errorMessage),
            file: "src/index.ts",
            line: await this.findPluginDefinitionLine(),
            code: await this.getPluginDefinitionCode(),
            suggestion: this.getSDKValidationSuggestion(errorMessage),
          },
        };
      }
      // Built plugin not available, will validate against static config
    }

    return {};
  }

  /**
   * Display validation results with beautiful, developer-friendly formatting
   */
  private displayResults(validationResult: ValidationResult): void {
    if (this.options.json) {
      console.log(JSON.stringify(validationResult, null, 2));
      return;
    }

    console.log(); // Empty line for better spacing

    if (validationResult.isValid) {
      // Success case
      console.log(chalk.green("🎉 Plugin validation passed!"));
      console.log(chalk.gray("   Your plugin is ready to publish"));

      if (validationResult.warnings.length > 0) {
        console.log(chalk.yellow("\n⚠️  Warnings (optional improvements):"));
        console.log(
          chalk.gray("┌─────────────────────────────────────────────────────")
        );
        validationResult.warnings.forEach((warning, index) => {
          this.displayFormattedWarning(warning, index + 1);
        });
        console.log(
          chalk.gray("└─────────────────────────────────────────────────────")
        );
      }
    } else {
      // Error case
      console.log(chalk.red("❌ Plugin validation failed"));
      console.log(chalk.gray("   Please fix the following issues to continue"));

      if (validationResult.errors.length > 0) {
        console.log(chalk.red("\n🔧 Issues that need to be fixed:"));
        console.log(
          chalk.gray("┌─────────────────────────────────────────────────────")
        );
        validationResult.errors.forEach((error, index) => {
          this.displayFormattedError(error, index + 1);
        });
        console.log(
          chalk.gray("└─────────────────────────────────────────────────────")
        );
      }

      if (validationResult.warnings.length > 0) {
        console.log(chalk.yellow("\n⚠️  Additional warnings:"));
        console.log(
          chalk.gray("┌─────────────────────────────────────────────────────")
        );
        validationResult.warnings.forEach((warning, index) => {
          this.displayFormattedWarning(warning, index + 1);
        });
        console.log(
          chalk.gray("└─────────────────────────────────────────────────────")
        );
      }

      // Show next steps
      console.log(chalk.blue("\n💡 Next steps:"));
      console.log(chalk.gray("   1. Fix the issues above"));
      console.log(chalk.gray("   2. Run 'tensorify validate' again to verify"));
      console.log(
        chalk.gray("   3. Use 'tensorify publish' when validation passes")
      );
    }

    console.log(); // Empty line at the end
  }

  /**
   * Display a beautifully formatted error with actionable solutions and precise locations
   */
  private displayFormattedError(error: ValidationError, index: number): void {
    const { type, message, file, line, code, suggestion } = error;

    // Display error header with file location
    if (file && line) {
      console.log(
        chalk.red(`│  ${index}. ${this.getErrorTitle(type, message)}`)
      );
      console.log(chalk.gray(`│     📍 ${file}:${line}`));

      if (code) {
        console.log(chalk.gray("│     "));
        console.log(chalk.gray("│     Current code:"));
        console.log(chalk.red(`│     ${line}  │ ${code}`));
      }

      if (suggestion) {
        console.log(chalk.gray("│     "));
        console.log(chalk.green("│     ✅ Suggested fix:"));
        if (suggestion.includes("\n")) {
          // Multi-line suggestion
          suggestion.split("\n").forEach((suggestionLine) => {
            console.log(chalk.green(`│        ${suggestionLine}`));
          });
        } else {
          console.log(chalk.green(`│        ${suggestion}`));
        }
      }
    } else {
      // Fallback to legacy display for errors without location
      if (type === "schema_error") {
        this.displaySchemaError(message, index);
      } else if (type === "missing_file") {
        this.displayMissingFileError(message, index);
      } else if (type === "validation_error") {
        this.displayValidationError(message, index);
      } else {
        console.log(chalk.red(`│  ${index}. ${message}`));
      }
    }

    console.log(chalk.gray("│     "));
  }

  /**
   * Display schema validation errors with human-friendly explanations
   */
  private displaySchemaError(message: string, index: number): void {
    if (message.includes("Invalid enum value")) {
      // Parse enum validation errors
      if (
        message.includes("received 'SEQUENCE'") ||
        message.includes("received 'DATASET'") ||
        message.includes("received 'DATALOADER'") ||
        message.includes("received 'MODEL_LAYER'") ||
        message.includes("received 'CUSTOM'")
      ) {
        const receivedValue =
          message.match(/received '([^']+)'/)?.[1] || "UNKNOWN";
        const expectedValue = receivedValue.toLowerCase();

        console.log(chalk.red(`│  ${index}. Plugin type casing issue`));
        console.log(
          chalk.gray("│     Problem: Your plugin uses uppercase enum values")
        );
        console.log(
          chalk.gray(
            "│     Solution: Update your plugin code to use lowercase strings:"
          )
        );
        console.log(chalk.cyan("│              "));
        console.log(chalk.cyan(`│              // ❌ Wrong (uppercase enum)`));
        console.log(chalk.cyan(`│              NodeType.${receivedValue}`));
        console.log(chalk.cyan("│              "));
        console.log(
          chalk.cyan(`│              // ✅ Correct (lowercase string)`)
        );
        console.log(chalk.cyan(`│              "${expectedValue}"`));
        console.log(chalk.gray("│     "));
      } else if (
        message.includes("received 'DEFAULT'") ||
        message.includes("received 'LUCIDE'")
      ) {
        console.log(
          chalk.red(`│  ${index}. Visual configuration casing issue`)
        );
        console.log(
          chalk.gray("│     Problem: Visual config uses uppercase enum values")
        );
        console.log(
          chalk.gray(
            "│     Solution: Use lowercase strings in your visual config:"
          )
        );
        console.log(chalk.cyan("│              "));
        console.log(chalk.cyan("│              // ❌ Wrong"));
        console.log(
          chalk.cyan(
            "│              IconType.LUCIDE, NodeViewContainerType.DEFAULT"
          )
        );
        console.log(chalk.cyan("│              "));
        console.log(chalk.cyan("│              // ✅ Correct"));
        console.log(chalk.cyan('│              "lucide", "default"'));
        console.log(chalk.gray("│     "));
      } else {
        console.log(chalk.red(`│  ${index}. Invalid configuration value`));
        console.log(
          chalk.gray(`│     Problem: ${this.extractEnumError(message)}`)
        );
        console.log(
          chalk.gray("│     Solution: Use one of the valid values listed above")
        );
        console.log(chalk.gray("│     "));
      }
    } else if (message.includes("input handle 'prev'")) {
      console.log(chalk.red(`│  ${index}. Missing required input handle`));
      console.log(
        chalk.gray("│     Problem: Your plugin needs a 'prev' input handle")
      );
      console.log(
        chalk.gray("│     Solution: Add this to your inputHandles array:")
      );
      console.log(chalk.cyan("│              "));
      console.log(chalk.cyan("│              {"));
      console.log(chalk.cyan('│                id: "prev",'));
      console.log(chalk.cyan('│                position: "left",'));
      console.log(chalk.cyan("│                required: true,"));
      console.log(chalk.cyan("│                // ... other properties"));
      console.log(chalk.cyan("│              }"));
      console.log(chalk.gray("│     "));
    } else if (message.includes("output handle 'next'")) {
      console.log(chalk.red(`│  ${index}. Missing required output handle`));
      console.log(
        chalk.gray("│     Problem: Your plugin needs a 'next' output handle")
      );
      console.log(
        chalk.gray("│     Solution: Add this to your outputHandles array:")
      );
      console.log(chalk.cyan("│              "));
      console.log(chalk.cyan("│              {"));
      console.log(chalk.cyan('│                id: "next",'));
      console.log(chalk.cyan('│                position: "right",'));
      console.log(chalk.cyan("│                // ... other properties"));
      console.log(chalk.cyan("│              }"));
      console.log(chalk.gray("│     "));
    } else {
      console.log(chalk.red(`│  ${index}. Schema validation error`));
      console.log(chalk.gray(`│     ${message}`));
      console.log(chalk.gray("│     "));
    }
  }

  /**
   * Display missing file errors
   */
  private displayMissingFileError(message: string, index: number): void {
    const fileName = message
      .replace("Required file missing: ", "")
      .replace("Optional file missing: ", "");
    const isRequired = message.includes("Required");

    console.log(
      chalk.red(
        `│  ${index}. Missing ${isRequired ? "required" : "optional"} file: ${fileName}`
      )
    );

    if (fileName === "src/index.ts") {
      console.log(
        chalk.gray("│     Problem: Main plugin source file is missing")
      );
      console.log(
        chalk.gray("│     Solution: Create src/index.ts with your plugin class")
      );
      console.log(chalk.cyan("│              "));
      console.log(
        chalk.cyan(
          "│              import { TensorifyPlugin } from '@tensorify.io/sdk';"
        )
      );
      console.log(
        chalk.cyan(
          "│              export default class YourPlugin extends TensorifyPlugin {"
        )
      );
      console.log(chalk.cyan("│                // Your plugin implementation"));
      console.log(chalk.cyan("│              }"));
    } else if (fileName === "icon.svg") {
      console.log(
        chalk.gray("│     Problem: Plugin icon is missing (recommended)")
      );
      console.log(
        chalk.gray(
          "│     Solution: Add an icon.svg file to your plugin directory"
        )
      );
      console.log(
        chalk.gray("│     Note: This is optional but recommended for better UX")
      );
    } else if (fileName === "README.md") {
      console.log(
        chalk.gray("│     Problem: Documentation is missing (recommended)")
      );
      console.log(
        chalk.gray("│     Solution: Add a README.md with plugin documentation")
      );
    } else {
      console.log(
        chalk.gray(`│     Solution: Create the missing ${fileName} file`)
      );
    }
    console.log(chalk.gray("│     "));
  }

  /**
   * Display general validation errors
   */
  private displayValidationError(message: string, index: number): void {
    console.log(chalk.red(`│  ${index}. Validation error`));
    console.log(chalk.gray(`│     ${message}`));
    console.log(chalk.gray("│     "));
  }

  /**
   * Display formatted warning with file location details
   */
  private displayFormattedWarning(
    warning: ValidationError,
    index: number
  ): void {
    const { type, message, file, line, suggestion } = warning;

    // Display warning header with file location if available
    if (file && line) {
      console.log(
        chalk.yellow(`│  ${index}. ${this.getWarningTitle(type, message)}`)
      );
      console.log(chalk.gray(`│     📍 ${file}:${line}`));

      if (suggestion) {
        console.log(chalk.gray("│     "));
        console.log(chalk.cyan("│     💡 Suggestion:"));
        console.log(chalk.cyan(`│        ${suggestion}`));
      }
    } else {
      // Fallback to legacy warning display
      if (type === "version_warning") {
        console.log(chalk.yellow(`│  ${index}. SDK version mismatch`));
        console.log(chalk.gray(`│     ${message}`));
      } else if (type === "build_warning") {
        console.log(chalk.yellow(`│  ${index}. Plugin build output missing`));
        console.log(
          chalk.gray(
            "│     Build output not found despite automatic build attempt"
          )
        );
        console.log(
          chalk.gray(
            "│     Check your build script or run 'npm run build' manually"
          )
        );
      } else if (type === "missing_optional_file") {
        const fileName = message.replace("Optional file missing: ", "");
        console.log(
          chalk.yellow(`│  ${index}. Missing recommended file: ${fileName}`)
        );
        if (fileName === "icon.svg") {
          console.log(
            chalk.gray("│     Adding an icon improves your plugin's appearance")
          );
        } else if (fileName === "README.md") {
          console.log(
            chalk.gray(
              "│     Documentation helps other developers use your plugin"
            )
          );
        }
        if (suggestion) {
          console.log(chalk.cyan(`│     💡 ${suggestion}`));
        }
      } else {
        console.log(chalk.yellow(`│  ${index}. ${message}`));
      }
    }
    console.log(chalk.gray("│     "));
  }

  /**
   * Get user-friendly error title based on error type and message
   */
  private getErrorTitle(type: string, message: string): string {
    if (type === "schema_error") {
      if (message.includes("Invalid enum value")) {
        return "Enum casing issue";
      } else if (message.includes("Missing required")) {
        return "Missing required configuration";
      } else if (message.includes("Container type")) {
        return "Visual configuration issue";
      } else if (message.includes("Icon type")) {
        return "Icon configuration issue";
      }
      return "Configuration error";
    } else if (type === "missing_file") {
      return "Missing file";
    } else if (type === "validation_error") {
      return "Validation error";
    }
    return "Error";
  }

  /**
   * Get user-friendly warning title based on warning type and message
   */
  private getWarningTitle(type: string, message: string): string {
    if (type === "version_warning") {
      return "SDK version mismatch";
    } else if (type === "build_warning") {
      return "Plugin not built";
    } else if (type === "missing_optional_file") {
      return "Missing recommended file";
    }
    return "Warning";
  }

  /**
   * Extract readable error from complex enum validation messages
   */
  private extractEnumError(message: string): string {
    if (message.includes("Expected") && message.includes("received")) {
      const expectedMatch = message.match(/Expected '([^']+)'/);
      const receivedMatch = message.match(/received '([^']+)'/);

      if (expectedMatch && receivedMatch) {
        return `Expected one of the valid values, but got '${receivedMatch[1]}'`;
      }
    }
    return message.split(",")[0]; // Return first part if we can't parse it
  }

  /**
   * Analyze source files for common validation issues
   */
  private async analyzeSourceFiles(
    errors: ValidationError[],
    warnings: ValidationError[]
  ): Promise<void> {
    const sourceFile = path.join(this.directory, "src/index.ts");

    if (!fs.existsSync(sourceFile)) {
      return; // File doesn't exist, will be caught by missing file check
    }

    try {
      const sourceContent = fs.readFileSync(sourceFile, "utf-8");
      const lines = sourceContent.split("\n");

      // Look for common enum casing issues
      await this.findEnumCasingIssues(sourceFile, lines, errors);

      // Look for plugin type issues
      await this.findPluginTypeIssues(sourceFile, lines, errors);

      // Look for visual configuration issues
      await this.findVisualConfigIssues(sourceFile, lines, errors);
    } catch (error) {
      if (this.options.verbose) {
        console.log(
          chalk.yellow(`⚠️  Could not analyze source file: ${error}`)
        );
      }
    }
  }

  /**
   * Find enum casing issues in source code
   */
  private async findEnumCasingIssues(
    file: string,
    lines: string[],
    errors: ValidationError[]
  ): Promise<void> {
    // NOTE: The SDK enums are correctly defined with lowercase values!
    // NodeViewContainerType.DEFAULT = "default" ✅
    // IconType.LUCIDE = "lucide" ✅
    // SettingsUIType.INPUT_TEXT = "input-text" ✅
    //
    // We should NOT flag these as errors since they compile to the correct values.
    // Only flag actual problematic patterns where uppercase strings are used directly.

    lines.forEach((line, index) => {
      // Only flag direct uppercase string usage, not enum constants
      const problematicPatterns = [
        {
          pattern: /"(SEQUENCE|DATASET|DATALOADER|MODEL_LAYER|CUSTOM)"/g,
          type: "direct string usage",
        },
        {
          pattern: /"(LUCIDE|SVG|FONTAWESOME)"/g,
          type: "direct string usage",
        },
        {
          pattern: /"(DEFAULT|BOX|CIRCLE|LEFT_ROUND)"/g,
          type: "direct string usage",
        },
        {
          pattern: /"(INPUT_TEXT|TOGGLE|INPUT_NUMBER|TEXTAREA|SLIDER)"/g,
          type: "direct string usage",
        },
        {
          pattern: /"(STRING|BOOLEAN|NUMBER|ARRAY|OBJECT)"/g,
          type: "direct string usage",
        },
      ];

      problematicPatterns.forEach(({ pattern, type }) => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach((match) => {
          const enumValue = match[1];
          const expectedValue = this.getCorrectEnumValue(enumValue);
          const column = match.index || 0;

          errors.push({
            type: "schema_error",
            message: `Invalid direct string usage: Expected '${expectedValue}', got '"${enumValue}"'`,
            file: path.relative(this.directory, file),
            line: index + 1,
            column: column + 1,
            code: line.trim(),
            suggestion: line
              .replace(`"${enumValue}"`, `"${expectedValue}"`)
              .trim(),
          });
        });
      });
    });
  }

  /**
   * Get the correct lowercase value for an enum
   */
  private getCorrectEnumValue(enumValue: string): string {
    // Map uppercase enum names to their correct lowercase values
    const enumMap: Record<string, string> = {
      // NodeType
      SEQUENCE: "sequence",
      DATASET: "dataset",
      DATALOADER: "dataloader",
      MODEL_LAYER: "model_layer",
      CUSTOM: "custom",

      // IconType
      LUCIDE: "lucide",
      SVG: "svg",
      FONTAWESOME: "fontawesome",

      // NodeViewContainerType
      DEFAULT: "default",
      BOX: "box",
      CIRCLE: "circle",
      LEFT_ROUND: "left-round",

      // SettingsUIType
      INPUT_TEXT: "input-text",
      TOGGLE: "toggle",
      INPUT_NUMBER: "input-number",
      TEXTAREA: "textarea",
      SLIDER: "slider",

      // SettingsDataType
      STRING: "string",
      BOOLEAN: "boolean",
      NUMBER: "number",
      ARRAY: "array",
      OBJECT: "object",
    };

    return enumMap[enumValue] || enumValue.toLowerCase();
  }

  /**
   * Find plugin type configuration issues
   */
  private async findPluginTypeIssues(
    file: string,
    lines: string[],
    errors: ValidationError[]
  ): Promise<void> {
    // Look for pluginType in package.json
    const packageJsonPath = path.join(this.directory, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageContent = fs.readFileSync(packageJsonPath, "utf-8");
        const packageLines = packageContent.split("\n");

        packageLines.forEach((line, index) => {
          // Check for pluginType definition
          if (line.includes('"pluginType"') && line.includes(":")) {
            // Extract the plugin type value
            const match = line.match(/"pluginType"\s*:\s*"([^"]+)"/);
            if (match) {
              const pluginTypeValue = match[1];
              const lowercaseValue = pluginTypeValue.toLowerCase();

              // List of valid plugin types (lowercase)
              const validTypes = [
                "custom",
                "trainer",
                "evaluator",
                "model",
                "model_layer",
                "sequence",
                "dataset",
                "dataloader",
                "preprocessor",
                "postprocessor",
                "augmentation_stack",
                "optimizer",
                "loss_function",
                "metric",
                "scheduler",
                "regularizer",
                "function",
                "pipeline",
                "report",
              ];

              // Check if the lowercased value is valid
              if (!validTypes.includes(lowercaseValue)) {
                errors.push({
                  type: "schema_error",
                  message: `Invalid plugin type: '${pluginTypeValue}'. Must be one of: ${validTypes.join(", ")}`,
                  file: "package.json",
                  line: index + 1,
                  code: line.trim(),
                  suggestion: `Check the valid plugin types and update accordingly`,
                });
              }
              // NOTE: We don't flag uppercase values as errors since the system
              // automatically lowercases them internally. Both "DATASET" and "dataset" are valid.
            }
          }
        });
      } catch (error) {
        // Ignore file read errors
      }
    }
  }

  /**
   * Find visual configuration issues
   */
  private async findVisualConfigIssues(
    file: string,
    lines: string[],
    errors: ValidationError[]
  ): Promise<void> {
    // NOTE: SDK enum usage like NodeViewContainerType.DEFAULT and IconType.LUCIDE
    // are CORRECT and compile to the right values. Don't flag these as errors!

    // Only look for actual problematic patterns, like direct uppercase string usage
    lines.forEach((line, index) => {
      // Look for direct uppercase string usage in visual config (not enum usage)
      if (line.includes("containerType:") && line.includes('"DEFAULT"')) {
        errors.push({
          type: "schema_error",
          message:
            "Container type should use lowercase: 'default' instead of 'DEFAULT'",
          file: path.relative(this.directory, file),
          line: index + 1,
          code: line.trim(),
          suggestion: line.replace('"DEFAULT"', '"default"').trim(),
        });
      }

      if (line.includes("type:") && line.includes('"LUCIDE"')) {
        errors.push({
          type: "schema_error",
          message:
            "Icon type should use lowercase: 'lucide' instead of 'LUCIDE'",
          file: path.relative(this.directory, file),
          line: index + 1,
          code: line.trim(),
          suggestion: line.replace('"LUCIDE"', '"lucide"').trim(),
        });
      }
    });
  }

  /**
   * Find input handle error location
   */
  private async findInputHandleError(sourceFile: string): Promise<any> {
    try {
      if (fs.existsSync(sourceFile)) {
        const content = fs.readFileSync(sourceFile, "utf-8");
        const lines = content.split("\n");

        // Look for inputHandles definition
        const inputHandlesLine = lines.findIndex((line) =>
          line.includes("inputHandles")
        );

        if (inputHandlesLine !== -1) {
          return {
            file: path.relative(this.directory, sourceFile),
            line: inputHandlesLine + 1,
            code: lines[inputHandlesLine].trim(),
            suggestion: `Add 'prev' handle: { id: "prev", position: "left", required: true, ... }`,
          };
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return {
      file: path.relative(this.directory, sourceFile),
      line: 1,
      code: "// Plugin definition",
      suggestion: `Add inputHandles with 'prev' handle in your plugin definition`,
    };
  }

  /**
   * Find output handle error location
   */
  private async findOutputHandleError(sourceFile: string): Promise<any> {
    try {
      if (fs.existsSync(sourceFile)) {
        const content = fs.readFileSync(sourceFile, "utf-8");
        const lines = content.split("\n");

        // Look for outputHandles definition
        const outputHandlesLine = lines.findIndex((line) =>
          line.includes("outputHandles")
        );

        if (outputHandlesLine !== -1) {
          return {
            file: path.relative(this.directory, sourceFile),
            line: outputHandlesLine + 1,
            code: lines[outputHandlesLine].trim(),
            suggestion: `Add 'next' handle: { id: "next", position: "right", ... }`,
          };
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return {
      file: path.relative(this.directory, sourceFile),
      line: 1,
      code: "// Plugin definition",
      suggestion: `Add outputHandles with 'next' handle in your plugin definition`,
    };
  }

  /**
   * Find schema error location in source
   */
  private async findSchemaErrorLocation(message: string): Promise<any> {
    const sourceFile = path.join(this.directory, "src/index.ts");

    try {
      if (fs.existsSync(sourceFile)) {
        const content = fs.readFileSync(sourceFile, "utf-8");
        const lines = content.split("\n");

        // Look for specific error patterns
        if (
          message.includes("SEQUENCE") ||
          message.includes("DATASET") ||
          message.includes("DATALOADER")
        ) {
          const line = lines.findIndex(
            (l) => l.includes("NodeType.") || l.includes("pluginType")
          );
          if (line !== -1) {
            return {
              file: path.relative(this.directory, sourceFile),
              line: line + 1,
              code: lines[line].trim(),
              suggestion: "Use lowercase string instead of enum constant",
            };
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return {
      file: path.relative(this.directory, sourceFile),
      line: 1,
      code: await this.getPluginDefinitionCode(),
      suggestion:
        "Check your plugin configuration for missing or invalid fields",
    };
  }

  /**
   * Find specific line in package.json
   */
  private async findPackageJsonLine(searchText: string): Promise<number> {
    try {
      const packageJsonPath = path.join(this.directory, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const content = fs.readFileSync(packageJsonPath, "utf-8");
        const lines = content.split("\n");
        const lineIndex = lines.findIndex((line) => line.includes(searchText));
        return lineIndex !== -1 ? lineIndex + 1 : 1;
      }
    } catch (error) {
      // Ignore errors
    }
    return 1;
  }

  /**
   * Get file creation suggestion
   */
  private getFileSuggestion(fileName: string): string {
    const suggestions: Record<string, string> = {
      "src/index.ts": "Create main plugin file with TensorifyPlugin class",
      "icon.svg": "Add plugin icon for better visual appearance",
      "README.md": "Add documentation explaining your plugin's functionality",
    };
    return suggestions[fileName] || `Create the ${fileName} file`;
  }

  /**
   * Clean error message for better readability
   */
  private cleanErrorMessage(message: string): string {
    // Extract the first meaningful error from complex validation messages
    if (message.includes("Invalid enum value")) {
      const match = message.match(
        /Invalid enum value\. Expected '([^']+)', received '([^']+)'/
      );
      if (match) {
        return `Invalid enum value: expected '${match[1]}', got '${match[2]}'`;
      }
    }
    return message.split(",")[0].trim();
  }

  /**
   * Extract meaningful SDK validation error from full error message
   */
  private extractSDKValidationError(message: string): string {
    // Extract specific validation failures
    if (message.includes("Plugin must define an input handle with id 'prev'")) {
      return "Missing required 'prev' input handle (required for non-variable-provider plugins)";
    }
    if (
      message.includes("Plugin must define an output handle with id 'next'")
    ) {
      return "Missing required 'next' output handle (required for non-variable-provider plugins)";
    }
    if (message.includes("Plugin definition validation failed")) {
      // Extract the specific validation errors after the main message
      const lines = message.split("\n");
      const validationErrors = lines
        .slice(1)
        .filter((line) => line.trim())
        .join("; ");
      return validationErrors || "Plugin definition validation failed";
    }
    return message;
  }

  /**
   * Find the line where plugin definition starts
   */
  private async findPluginDefinitionLine(): Promise<number> {
    try {
      const sourceFile = path.join(this.directory, "src/index.ts");
      if (fs.existsSync(sourceFile)) {
        const content = fs.readFileSync(sourceFile, "utf-8");
        const lines = content.split("\n");

        // Look for the plugin definition
        const definitionLine = lines.findIndex(
          (line) =>
            line.includes("const definition") ||
            line.includes("IPluginDefinition") ||
            line.includes("super(definition")
        );

        if (definitionLine !== -1) {
          return definitionLine + 1;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return 1;
  }

  /**
   * Get plugin definition code snippet
   */
  private async getPluginDefinitionCode(): Promise<string> {
    try {
      const sourceFile = path.join(this.directory, "src/index.ts");
      if (fs.existsSync(sourceFile)) {
        const content = fs.readFileSync(sourceFile, "utf-8");
        const lines = content.split("\n");

        // Look for plugin definition
        const definitionLine = lines.findIndex(
          (line) =>
            line.includes("const definition") ||
            line.includes("IPluginDefinition")
        );

        if (definitionLine !== -1) {
          return lines[definitionLine].trim();
        }

        // Fallback to class declaration
        const classLine = lines.findIndex((line) =>
          line.includes("extends TensorifyPlugin")
        );

        if (classLine !== -1) {
          return lines[classLine].trim();
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return "// Plugin definition";
  }

  /**
   * Get SDK validation suggestion based on error type
   */
  private getSDKValidationSuggestion(message: string): string {
    if (
      message.includes("input handle with id 'prev'") ||
      message.includes("output handle with id 'next'")
    ) {
      return `Add 'nodeType: NodeType.DATASET' (or other variable provider type) to your plugin definition to skip prev/next handle requirements, or add the missing handles if this is a regular plugin`;
    }
    if (message.includes("Plugin definition validation failed")) {
      return "Check your plugin definition for missing required fields or invalid values";
    }
    return "Review the SDK documentation for plugin definition requirements";
  }
}

/**
 * Create the validate command
 */
export const validateCommand = new Command("validate")
  .description("Validate plugin structure and configuration")
  .argument("[directory]", "Plugin directory path", ".")
  .option("-v, --verbose", "Show detailed validation output", false)
  .option("--sdk-version <version>", "Check against specific SDK version")
  .option("--json", "Output results in JSON format", false)
  .action(async (directory: string, options: ValidateOptions) => {
    try {
      const validator = new PluginValidator(directory, options);
      const result = await validator.validate();

      // Exit with non-zero code if validation failed
      if (!result.isValid) {
        process.exit(1);
      }
    } catch (error: any) {
      console.error(chalk.red(`\n❌ Validation error: ${error.message}`));
      process.exit(1);
    }
  });
