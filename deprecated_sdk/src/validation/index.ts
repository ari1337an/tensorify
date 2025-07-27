import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

/**
 * Zod schema for manifest.json validation
 */
export const ManifestSchema = z
  .object({
    name: z.string().min(1, "Plugin name is required"),
    version: z
      .string()
      .regex(
        /^\d+\.\d+\.\d+$/,
        "Version must follow semantic versioning (e.g., 1.0.0)"
      ),
    description: z.string().min(1, "Description is required"),
    author: z.string().min(1, "Author is required"),
    main: z.string().min(1, "Main entry point file is required"),
    entrypointClassName: z.string().min(1, "Entrypoint class name is required"),
    keywords: z.array(z.string()).min(1, "At least one keyword is required"),
    repository: z
      .object({
        type: z.literal("git"),
        url: z.string().url("Repository URL must be a valid URL"),
      })
      .optional(),
    private: z.boolean().optional().default(false),
    scripts: z
      .object({
        build: z.string().min(1, "Build script is required"),
      })
      .and(z.record(z.string(), z.string())), // Allow additional scripts
    tensorifySettings: z.object({
      sdkVersion: z.string().min(1, "SDK version is required"),
    }),
    // Allow additional fields but validate the required ones
  })
  .strict();

/**
 * Zod schema for package.json validation specifically for Tensorify plugins
 */
export const PackageJsonSchema = z
  .object({
    name: z.string().min(1, "Package name is required"),
    version: z
      .string()
      .regex(
        /^\d+\.\d+\.\d+$/,
        "Version must follow semantic versioning (e.g., 1.0.0)"
      ),
    description: z.string().optional(),
    main: z.string().min(1, "Main entry point is required"),
    author: z.string().min(1, "Author is required"),
    keywords: z.array(z.string()).min(1, "At least one keyword is required"),
    repository: z
      .object({
        type: z.literal("git"),
        url: z.string().url("Repository URL must be a valid URL"),
      })
      .optional(),
    private: z.boolean().optional().default(false),
    scripts: z
      .object({
        build: z.string().min(1, "Build script is required"),
      })
      .and(z.record(z.string(), z.string())), // Allow additional scripts
    "tensorify-settings": z.object({
      "sdk-version": z.string().min(1, "SDK version is required"),
    }),
    // Allow additional fields
  })
  .passthrough();

export interface ValidationError {
  type:
    | "missing_file"
    | "invalid_content"
    | "schema_error"
    | "interface_error"
    | "version_mismatch";
  message: string;
  file?: string;
  details?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

/**
 * Plugin validation rule set
 */
export class PluginValidator {
  private currentDirectory: string;
  private sdkVersion: string;
  private packageJson: any;
  private sourceIndexPath: string | null = null;

  constructor(directory: string = process.cwd(), sdkVersion: string = "0.0.4") {
    this.currentDirectory = directory;
    this.sdkVersion = sdkVersion;
  }

