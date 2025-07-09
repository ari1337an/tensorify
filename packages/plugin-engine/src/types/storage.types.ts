/**
 * Storage service type definitions
 */

/** Storage service configuration */
export interface StorageConfig {
  /** AWS region */
  region?: string;
  /** AWS access key ID */
  accessKeyId?: string;
  /** AWS secret access key */
  secretAccessKey?: string;
  /** AWS session token */
  sessionToken?: string;
  /** Custom endpoint for S3-compatible services */
  endpoint?: string;
  /** Force path style for S3 requests */
  forcePathStyle?: boolean;
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
