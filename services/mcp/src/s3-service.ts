/**
 * S3 Service for Plugin Management
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import {
  EnvConfig,
  S3ClientConfig,
  S3ObjectInfo,
  PluginFilesListing,
  PluginSlug,
  PluginFileType,
  ToolResponse,
} from "./types.js";
import {
  Logger,
  parsePluginSlug,
  buildS3Key,
  extractSlugFromS3Key,
  validateManifestContent,
  formatFileSize,
  createSafeErrorMessage,
  retryWithBackoff,
} from "./utils.js";

/**
 * S3 Service for plugin operations
 */
export class S3PluginService {
  private readonly s3Client: S3Client;
  private readonly config: EnvConfig;
  private readonly logger: Logger;

  constructor(config: EnvConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;

    const clientConfig: S3ClientConfig = {
      accessKeyId: config.S3_ACCESS_KEY_ID,
      secretAccessKey: config.S3_SECRET_ACCESS_KEY,
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      forcePathStyle: config.S3_FORCE_PATH_STYLE,
    };

    this.s3Client = new S3Client({
      region: clientConfig.region,
      endpoint: clientConfig.endpoint,
      credentials: {
        accessKeyId: clientConfig.accessKeyId,
        secretAccessKey: clientConfig.secretAccessKey,
      },
      ...(clientConfig.forcePathStyle !== undefined && { forcePathStyle: clientConfig.forcePathStyle }),
    });

    this.logger.info("S3PluginService initialized", {
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      bucket: config.S3_BUCKET_NAME,
    });
  }

  /**
   * Check if a plugin exists in S3
   */
  async checkPluginExists(
    slug: PluginSlug
  ): Promise<
    ToolResponse<{
      exists: boolean;
      files: { code: boolean; manifest: boolean };
    }>
  > {
    try {
      this.logger.debug(`Checking if plugin exists: ${slug}`);

      const paths = parsePluginSlug(slug);
      const codeKey = buildS3Key(this.config, paths.codeKey);
      const manifestKey = buildS3Key(this.config, paths.manifestKey);

      const [codeExists, manifestExists] = await Promise.all([
        this.objectExists(codeKey),
        this.objectExists(manifestKey),
      ]);

      const exists = codeExists || manifestExists;

      this.logger.debug(`Plugin existence check result`, {
        slug,
        exists,
        codeExists,
        manifestExists,
      });

      return {
        success: true,
        data: {
          exists,
          files: {
            code: codeExists,
            manifest: manifestExists,
          },
        },
        message: exists ? "Plugin found" : "Plugin not found",
      };
    } catch (error) {
      this.logger.error(`Failed to check plugin existence: ${slug}`, { error });
      return {
        success: false,
        error: createSafeErrorMessage(error),
      };
    }
  }

