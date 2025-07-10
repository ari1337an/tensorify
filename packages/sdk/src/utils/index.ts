/**
 * Utility functions for Tensorify SDK
 */

/**
 * Generate a random variable name with prefix
 */
export function generateVariableName(prefix: string = "var"): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomSuffix}`;
}

/**
 * Clean and validate Python variable names
 */
export function sanitizeVariableName(name: string): string {
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
export function formatPythonCode(code: string, indentSize: number = 4): string {
  const lines = code.split("\n");
  let indentLevel = 0;
  const formattedLines: string[] = [];

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
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Deep merge objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = result[key as keyof T];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      result[key as keyof T] = deepMerge(targetValue, sourceValue);
    } else {
      result[key as keyof T] = sourceValue as T[keyof T];
    }
  });

  return result;
}

/**
 * Validate and normalize layer settings
 */
export function normalizeSettings(
  settings: Record<string, any>
): Record<string, any> {
  const normalized: Record<string, any> = {};

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
export function buildImports(imports: string[]): string {
  if (imports.length === 0) return "";

  // Remove duplicates and sort
  const uniqueImports = [...new Set(imports)].sort();

  return uniqueImports.join("\n") + "\n\n";
}

/**
 * Validate tensor dimensions
 */
export function validateTensorDimensions(
  dimensions: number[],
  minDims: number = 1,
  maxDims: number = 4
): boolean {
  if (!Array.isArray(dimensions)) {
    throw new Error("Dimensions must be an array");
  }

  if (dimensions.length < minDims || dimensions.length > maxDims) {
    throw new Error(
      `Dimensions must be between ${minDims} and ${maxDims} dimensions`
    );
  }

  dimensions.forEach((dim, index) => {
    if (typeof dim !== "number" || dim <= 0) {
      throw new Error(
        `Dimension at index ${index} must be a positive number, got: ${dim}`
      );
    }
  });

  return true;
}

/**
 * Generate tensor shape string for Python
 */
export function formatTensorShape(shape: number[]): string {
  if (shape.length === 1) {
    return `(${shape[0]},)`;
  }
  return `(${shape.join(", ")})`;
}

/**
 * Parse version string
 */
export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} {
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
export function compareVersions(v1: string, v2: string): number {
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
