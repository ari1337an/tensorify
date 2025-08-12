/**
 * Local filesystem Storage service implementation
 */

import * as fs from "fs";
import * as path from "path";
import type { IStorageService } from "../interfaces/storage.interface";
import type { StorageFileInfo } from "../types/storage.types";
import { StorageError } from "../errors/plugin-engine.errors";

/**
 * Local filesystem implementation of the storage service.
 * Interprets the first argument (bucketName) as an absolute or relative base directory on disk.
 */
export class LocalFileStorageService implements IStorageService {
  /**
   * Retrieve a file from local filesystem
   */
  async getFile(baseDir: string, key: string): Promise<StorageFileInfo> {
    try {
      const filePath = path.resolve(baseDir, key);
      const content = fs.readFileSync(filePath, "utf-8");
      const stat = fs.statSync(filePath);

      return {
        content,
        size: stat.size,
        lastModified: stat.mtime,
        contentType: this.getContentTypeByExtension(path.extname(filePath)),
        etag: undefined,
      };
    } catch (error) {
      throw new StorageError(
        `Failed to retrieve file '${key}' from local dir '${baseDir}': ${
          (error as Error).message
        }`,
        baseDir,
        key,
        error as Error
      );
    }
  }

  /**
   * Check if a file exists on local filesystem
   */
  async fileExists(baseDir: string, key: string): Promise<boolean> {
    try {
      const filePath = path.resolve(baseDir, key);
      return fs.existsSync(filePath);
    } catch (error) {
      throw new StorageError(
        `Failed to check existence of file '${key}' in local dir '${baseDir}': ${
          (error as Error).message
        }`,
        baseDir,
        key,
        error as Error
      );
    }
  }

  /**
   * List files recursively under a prefix directory
   */
  async listFiles(
    baseDir: string,
    prefix: string,
    maxKeys: number = 1000
  ): Promise<string[]> {
    try {
      const absolutePrefixDir = path.resolve(baseDir, prefix || ".");
      if (!fs.existsSync(absolutePrefixDir)) {
        return [];
      }

      const results: string[] = [];

      const walk = (currentDir: string, relativeToPrefix: string) => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const absPath = path.join(currentDir, entry.name);
          const relPath = path.join(relativeToPrefix, entry.name);
          if (entry.isDirectory()) {
            walk(absPath, relPath);
            if (results.length >= maxKeys) return;
          } else {
            // Return keys including the prefix (to match S3 behavior used by engine)
            const key = prefix
              ? path.posix.join(prefix, relPath).replace(/\\/g, "/")
              : relPath.replace(/\\/g, "/");
            results.push(key);
            if (results.length >= maxKeys) return;
          }
        }
      };

      walk(absolutePrefixDir, "");
      return results.slice(0, maxKeys);
    } catch (error) {
      throw new StorageError(
        `Failed to list files at '${prefix}' in local dir '${baseDir}': ${
          (error as Error).message
        }`,
        baseDir,
        prefix,
        error as Error
      );
    }
  }

  /**
   * Get metadata about a local file without reading its content
   */
  async getFileMetadata(
    baseDir: string,
    key: string
  ): Promise<Omit<StorageFileInfo, "content">> {
    try {
      const filePath = path.resolve(baseDir, key);
      const stat = fs.statSync(filePath);
      return {
        size: stat.size,
        lastModified: stat.mtime,
        contentType: this.getContentTypeByExtension(path.extname(filePath)),
        etag: undefined,
      };
    } catch (error) {
      throw new StorageError(
        `Failed to get metadata for file '${key}' in local dir '${baseDir}': ${
          (error as Error).message
        }`,
        baseDir,
        key,
        error as Error
      );
    }
  }

  private getContentTypeByExtension(
    ext: string | undefined
  ): string | undefined {
    switch ((ext || "").toLowerCase()) {
      case ".js":
        return "application/javascript";
      case ".json":
        return "application/json";
      case ".svg":
        return "image/svg+xml";
      default:
        return undefined;
    }
  }
}
