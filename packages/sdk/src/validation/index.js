"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_SDK_VERSION = exports.PluginValidator = exports.PackageJsonSchema = exports.ManifestSchema = void 0;
exports.validatePlugin = validatePlugin;
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Zod schema for manifest.json validation
 */
exports.ManifestSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1, "Plugin name is required"),
    version: zod_1.z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (e.g., 1.0.0)"),
    description: zod_1.z.string().min(1, "Description is required"),
    author: zod_1.z.string().min(1, "Author is required"),
    main: zod_1.z.string().min(1, "Main entry point file is required"),
    entrypointClassName: zod_1.z.string().min(1, "Entrypoint class name is required"),
    keywords: zod_1.z.array(zod_1.z.string()).min(1, "At least one keyword is required"),
    repository: zod_1.z
        .object({
        type: zod_1.z.literal("git"),
        url: zod_1.z.string().url("Repository URL must be a valid URL"),
    })
        .optional(),
    private: zod_1.z.boolean().optional().default(false),
    scripts: zod_1.z
        .object({
        build: zod_1.z.string().min(1, "Build script is required"),
    })
        .and(zod_1.z.record(zod_1.z.string(), zod_1.z.string())), // Allow additional scripts
    tensorifySettings: zod_1.z.object({
        sdkVersion: zod_1.z.string().min(1, "SDK version is required"),
    }),
    // Allow additional fields but validate the required ones
})
    .strict();
/**
 * Zod schema for package.json validation specifically for Tensorify plugins
 */
exports.PackageJsonSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1, "Package name is required"),
    version: zod_1.z
        .string()
        .regex(/^\d+\.\d+\.\d+$/, "Version must follow semantic versioning (e.g., 1.0.0)"),
    description: zod_1.z.string().optional(),
    main: zod_1.z.string().min(1, "Main entry point is required"),
    author: zod_1.z.string().min(1, "Author is required"),
    keywords: zod_1.z.array(zod_1.z.string()).min(1, "At least one keyword is required"),
    repository: zod_1.z
        .object({
        type: zod_1.z.literal("git"),
        url: zod_1.z.string().url("Repository URL must be a valid URL"),
    })
        .optional(),
    private: zod_1.z.boolean().optional().default(false),
    scripts: zod_1.z
        .object({
        build: zod_1.z.string().min(1, "Build script is required"),
    })
        .and(zod_1.z.record(zod_1.z.string(), zod_1.z.string())), // Allow additional scripts
    "tensorify-settings": zod_1.z.object({
        "sdk-version": zod_1.z.string().min(1, "SDK version is required"),
    }),
    // Allow additional fields
})
    .passthrough();
/**
 * Plugin validation rule set
 */
