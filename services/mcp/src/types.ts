/**
 * Type definitions for S3 Plugin Management MCP Server
 */

import { z } from "zod";

/**
 * Environment configuration schema
 */
export const EnvConfigSchema = z.object({
  S3_ACCESS_KEY_ID: z.string().min(1, "S3_ACCESS_KEY_ID is required"),
  S3_SECRET_ACCESS_KEY: z.string().min(1, "S3_SECRET_ACCESS_KEY is required"),
  S3_ENDPOINT: z.string().url("S3_ENDPOINT must be a valid URL"),
  S3_REGION: z.string().min(1, "S3_REGION is required"),
  S3_BUCKET_NAME: z.string().min(1, "S3_BUCKET_NAME is required"),
  S3_FORCE_PATH_STYLE: z
    .string()
    .optional()
    .transform((val) => val === "true"),
  DEBUG_LOGGING: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

/**
 * Plugin identifier schema
 */
export const PluginSlugSchema = z
  .string()
  .regex(
    /^@[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+:\d+\.\d+\.\d+$/,
    "Plugin slug must follow format: @namespace/plugin-name:version"
  );

export type PluginSlug = z.infer<typeof PluginSlugSchema>;

/**
 * Plugin file types
 */
export enum PluginFileType {
  CODE = "code",
  MANIFEST = "manifest",
}

/**
 * Plugin manifest structure
 */
export const PluginManifestSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  main: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  entryPoints: z.record(z.string(), z.any()).optional(),
  ok: z.boolean().optional(),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

/**
 * S3 object information
 */
export interface S3ObjectInfo {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
}

/**
 * Plugin files listing
 */
export interface PluginFilesListing {
  slug: string;
  codeFile?: S3ObjectInfo;
  manifestFile?: S3ObjectInfo;
  exists: boolean;
}

/**
 * Tool parameter schemas
 */
export const CheckPluginExistsParamsSchema = z.object({
  slug: PluginSlugSchema,
});

export const ListFilesParamsSchema = z.object({
  namespace: z.string().optional(),
  pluginName: z.string().optional(),
  version: z.string().optional(),
  limit: z.number().min(1).max(1000).optional().default(100),
});

export const UploadPluginCodeParamsSchema = z.object({
  slug: PluginSlugSchema,
  code: z.string().min(1, "Code content cannot be empty"),
  contentType: z.string().optional().default("application/javascript"),
});

export const UploadPluginManifestParamsSchema = z.object({
  slug: PluginSlugSchema,
  manifest: z.union([
    z.string().min(1, "Manifest content cannot be empty"),
    PluginManifestSchema,
  ]),
});

export const DeletePluginParamsSchema = z.object({
  slug: PluginSlugSchema,
});

/**
 * Tool response types
 */
export interface ToolResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Logging levels
 */
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

/**
 * S3 client configuration
 */
export interface S3ClientConfig {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
  forcePathStyle?: boolean;
}

/**
 * Plugin path utilities
 */
export interface PluginPaths {
  namespace: string;
  pluginName: string;
  version: string;
  codeKey: string;
  manifestKey: string;
  folderPrefix: string;
}
