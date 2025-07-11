/**
 * Utility functions for Tensorify SDK
 */
/**
 * Generate a random variable name with prefix
 */
export declare function generateVariableName(prefix?: string): string;
/**
 * Clean and validate Python variable names
 */
export declare function sanitizeVariableName(name: string): string;
/**
 * Format Python code with proper indentation
 */
export declare function formatPythonCode(code: string, indentSize?: number): string;
/**
 * Convert camelCase to snake_case
 */
export declare function camelToSnake(str: string): string;
/**
 * Convert snake_case to camelCase
 */
export declare function snakeToCamel(str: string): string;
/**
 * Deep merge objects
 */
export declare function deepMerge<T>(target: T, source: Partial<T>): T;
/**
 * Validate and normalize layer settings
 */
export declare function normalizeSettings(settings: Record<string, any>): Record<string, any>;
/**
 * Build import statements for Python code
 */
export declare function buildImports(imports: string[]): string;
/**
 * Validate tensor dimensions
 */
export declare function validateTensorDimensions(dimensions: number[], minDims?: number, maxDims?: number): boolean;
/**
 * Generate tensor shape string for Python
 */
export declare function formatTensorShape(shape: number[]): string;
/**
 * Parse version string
 */
export declare function parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
};
/**
 * Compare version strings
 */
export declare function compareVersions(v1: string, v2: string): number;
//# sourceMappingURL=index.d.ts.map