class PluginValidator {
    constructor(directory = process.cwd(), sdkVersion = "0.0.1") {
        this.currentDirectory = directory;
        this.sdkVersion = sdkVersion;
    }
    /**
     * Validate all plugin requirements
     */
    async validatePlugin() {
        const errors = [];
        const warnings = [];
        // 1. Check required files
        const fileCheckResult = this.checkRequiredFiles();
        errors.push(...fileCheckResult.errors);
        if (fileCheckResult.valid) {
            // 2. Validate manifest.json
            const manifestResult = await this.validateManifest();
            errors.push(...manifestResult.errors);
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
    checkRequiredFiles() {
        const errors = [];
        const requiredFiles = ["index.ts", "manifest.json", "icon.svg"];
        for (const file of requiredFiles) {
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
    async validateManifest() {
        const errors = [];
        const manifestPath = path.join(this.currentDirectory, "manifest.json");
        try {
            const manifestContent = fs.readFileSync(manifestPath, "utf-8");
            const manifest = JSON.parse(manifestContent);
            // Validate against schema
            exports.ManifestSchema.parse(manifest);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                errors.push({
                    type: "schema_error",
                    message: `Manifest validation failed: ${error.issues
                        .map((e) => e.message)
                        .join(", ")}`,
                    file: "manifest.json",
                    details: error.issues,
                });
            }
            else {
                errors.push({
                    type: "invalid_content",
                    message: `Failed to parse manifest.json: ${error instanceof Error ? error.message : "Unknown error"}`,
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
    async validatePackageJson() {
        const errors = [];
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
            const packageContent = fs.readFileSync(packagePath, "utf-8");
            const packageJson = JSON.parse(packageContent);
            // Validate against schema
            const result = exports.PackageJsonSchema.safeParse(packageJson);
            if (!result.success) {
                errors.push({
                    type: "schema_error",
                    message: `Package.json validation failed: ${result.error.issues
                        .map((e) => e.message)
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
        }
        catch (error) {
            errors.push({
                type: "invalid_content",
                message: `Failed to parse package.json: ${error instanceof Error ? error.message : "Unknown error"}`,
                file: "package.json",
            });
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Validate index.ts has single default export
     */
    async validateIndexTs() {
        const errors = [];
        const indexPath = path.join(this.currentDirectory, "index.ts");
        try {
            const indexContent = fs.readFileSync(indexPath, "utf-8");
            // Check for default export class
            const defaultExportRegex = /export\s+default\s+class\s+(\w+)/;
            const match = indexContent.match(defaultExportRegex);
            if (!match) {
                errors.push({
                    type: "invalid_content",
                    message: "index.ts must have a single default class export",
                    file: "index.ts",
                });
            }
        }
        catch (error) {
            errors.push({
                type: "invalid_content",
                message: `Failed to read index.ts: ${error instanceof Error ? error.message : "Unknown error"}`,
                file: "index.ts",
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
    async validateClassImplementation() {
        const errors = [];
        try {
            // Read manifest to get expected class name
            const manifestPath = path.join(this.currentDirectory, "manifest.json");
            const manifestContent = fs.readFileSync(manifestPath, "utf-8");
            const manifest = JSON.parse(manifestContent);
            // Read index.ts to check class name
            const indexPath = path.join(this.currentDirectory, "index.ts");
            const indexContent = fs.readFileSync(indexPath, "utf-8");
            // Extract class name from index.ts
            const defaultExportRegex = /export\s+default\s+class\s+(\w+)/;
            const match = indexContent.match(defaultExportRegex);
            if (match) {
                const actualClassName = match[1];
                const expectedClassName = manifest.entrypointClassName;
                if (actualClassName !== expectedClassName) {
                    errors.push({
                        type: "interface_error",
                        message: `Class name mismatch. Expected "${expectedClassName}" from manifest.json, but found "${actualClassName}" in index.ts`,
                        file: "index.ts",
                    });
                }
            }
            // Check for INode implementation (basic check)
            if (!indexContent.includes("implements") ||
                !indexContent.includes("INode")) {
                errors.push({
                    type: "interface_error",
                    message: "Exported class must implement INode interface",
                    file: "index.ts",
                });
            }
        }
        catch (error) {
            errors.push({
                type: "interface_error",
                message: `Failed to validate class implementation: ${error instanceof Error ? error.message : "Unknown error"}`,
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
    validateSdkVersion() {
        const errors = [];
        try {
            const packagePath = path.join(this.currentDirectory, "package.json");
            const packageContent = fs.readFileSync(packagePath, "utf-8");
            const packageJson = JSON.parse(packageContent);
            const requiredSdkVersion = packageJson["tensorify-settings"]?.["sdk-version"];
            if (requiredSdkVersion !== this.sdkVersion) {
                errors.push({
                    type: "version_mismatch",
                    message: `SDK version mismatch. Plugin requires "${requiredSdkVersion}" but current SDK is "${this.sdkVersion}"`,
                    file: "package.json",
                });
            }
        }
        catch (error) {
            errors.push({
                type: "version_mismatch",
                message: `Failed to validate SDK version: ${error instanceof Error ? error.message : "Unknown error"}`,
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
    getValidationReport(result) {
        let report = "=== Plugin Validation Report ===\n\n";
        if (result.valid) {
            report += "✅ Plugin validation passed!\n";
        }
        else {
            report += "❌ Plugin validation failed!\n\n";
            report += "Errors:\n";
            result.errors.forEach((error, index) => {
                report += `${index + 1}. [${error.type.toUpperCase()}] ${error.message}`;
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
exports.PluginValidator = PluginValidator;
/**
 * Convenience function to validate a plugin directory
 */
async function validatePlugin(directory = process.cwd(), sdkVersion = "0.0.1") {
    const validator = new PluginValidator(directory, sdkVersion);
    return await validator.validatePlugin();
}
/**
 * Export current SDK version for version checking
 */
exports.CURRENT_SDK_VERSION = "0.0.1";
//# sourceMappingURL=index.js.map