  /**
   * List plugin files with optional filtering
   */
  async listPluginFiles(
    namespace?: string,
    pluginName?: string,
    version?: string,
    limit: number = 100
  ): Promise<ToolResponse<PluginFilesListing[]>> {
    try {
      this.logger.debug("Listing plugin files", {
        namespace,
        pluginName,
        version,
        limit,
      });

      // Build prefix based on filtering options
      let prefix = "";
      
      if (namespace) {
        prefix = `@${namespace}/`;
        if (pluginName) {
          if (version) {
            // Exact plugin match: @namespace/plugin-name:version/
            prefix = `@${namespace}/${pluginName}:${version}/`;
          } else {
            // Plugin name match: @namespace/plugin-name: (will match all versions)
            prefix = `@${namespace}/${pluginName}:`;
          }
        }
      }

      const command = new ListObjectsV2Command({
        Bucket: this.config.S3_BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: limit * 2, // Accounting for both index.js and manifest.json files
      });

      const response = await retryWithBackoff(() =>
        this.s3Client.send(command)
      );
      const objects = response.Contents || [];

      // Group objects by plugin
      const pluginMap = new Map<string, PluginFilesListing>();

      for (const obj of objects) {
        if (!obj.Key || !obj.Size || !obj.LastModified || !obj.ETag) {
          continue;
        }

        const slug = extractSlugFromS3Key(this.config, obj.Key);
        if (!slug) {
          continue;
        }

        if (!pluginMap.has(slug)) {
          pluginMap.set(slug, {
            slug,
            exists: true,
          });
        }

        const listing = pluginMap.get(slug)!;
        const objectInfo: S3ObjectInfo = {
          key: obj.Key,
          size: obj.Size,
          lastModified: obj.LastModified,
          etag: obj.ETag.replace(/"/g, ""),
        };

        if (obj.Key.endsWith("/index.js")) {
          listing.codeFile = objectInfo;
        } else if (obj.Key.endsWith("/manifest.json")) {
          listing.manifestFile = objectInfo;
        }
      }

      // Only include plugins that have both index.js and manifest.json
      const completePlugins = Array.from(pluginMap.values()).filter(
        (plugin) => plugin.codeFile && plugin.manifestFile
      );
      
      const listings = completePlugins.slice(0, limit);

      this.logger.debug(`Found ${listings.length} complete plugin(s)`, {
        count: listings.length,
      });

      return {
        success: true,
        data: listings,
        message: `Found ${listings.length} plugin(s)`,
      };
    } catch (error) {
      this.logger.error("Failed to list plugin files", { error });
      return {
        success: false,
        error: createSafeErrorMessage(error),
      };
    }
  }

  /**
   * Upload plugin code to S3
   */
  async uploadPluginCode(
    slug: PluginSlug,
    code: string,
    contentType: string = "application/javascript"
  ): Promise<ToolResponse<{ key: string; size: number }>> {
    try {
      this.logger.debug(`Uploading plugin code: ${slug}`);

      const paths = parsePluginSlug(slug);
      const key = buildS3Key(this.config, paths.codeKey);
      const codeBuffer = Buffer.from(code, "utf-8");

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.config.S3_BUCKET_NAME,
          Key: key,
          Body: codeBuffer,
          ContentType: contentType,
          ContentLength: codeBuffer.length,
          Metadata: {
            "plugin-slug": slug,
            "file-type": PluginFileType.CODE,
            "upload-timestamp": new Date().toISOString(),
          },
        },
      });

      await upload.done();

      this.logger.info(`Successfully uploaded plugin code: ${slug}`, {
        key,
        size: codeBuffer.length,
        sizeFormatted: formatFileSize(codeBuffer.length),
      });

