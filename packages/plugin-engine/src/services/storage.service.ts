/**
 * S3 Storage service implementation
 */

import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import type { IStorageService } from "../interfaces/storage.interface";
import type { StorageFileInfo, StorageConfig } from "../types/storage.types";
import { StorageError } from "../errors/plugin-engine.errors";

/**
 * AWS S3 implementation of the storage service
 */
export class S3StorageService implements IStorageService {
  private readonly s3Client: S3Client;

  /**
   * Create a new S3 storage service instance
   * @param s3Client - Configured S3 client instance
   */
  constructor(s3Client: S3Client) {
    this.s3Client = s3Client;
  }

  /**
   * Create S3 storage service with configuration
   * @param config - Storage configuration
   * @returns New S3StorageService instance
   */
  static create(config: StorageConfig): S3StorageService {
    const s3Client = new S3Client({
      region: config.region || "us-east-1",
      credentials:
        config.accessKeyId && config.secretAccessKey
          ? {
              accessKeyId: config.accessKeyId,
              secretAccessKey: config.secretAccessKey,
              sessionToken: config.sessionToken,
            }
          : undefined,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
    });

    return new S3StorageService(s3Client);
  }

  /**
   * Retrieve a file from S3
   */
  async getFile(bucketName: string, key: string): Promise<StorageFileInfo> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new StorageError(
          `File '${key}' in bucket '${bucketName}' has no content`,
          bucketName,
          key
        );
      }

      // Convert the stream to string
      const content = await this.streamToString(response.Body as any);

      return {
        content,
        size: response.ContentLength || content.length,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        etag: response.ETag,
      };
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to retrieve file '${key}' from bucket '${bucketName}': ${
          (error as Error).message
        }`,
        bucketName,
        key,
        error as Error
      );
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(bucketName: string, key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: any) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw new StorageError(
        `Failed to check existence of file '${key}' in bucket '${bucketName}': ${error.message}`,
        bucketName,
        key,
        error
      );
    }
  }

  /**
   * List files in a directory/prefix
   */
  async listFiles(
    bucketName: string,
    prefix: string,
    maxKeys: number = 1000
  ): Promise<string[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.s3Client.send(command);

      return response.Contents?.map((obj: any) => obj.Key!).filter(Boolean) || [];
    } catch (error) {
      throw new StorageError(
        `Failed to list files with prefix '${prefix}' in bucket '${bucketName}': ${
          (error as Error).message
        }`,
        bucketName,
        prefix,
        error as Error
      );
    }
  }

  /**
   * Get metadata about a file without downloading its content
   */
  async getFileMetadata(
    bucketName: string,
    key: string
  ): Promise<Omit<StorageFileInfo, "content">> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      return {
        size: response.ContentLength || 0,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        etag: response.ETag,
      };
    } catch (error) {
      throw new StorageError(
        `Failed to get metadata for file '${key}' in bucket '${bucketName}': ${
          (error as Error).message
        }`,
        bucketName,
        key,
        error as Error
      );
    }
  }

  /**
   * Convert a readable stream to string
   */
  private async streamToString(stream: any): Promise<string> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
  }
}