  /**
   * Determine the TypeScript source file path from package.json main field
   */
  private determineSourceIndexPath(): string | null {
    if (this.sourceIndexPath) {
      return this.sourceIndexPath;
    }

    try {
      const packagePath = path.join(this.currentDirectory, "package.json");
      if (!fs.existsSync(packagePath)) {
        return null;
      }

      this.packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
      const mainField = this.packageJson.main;

      if (!mainField) {
        return null;
      }

      // Convert main field (dist/index.js) to TypeScript source path
      // Examples:
      // "dist/index.js" -> "src/index.ts" or "index.ts"
      // "lib/index.js" -> "src/index.ts" or "index.ts"
      // "index.js" -> "index.ts"

      let possibleSourcePaths: string[] = [];

      if (mainField.includes("/")) {
        // If main field has directory structure (e.g., "dist/index.js")
        const mainName = path.basename(mainField, path.extname(mainField));

        // Try src/ directory first (most common)
        possibleSourcePaths.push(`src/${mainName}.ts`);

        // Try replacing the output directory with src
        const mainDir = path.dirname(mainField);
        possibleSourcePaths.push(`src/${mainName}.ts`);

        // Try root directory
        possibleSourcePaths.push(`${mainName}.ts`);
      } else {
        // If main field is just filename (e.g., "index.js")
        const mainName = path.basename(mainField, path.extname(mainField));

        // Try src/ directory first
        possibleSourcePaths.push(`src/${mainName}.ts`);

        // Try root directory
        possibleSourcePaths.push(`${mainName}.ts`);
      }

      // Find the first existing source file
      for (const sourcePath of possibleSourcePaths) {
        const fullSourcePath = path.join(this.currentDirectory, sourcePath);
        if (fs.existsSync(fullSourcePath)) {
          this.sourceIndexPath = sourcePath;
          return sourcePath;
        }
      }

      // Fallback: if no TypeScript file found, return null
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate all plugin requirements
   */
  async validatePlugin(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // 1. Check required files
    const fileCheckResult = this.checkRequiredFiles();
    errors.push(...fileCheckResult.errors);

    if (fileCheckResult.valid) {
      // 2. Validate manifest.json (optional - only if file exists)
      let manifestResult: ValidationResult = { valid: true, errors: [] };
      const manifestPath = path.join(this.currentDirectory, "manifest.json");
      if (fs.existsSync(manifestPath)) {
        manifestResult = await this.validateManifest();
        errors.push(...manifestResult.errors);
      }

      // 3. Validate package.json
      const packageResult = await this.validatePackageJson();
      errors.push(...packageResult.errors);

      // 4. Validate index.ts structure
      const indexResult = await this.validateIndexTs();
      errors.push(...indexResult.errors);

      // 5. Validate class implementation
      if (manifestResult.valid && indexResult.valid) {
        const classResult = await this.validateClassImplementation();
        errors.push(...classResult.errors);
      }

      // 6. Validate SDK version compatibility
      if (packageResult.valid) {
        const versionResult = this.validateSdkVersion();
        errors.push(...versionResult.errors);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if required files exist
   */
  private checkRequiredFiles(): ValidationResult {
    const errors: ValidationError[] = [];

    // Check for package.json first (needed to determine source index path)
    const packagePath = path.join(this.currentDirectory, "package.json");
    if (!fs.existsSync(packagePath)) {
      errors.push({
        type: "missing_file",
        message: "Required file missing: package.json",
        file: "package.json",
      });
    }

    // Determine TypeScript source file path dynamically
    const sourceIndexPath = this.determineSourceIndexPath();

    // Check for TypeScript source file
    if (!sourceIndexPath) {
      // Fallback: try common locations
      const commonLocations = ["src/index.ts", "index.ts"];
      let found = false;

      for (const location of commonLocations) {
        const filePath = path.join(this.currentDirectory, location);
        if (fs.existsSync(filePath)) {
          this.sourceIndexPath = location;
          found = true;
          break;
        }
      }

      if (!found) {
        errors.push({
          type: "missing_file",
          message:
            "Required TypeScript source file missing. Expected src/index.ts or index.ts based on package.json main field",
          file: "index.ts",
        });
      }
    }

    // Check other required files
    const otherRequiredFiles = ["icon.svg"];
    for (const file of otherRequiredFiles) {
      const filePath = path.join(this.currentDirectory, file);
      if (!fs.existsSync(filePath)) {
        errors.push({
          type: "missing_file",
          message: `Required file missing: ${file}`,
          file,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate manifest.json against schema
   */
  private async validateManifest(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const manifestPath = path.join(this.currentDirectory, "manifest.json");

    try {
      const manifestContent = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(manifestContent);

      // Validate against schema
      ManifestSchema.parse(manifest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push({
          type: "schema_error",
          message: `Manifest validation failed: ${error.issues
            .map((e: any) => e.message)
            .join(", ")}`,
          file: "manifest.json",
          details: error.issues,
        });
      } else {
        errors.push({
          type: "invalid_content",
          message: `Failed to parse manifest.json: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          file: "manifest.json",
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate package.json structure
   */
  private async validatePackageJson(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const packagePath = path.join(this.currentDirectory, "package.json");

    try {
      if (!fs.existsSync(packagePath)) {
        errors.push({
          type: "missing_file",
          message: "package.json file is required",
          file: "package.json",
        });
        return { valid: false, errors };
      }

      // Use cached packageJson if available, otherwise read it
      let packageJson = this.packageJson;
      if (!packageJson) {
        const packageContent = fs.readFileSync(packagePath, "utf-8");
        packageJson = JSON.parse(packageContent);
        this.packageJson = packageJson;
      }

      // Validate against schema
      const result = PackageJsonSchema.safeParse(packageJson);
      if (!result.success) {
        errors.push({
          type: "schema_error",
          message: `Package.json validation failed: ${result.error.issues
            .map((e: any) => e.message)
            .join(", ")}`,
          file: "package.json",
          details: result.error.issues,
        });
      }

      // Additional validation for private/public consistency
      if (packageJson.private === false && !packageJson.repository) {
        errors.push({
          type: "schema_error",
          message: "Public plugins must have a repository URL in package.json",
          file: "package.json",
        });
      }

      // Validate that main field points to a valid output location
      if (packageJson.main) {
        const mainPath = path.join(this.currentDirectory, packageJson.main);
        const mainDir = path.dirname(mainPath);

        // Check if the output directory exists or can be created (not requiring the actual built file)
        // This is important for validation before build
        if (!fs.existsSync(mainDir)) {
          // Only warn if it's not a standard build directory
          const buildDirs = ["dist", "lib", "build"];
          const outputDirName = path.basename(mainDir);

          if (!buildDirs.includes(outputDirName)) {
            errors.push({
              type: "schema_error",
              message: `Main field points to non-standard output directory: ${packageJson.main}. Expected output to standard build directories like dist/, lib/, or build/`,
              file: "package.json",
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        type: "invalid_content",
        message: `Failed to parse package.json: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        file: "package.json",
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate TypeScript source file has single default export
   */
  private async validateIndexTs(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Get the source index path (src/index.ts or index.ts)
    const sourceIndexPath =
      this.sourceIndexPath || this.determineSourceIndexPath();

    if (!sourceIndexPath) {
      errors.push({
        type: "missing_file",
        message:
          "Cannot find TypeScript source file. Expected src/index.ts or index.ts",
        file: "index.ts",
      });
      return { valid: false, errors };
    }

    const indexPath = path.join(this.currentDirectory, sourceIndexPath);

    try {
      const indexContent = fs.readFileSync(indexPath, "utf-8");

      // Check for default export class
      const defaultExportRegex = /export\s+default\s+class\s+(\w+)/;
      const match = indexContent.match(defaultExportRegex);

      if (!match) {
        errors.push({
          type: "invalid_content",
          message: `${sourceIndexPath} must have a single default class export`,
          file: sourceIndexPath,
        });
      }
    } catch (error) {
      errors.push({
        type: "invalid_content",
        message: `Failed to read ${sourceIndexPath}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        file: sourceIndexPath,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate class implementation matches manifest and implements INode
   */
  private async validateClassImplementation(): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    try {
      // Get expected class name from manifest.json or package.json
      let manifest: any = {};
      const manifestPath = path.join(this.currentDirectory, "manifest.json");

      if (fs.existsSync(manifestPath)) {
        // Use manifest.json if it exists
        const manifestContent = fs.readFileSync(manifestPath, "utf-8");
        manifest = JSON.parse(manifestContent);
      } else {
        // Generate manifest from package.json if manifest.json doesn't exist
        const packagePath = path.join(this.currentDirectory, "package.json");
        const packageContent = fs.readFileSync(packagePath, "utf-8");
        const packageJson = JSON.parse(packageContent);
        const tensorifySettings = packageJson["tensorify-settings"] || {};

        manifest = {
          entrypointClassName:
            tensorifySettings.entrypointClassName || "TensorifyPlugin",
        };
      }

      // Get the source index path (src/index.ts or index.ts)
      const sourceIndexPath =
        this.sourceIndexPath || this.determineSourceIndexPath();

      if (!sourceIndexPath) {
        errors.push({
          type: "interface_error",
          message:
            "Cannot find TypeScript source file to validate class implementation",
          file: "index.ts",
        });
        return { valid: false, errors };
      }

      // Read TypeScript source file to check class name
      const indexPath = path.join(this.currentDirectory, sourceIndexPath);
      const indexContent = fs.readFileSync(indexPath, "utf-8");

      // Extract class name from TypeScript source
      const defaultExportRegex = /export\s+default\s+class\s+(\w+)/;
      const match = indexContent.match(defaultExportRegex);

      if (match) {
        const actualClassName = match[1];
        const expectedClassName = manifest.entrypointClassName;

        if (actualClassName !== expectedClassName) {
          errors.push({
            type: "interface_error",
            message: `Class name mismatch. Expected "${expectedClassName}" from manifest.json, but found "${actualClassName}" in ${sourceIndexPath}`,
            file: sourceIndexPath,
          });
        }
      }

      // Check for proper SDK imports
      const requiredImports = [
        { name: "INode", type: "interface" },
        { name: "ModelLayerNode", type: "class" },
        { name: "ModelLayerSettings", type: "interface" },
        { name: "NodeType", type: "type" },
      ];

      const missingImports = requiredImports.filter((imp) => {
        const importRegex = new RegExp(
          `import\\s*{[^}]*\\b${imp.name}\\b[^}]*}\\s*from\\s*["']@tensorify\\.io/sdk["']`
        );
        return !importRegex.test(indexContent);
      });

      if (missingImports.length > 0) {
        errors.push({
          type: "interface_error",
          message: `Missing required SDK imports: ${missingImports
            .map((imp) => imp.name)
            .join(", ")}. Please import them from "@tensorify.io/sdk"`,
          file: sourceIndexPath,
        });
      }

      // Check for INode implementation (enhanced check)
      const implementsINodeRegex = /implements\s+INode/;
      if (!implementsINodeRegex.test(indexContent)) {
        errors.push({
          type: "interface_error",
          message:
            "Exported class must implement INode interface. Example: 'class MyClass extends ModelLayerNode<MySettings> implements INode<MySettings>'",
          file: sourceIndexPath,
        });
      }

      // Check for proper base class extension
      const extendsBaseClassRegex =
        /extends\s+(ModelLayerNode|DataNode|TrainerNode|BaseNode)/;
      if (!extendsBaseClassRegex.test(indexContent)) {
        errors.push({
          type: "interface_error",
          message:
            "Exported class must extend one of the base classes: ModelLayerNode, DataNode, TrainerNode, or BaseNode",
          file: sourceIndexPath,
        });
      }
    } catch (error) {
      errors.push({
        type: "interface_error",
        message: `Failed to validate class implementation: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate SDK version compatibility
   */
  private validateSdkVersion(): ValidationResult {
    const errors: ValidationError[] = [];

    try {
      // Use cached packageJson if available, otherwise read it
      let packageJson = this.packageJson;
      if (!packageJson) {
        const packagePath = path.join(this.currentDirectory, "package.json");
        const packageContent = fs.readFileSync(packagePath, "utf-8");
        packageJson = JSON.parse(packageContent);
        this.packageJson = packageJson;
      }

      const requiredSdkVersion =
        packageJson["tensorify-settings"]?.["sdk-version"];

      if (requiredSdkVersion !== this.sdkVersion) {
        errors.push({
          type: "version_mismatch",
          message: `SDK version mismatch. Plugin requires "${requiredSdkVersion}" but current SDK is "${this.sdkVersion}"`,
          file: "package.json",
        });
      }
    } catch (error) {
      errors.push({
        type: "version_mismatch",
        message: `Failed to validate SDK version: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get detailed validation report as string
   */
  getValidationReport(result: ValidationResult): string {
    let report = "=== Plugin Validation Report ===\n\n";

    if (result.valid) {
      report += "✅ Plugin validation passed!\n";
    } else {
      report += "❌ Plugin validation failed!\n\n";
      report += "Errors:\n";

      result.errors.forEach((error, index) => {
        report += `${index + 1}. [${error.type.toUpperCase()}] ${
          error.message
        }`;
        if (error.file) {
          report += ` (in ${error.file})`;
        }
        report += "\n";
      });
    }

    if (result.warnings && result.warnings.length > 0) {
      report += "\nWarnings:\n";
      result.warnings.forEach((warning, index) => {
        report += `${index + 1}. ⚠️  ${warning}\n`;
      });
    }

    return report;
  }
}

/**
 * Convenience function to validate a plugin directory
 */
export async function validatePlugin(
  directory: string = process.cwd(),
  sdkVersion: string = "0.0.4"
): Promise<ValidationResult> {
  const validator = new PluginValidator(directory, sdkVersion);
  return await validator.validatePlugin();
}

/**
 * Export current SDK version for version checking
 * This should match the version in package.json
 */
export const CURRENT_SDK_VERSION = "0.0.4";