      return {
        success: true,
        data: {
          key,
          size: codeBuffer.length,
        },
        message: `Plugin code uploaded successfully (${formatFileSize(
          codeBuffer.length
        )})`,
      };
    } catch (error) {
      this.logger.error(`Failed to upload plugin code: ${slug}`, { error });
      return {
        success: false,
        error: createSafeErrorMessage(error),
      };
    }
  }

  /**
   * Upload plugin manifest to S3
   */
  async uploadPluginManifest(
    slug: PluginSlug,
    manifest: string | object
  ): Promise<ToolResponse<{ key: string; size: number }>> {
    try {
      this.logger.debug(`Uploading plugin manifest: ${slug}`);

      const paths = parsePluginSlug(slug);
      const key = buildS3Key(this.config, paths.manifestKey);

      // Handle both string and object inputs
      let manifestContent: string;
      if (typeof manifest === "string") {
        // Validate JSON if it's a string
        validateManifestContent(manifest);
        manifestContent = manifest;
      } else {
        manifestContent = JSON.stringify(manifest, null, 2);
      }

      const manifestBuffer = Buffer.from(manifestContent, "utf-8");

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.config.S3_BUCKET_NAME,
          Key: key,
          Body: manifestBuffer,
          ContentType: "application/json",
          ContentLength: manifestBuffer.length,
          Metadata: {
            "plugin-slug": slug,
            "file-type": PluginFileType.MANIFEST,
            "upload-timestamp": new Date().toISOString(),
          },
        },
      });

      await upload.done();

      this.logger.info(`Successfully uploaded plugin manifest: ${slug}`, {
        key,
        size: manifestBuffer.length,
        sizeFormatted: formatFileSize(manifestBuffer.length),
      });

      return {
        success: true,
        data: {
          key,
          size: manifestBuffer.length,
        },
        message: `Plugin manifest uploaded successfully (${formatFileSize(
          manifestBuffer.length
        )})`,
      };
    } catch (error) {
      this.logger.error(`Failed to upload plugin manifest: ${slug}`, { error });
      return {
        success: false,
        error: createSafeErrorMessage(error),
      };
    }
  }

  /**
   * Delete plugin code from S3
   */
  async deletePluginCode(
    slug: PluginSlug
  ): Promise<ToolResponse<{ deleted: boolean }>> {
    try {
      this.logger.debug(`Deleting plugin code: ${slug}`);

      const paths = parsePluginSlug(slug);
      const key = buildS3Key(this.config, paths.codeKey);

      const command = new DeleteObjectCommand({
        Bucket: this.config.S3_BUCKET_NAME,
        Key: key,
      });

      await retryWithBackoff(() => this.s3Client.send(command));

      this.logger.info(`Successfully deleted plugin code: ${slug}`, { key });

      return {
        success: true,
        data: { deleted: true },
        message: "Plugin code deleted successfully",
      };
    } catch (error) {
      this.logger.error(`Failed to delete plugin code: ${slug}`, { error });
      return {
        success: false,
        error: createSafeErrorMessage(error),
      };
    }
  }

  /**
   * Delete plugin manifest from S3
   */
  async deletePluginManifest(
    slug: PluginSlug
  ): Promise<ToolResponse<{ deleted: boolean }>> {
    try {
      this.logger.debug(`Deleting plugin manifest: ${slug}`);

      const paths = parsePluginSlug(slug);
      const key = buildS3Key(this.config, paths.manifestKey);

      const command = new DeleteObjectCommand({
        Bucket: this.config.S3_BUCKET_NAME,
        Key: key,
      });

      await retryWithBackoff(() => this.s3Client.send(command));

      this.logger.info(`Successfully deleted plugin manifest: ${slug}`, {
        key,
      });

      return {
        success: true,
        data: { deleted: true },
        message: "Plugin manifest deleted successfully",
      };
    } catch (error) {
      this.logger.error(`Failed to delete plugin manifest: ${slug}`, { error });
      return {
        success: false,
        error: createSafeErrorMessage(error),
      };
    }
  }

  /**
   * Get plugin file content
   */
  async getPluginFile(
    slug: PluginSlug,
    fileType: PluginFileType
  ): Promise<ToolResponse<{ content: string; metadata: any }>> {
    try {
      this.logger.debug(`Getting plugin file: ${slug} (${fileType})`);

      const paths = parsePluginSlug(slug);
      const key = buildS3Key(
        this.config,
        fileType === PluginFileType.CODE ? paths.codeKey : paths.manifestKey
      );

      const command = new GetObjectCommand({
        Bucket: this.config.S3_BUCKET_NAME,
        Key: key,
      });

      const response = await retryWithBackoff(() =>
        this.s3Client.send(command)
      );

      if (!response.Body) {
        throw new Error("Empty response body");
      }

      const content = await response.Body.transformToString();

      return {
        success: true,
        data: {
          content,
          metadata: response.Metadata || {},
        },
        message: `${fileType} file retrieved successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to get plugin file: ${slug} (${fileType})`, {
        error,
      });
      return {
        success: false,
        error: createSafeErrorMessage(error),
      };
    }
  }

  /**
   * Check if an S3 object exists
   */
  private async objectExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.S3_BUCKET_NAME,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (
        error instanceof NoSuchKey ||
        (error as any).$metadata?.httpStatusCode === 404
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Health check for S3 service
   */
  async healthCheck(): Promise<
    ToolResponse<{ bucket: string; accessible: boolean }>
  > {
    try {
      this.logger.debug("Performing S3 health check");

      const command = new ListObjectsV2Command({
        Bucket: this.config.S3_BUCKET_NAME,
        MaxKeys: 1,
      });

      await this.s3Client.send(command);

      return {
        success: true,
        data: {
          bucket: this.config.S3_BUCKET_NAME,
          accessible: true,
        },
        message: "S3 service is healthy",
      };
    } catch (error) {
      this.logger.error("S3 health check failed", { error });
      return {
        success: false,
        data: {
          bucket: this.config.S3_BUCKET_NAME,
          accessible: false,
        },
        error: createSafeErrorMessage(error),
      };
    }
  }
}
