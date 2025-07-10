/**
 * Utility functions for S3 Plugin Management MCP Server
 */

import {
  PluginSlug,
  PluginPaths,
  LogLevel,
  EnvConfig,
  EnvConfigSchema,
} from "./types.js";

/**
 * Logger utility with configurable levels
 */
export class Logger {
  private debugEnabled: boolean;

  constructor(debugEnabled: boolean = false) {
    this.debugEnabled = debugEnabled;
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  debug(message: string, meta?: any): void {
    if (this.debugEnabled) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
}

/**
 * Parse plugin slug into its components
 */
export function parsePluginSlug(slug: PluginSlug): PluginPaths {
  // Format: @namespace/plugin-name:version
  const match = slug.match(
    /^@([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+):(\d+\.\d+\.\d+)$/
  );

  if (!match) {
    throw new Error(`Invalid plugin slug format: ${slug}`);
  }

  const [, namespace, pluginName, version] = match;

  if (!namespace || !pluginName || !version) {
    throw new Error(`Invalid plugin slug format: ${slug}`);
  }

  // New structure: @namespace/plugin-name:version/index.js
  const folderPrefix = `@${namespace}/${pluginName}:${version}`;
  const codeKey = `${folderPrefix}/index.js`;
  const manifestKey = `${folderPrefix}/manifest.json`;

  return {
    namespace,
    pluginName,
    version,
    codeKey,
    manifestKey,
    folderPrefix,
  };
}

/**
 * Build S3 key (no prefix needed for new structure)
 */
export function buildS3Key(config: EnvConfig, path: string): string {
  // No prefix needed - plugins are stored directly as @namespace/plugin-name:version/
  return path;
}

/**
 * Extract plugin slug from S3 key
 */
export function extractSlugFromS3Key(
  config: EnvConfig,
  key: string
): string | null {
  // New structure: @namespace/plugin-name:version/index.js or manifest.json
  // Extract the slug from the path before the filename
  const pathParts = key.split("/");

  if (pathParts.length < 2) {
    return null;
  }

  // Get the folder part (everything except the filename)
  const folderPath = pathParts.slice(0, -1).join("/");

  // Check if it matches the expected pattern: @namespace/plugin-name:version
  const slugMatch = folderPath.match(
    /^@([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+):(\d+\.\d+\.\d+)$/
  );

  if (!slugMatch) {
    return null;
  }

  return folderPath; // This is already in the correct @namespace/plugin-name:version format
}

/**
 * Validate plugin manifest content
 */
export function validateManifestContent(content: string): any {
  try {
    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    throw new Error(
      `Invalid JSON manifest: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Format file size for human reading
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Create a safe error message for user consumption
 */
export function createSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
}

/**
 * Validate environment configuration
 */
export function validateEnvironment(
  env: Record<string, string | undefined>
): EnvConfig {
  try {
    const config = {
      S3_ACCESS_KEY_ID: env.S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY: env.S3_SECRET_ACCESS_KEY,
      S3_ENDPOINT: env.S3_ENDPOINT,
      S3_REGION: env.S3_REGION,
      S3_BUCKET_NAME: env.S3_BUCKET_NAME,
      S3_FORCE_PATH_STYLE: env.S3_FORCE_PATH_STYLE,
      DEBUG_LOGGING: env.DEBUG_LOGGING,
    };

    // Remove undefined values to let Zod handle defaults
    Object.keys(config).forEach((key) => {
      if (config[key as keyof typeof config] === undefined) {
        delete config[key as keyof typeof config];
      }
    });

    return EnvConfigSchema.parse(config);
  } catch (error) {
    throw new Error(
      `Environment validation failed: ${createSafeErrorMessage(error)}`
    );
  }
}

/**
 * Check if a string is a valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        break;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
