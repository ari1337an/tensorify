import { z } from "zod";
/**
 * Zod schema for manifest.json validation
 */
export declare const ManifestSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodString;
    author: z.ZodString;
    main: z.ZodString;
    entrypointClassName: z.ZodString;
    keywords: z.ZodArray<z.ZodString>;
    repository: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"git">;
        url: z.ZodString;
    }, z.core.$strip>>;
    private: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    scripts: z.ZodIntersection<z.ZodObject<{
        build: z.ZodString;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodString>>;
    tensorifySettings: z.ZodObject<{
        sdkVersion: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strict>;
/**
 * Zod schema for package.json validation specifically for Tensorify plugins
 */
export declare const PackageJsonSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    main: z.ZodString;
    author: z.ZodString;
    keywords: z.ZodArray<z.ZodString>;
    repository: z.ZodOptional<z.ZodObject<{
        type: z.ZodLiteral<"git">;
        url: z.ZodString;
    }, z.core.$strip>>;
    private: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    scripts: z.ZodIntersection<z.ZodObject<{
        build: z.ZodString;
    }, z.core.$strip>, z.ZodRecord<z.ZodString, z.ZodString>>;
    "tensorify-settings": z.ZodObject<{
        "sdk-version": z.ZodString;
    }, z.core.$strip>;
}, z.core.$loose>;
export interface ValidationError {
    type: "missing_file" | "invalid_content" | "schema_error" | "interface_error" | "version_mismatch";
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
export declare class PluginValidator {
    private currentDirectory;
    private sdkVersion;
    constructor(directory?: string, sdkVersion?: string);
    /**
     * Validate all plugin requirements
     */
    validatePlugin(): Promise<ValidationResult>;
    /**
     * Check if required files exist
     */
    private checkRequiredFiles;
    /**
     * Validate manifest.json against schema
     */
    private validateManifest;
    /**
     * Validate package.json structure
     */
    private validatePackageJson;
    /**
     * Validate index.ts has single default export
     */
    private validateIndexTs;
    /**
     * Validate class implementation matches manifest and implements INode
     */
    private validateClassImplementation;
    /**
     * Validate SDK version compatibility
     */
    private validateSdkVersion;
    /**
     * Get detailed validation report as string
     */
    getValidationReport(result: ValidationResult): string;
}
/**
 * Convenience function to validate a plugin directory
 */
export declare function validatePlugin(directory?: string, sdkVersion?: string): Promise<ValidationResult>;
/**
 * Export current SDK version for version checking
 */
export declare const CURRENT_SDK_VERSION = "0.0.1";
//# sourceMappingURL=index.d.ts.map