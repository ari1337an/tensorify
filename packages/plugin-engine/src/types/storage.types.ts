/**
 * Storage service type definitions
 */

import type { S3ClientConfig } from "@aws-sdk/client-s3";

/** S3 configuration that maps directly to S3Client constructor options */
export interface S3Config extends S3ClientConfig {
  // All S3Client options are available directly
  // Common ones for reference:
  // region?: string;
  // credentials?: {
  //   accessKeyId: string;
  //   secretAccessKey: string;
  //   sessionToken?: string;
  // };
  // endpoint?: string;
  // forcePathStyle?: boolean;
}

/** File information returned by storage operations */
export interface StorageFileInfo {
  /** File content as string */
  content: string;
  /** File size in bytes */
  size: number;
  /** Last modified date */
  lastModified?: Date;
  /** Content type/MIME type */
  contentType?: string;
  /** File ETag */
  etag?: string;
}

/** Storage operation result */
export interface StorageOperationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Optional error message if operation failed */
  error?: string;
  /** Optional additional metadata */
  metadata?: Record<string, any>;
}
