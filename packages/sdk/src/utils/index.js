"use strict";
/**
 * Utility functions for Tensorify SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVariableName = generateVariableName;
exports.sanitizeVariableName = sanitizeVariableName;
exports.formatPythonCode = formatPythonCode;
exports.camelToSnake = camelToSnake;
exports.snakeToCamel = snakeToCamel;
exports.deepMerge = deepMerge;
exports.normalizeSettings = normalizeSettings;
exports.buildImports = buildImports;
exports.validateTensorDimensions = validateTensorDimensions;
exports.formatTensorShape = formatTensorShape;
exports.parseVersion = parseVersion;
exports.compareVersions = compareVersions;
/**
 * Generate a random variable name with prefix
 */
function generateVariableName(prefix = "var") {
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${randomSuffix}`;
}
/**
 * Clean and validate Python variable names
 */
function sanitizeVariableName(name) {
    // Remove invalid characters and ensure it starts with letter or underscore
    let cleaned = name.replace(/[^a-zA-Z0-9_]/g, "_");
    // Ensure it starts with a letter or underscore
    if (!/^[a-zA-Z_]/.test(cleaned)) {
        cleaned = `var_${cleaned}`;
    }
    return cleaned;
}
/**
 * Format Python code with proper indentation
 */
function formatPythonCode(code, indentSize = 4) {
    const lines = code.split("\n");
    let indentLevel = 0;
    const formattedLines = [];
    lines.forEach((line) => {
        const trimmed = line.trim();
        // Skip empty lines
        if (!trimmed) {
            formattedLines.push("");
            return;
        }
        // Decrease indent for dedent keywords
        if (/^(else|elif|except|finally|class|def)/.test(trimmed)) {
            indentLevel = Math.max(0, indentLevel - 1);
        }
        // Add indented line
        const indent = " ".repeat(indentLevel * indentSize);
        formattedLines.push(indent + trimmed);
        // Increase indent after colon
        if (trimmed.endsWith(":")) {
            indentLevel++;
        }
    });
    return formattedLines.join("\n");
}
/**
 * Convert camelCase to snake_case
 */
function camelToSnake(str) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
/**
 * Convert snake_case to camelCase
 */
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * Deep merge objects
 */
function deepMerge(target, source) {
    const result = { ...target };
    Object.keys(source).forEach((key) => {
        const sourceValue = source[key];
        const targetValue = result[key];
        if (sourceValue &&
            typeof sourceValue === "object" &&
            !Array.isArray(sourceValue)) {
            result[key] = deepMerge(targetValue, sourceValue);
        }
        else {
            result[key] = sourceValue;
        }
    });
    return result;
}
/**
 * Validate and normalize layer settings
 */
function normalizeSettings(settings) {
    const normalized = {};
    Object.entries(settings).forEach(([key, value]) => {
        // Convert camelCase keys to snake_case for Python compatibility
        const normalizedKey = camelToSnake(key);
        // Normalize boolean values
        if (typeof value === "boolean") {
            normalized[normalizedKey] = value;
        }
        // Normalize arrays
        else if (Array.isArray(value)) {
            normalized[normalizedKey] = value;
        }
        // Normalize objects
        else if (value && typeof value === "object") {
            normalized[normalizedKey] = normalizeSettings(value);
        }
        // Normalize primitives
        else {
            normalized[normalizedKey] = value;
        }
    });
    return normalized;
}
/**
 * Build import statements for Python code
 */
function buildImports(imports) {
    if (imports.length === 0)
        return "";
    // Remove duplicates and sort
    const uniqueImports = [...new Set(imports)].sort();
    return uniqueImports.join("\n") + "\n\n";
}
/**
 * Validate tensor dimensions
 */
function validateTensorDimensions(dimensions, minDims = 1, maxDims = 4) {
    if (!Array.isArray(dimensions)) {
        throw new Error("Dimensions must be an array");
    }
    if (dimensions.length < minDims || dimensions.length > maxDims) {
        throw new Error(`Dimensions must be between ${minDims} and ${maxDims} dimensions`);
    }
    dimensions.forEach((dim, index) => {
        if (typeof dim !== "number" || dim <= 0) {
            throw new Error(`Dimension at index ${index} must be a positive number, got: ${dim}`);
        }
    });
    return true;
}
/**
 * Generate tensor shape string for Python
 */
function formatTensorShape(shape) {
    if (shape.length === 1) {
        return `(${shape[0]},)`;
    }
    return `(${shape.join(", ")})`;
}
/**
 * Parse version string
 */
function parseVersion(version) {
    const parts = version.split(".");
    return {
        major: parseInt(parts[0] || "0", 10),
        minor: parseInt(parts[1] || "0", 10),
        patch: parseInt(parts[2] || "0", 10),
    };
}
/**
 * Compare version strings
 */
function compareVersions(v1, v2) {
    const version1 = parseVersion(v1);
    const version2 = parseVersion(v2);
    if (version1.major !== version2.major) {
        return version1.major - version2.major;
    }
    if (version1.minor !== version2.minor) {
        return version1.minor - version2.minor;
    }
    return version1.patch - version2.patch;
}
//# sourceMappingURL=index.js.map