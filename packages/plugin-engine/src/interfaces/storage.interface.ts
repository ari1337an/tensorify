/**
 * Storage service interface for dependency injection
 */

import type { StorageFileInfo } from "../types/storage.types";

/**
 * Interface for storage operations (S3, etc.)
 * This enables dependency injection and makes the code testable
 */
export interface IStorageService {
  /**
   * Retrieve a file from the storage service
   * @param bucketName - The name of the S3 bucket
   * @param key - The key/path of the file in the bucket
   * @returns Promise resolving to file information including content
   * @throws {StorageError} When file cannot be retrieved
   */
  getFile(bucketName: string, key: string): Promise<StorageFileInfo>;

  /**
   * Check if a file exists in the storage service
   * @param bucketName - The name of the S3 bucket
   * @param key - The key/path of the file in the bucket
   * @returns Promise resolving to true if file exists, false otherwise
   */
  fileExists(bucketName: string, key: string): Promise<boolean>;

  /**
   * List files in a directory/prefix
   * @param bucketName - The name of the S3 bucket
   * @param prefix - The prefix/directory path
   * @param maxKeys - Maximum number of keys to return (optional)
   * @returns Promise resolving to array of file keys
   */
  listFiles(
    bucketName: string,
    prefix: string,
    maxKeys?: number
  ): Promise<string[]>;

  /**
   * Get metadata about a file without downloading its content
   * @param bucketName - The name of the S3 bucket
   * @param key - The key/path of the file in the bucket
   * @returns Promise resolving to file metadata
   */
  getFileMetadata(
    bucketName: string,
    key: string
  ): Promise<Omit<StorageFileInfo, "content">>;
}
