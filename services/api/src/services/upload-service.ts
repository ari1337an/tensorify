import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import axios from "axios";
import multer from "multer";
import crypto from "crypto";
import { getDecodedJwt } from "./auth-utils";

/**
 * Upload metadata interface
 */
interface UploadMetadata {
  filename?: string;
  filetype?: string;
  pluginName?: string;
  pluginVersion?: string;
  userId?: string;
}

/**
 * Plugin data interface for webhook
 */
interface PluginData {
  name: string;
  version: string;
  slug: string;
  description?: string;
  author?: string;
  access: "public" | "private";
  entrypointClassName: string;
  repository?: string;
  files: string[];
}

/**
 * Upload service for handling file uploads and S3 storage
 */
export class UploadService {
  private s3Client: S3Client;
  private upload: multer.Multer;

  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: process.env.S3_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
      endpoint: process.env.S3_ENDPOINT,
    });

    // Initialize multer for memory storage
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
      },
    });
  }

  /**
   * Verify authentication middleware
   */
  async verifyAuth(
    req: Request
  ): Promise<{ userId: string; sessionId: string }> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Authorization header required");
    }

    const token = authHeader.substring(7);

    try {
      const result = await getDecodedJwt(token);

      if (!result.success || !result.data) {
        throw new Error(result.message);
      }

      const decodedToken = result.data;
      const userId = decodedToken.sub || decodedToken.id || "anonymous";

      console.log("Token validated for user:", userId);
      return {
        userId: userId,
        sessionId: token.substring(0, 20), // Use first 20 chars as session ID
      };
    } catch (error) {
      console.error("Token verification failed:", error);
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Handle single file upload
   */
  async handleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      // Verify authentication
      const auth = await this.verifyAuth(req);
      console.log("Authenticated user:", auth.userId);

      // Use multer to parse the uploaded file
      this.upload.single("file")(req, res, async (err) => {
        if (err) {
          console.error("Multer error:", err);
          res.status(400).json({ error: "File upload error: " + err.message });
          return;
        }

        const file = req.file;
        if (!file) {
          res.status(400).json({ error: "No file uploaded" });
          return;
        }

        // Get metadata from request
        const metadata: UploadMetadata = {
          filename: file.originalname,
          filetype: file.mimetype,
          pluginName: req.body.pluginName,
          pluginVersion: req.body.pluginVersion,
          userId: auth.userId,
        };

        // Validate required metadata
        if (!metadata.pluginName || !metadata.pluginVersion) {
          res.status(400).json({
            error: "Missing required metadata: pluginName, pluginVersion",
          });
          return;
        }

        try {
          // Generate unique S3 key
          const uploadId = crypto.randomUUID();
          const s3Key = `uploads/${uploadId}`;

          // Upload to S3
          const putCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || "tensorify-plugins",
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
              filename: metadata.filename || "",
              pluginName: metadata.pluginName || "",
              pluginVersion: metadata.pluginVersion || "",
              userId: metadata.userId || "",
            },
          });

          await this.s3Client.send(putCommand);

          // Return success response
          const s3Url = `https://${
            process.env.S3_BUCKET_NAME || "tensorify-plugins"
          }.s3.${process.env.S3_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;

          res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            s3Url: s3Url,
            uploadId: uploadId,
            metadata: metadata,
          });
        } catch (uploadError) {
          console.error("S3 upload error:", uploadError);
          res.status(500).json({ error: "Failed to upload file to storage" });
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(401).json({
        error: error instanceof Error ? error.message : "Authentication failed",
      });
    }
  }

  /**
   * Handle multiple file uploads (for bundle.js, manifest.json, icon.svg)
   */
  async handleMultipleFileUpload(req: Request, res: Response): Promise<void> {
    try {
      // Verify authentication
      const auth = await this.verifyAuth(req);
      console.log("Authenticated user:", auth.userId);

      // Use multer to parse multiple files
      this.upload.fields([
        { name: "bundle", maxCount: 1 },
        { name: "manifest", maxCount: 1 },
        { name: "icon", maxCount: 1 },
      ])(req, res, async (err) => {
        if (err) {
          console.error("Multer error:", err);
          res.status(400).json({ error: "File upload error: " + err.message });
          return;
        }

        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };
        if (!files || !files.bundle || !files.manifest || !files.icon) {
          res.status(400).json({
            error: "Missing required files: bundle.js, manifest.json, icon.svg",
          });
          return;
        }

        // Get metadata from request
        const pluginName = req.body.pluginName;
        const pluginVersion = req.body.pluginVersion;

        if (!pluginName || !pluginVersion) {
          res.status(400).json({
            error: "Missing required metadata: pluginName, pluginVersion",
          });
          return;
        }

        try {
          const uploadResults: string[] = [];

          // Upload each file
          for (const [fieldName, fileArray] of Object.entries(files)) {
            const file = fileArray[0];
            const uploadId = crypto.randomUUID();
            const s3Key = `uploads/${uploadId}`;

            const putCommand = new PutObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || "tensorify-plugins",
              Key: s3Key,
              Body: file.buffer,
              ContentType: file.mimetype,
              Metadata: {
                filename: file.originalname,
                fieldName: fieldName,
                pluginName: pluginName,
                pluginVersion: pluginVersion,
                userId: auth.userId,
              },
            });

            await this.s3Client.send(putCommand);

            const s3Url = `https://${
              process.env.S3_BUCKET_NAME || "tensorify-plugins"
            }.s3.${
              process.env.S3_REGION || "us-east-1"
            }.amazonaws.com/${s3Key}`;
            uploadResults.push(s3Url);
          }

          res.status(200).json({
            success: true,
            message: "All files uploaded successfully",
            files: uploadResults,
            metadata: {
              pluginName,
              pluginVersion,
              userId: auth.userId,
            },
          });
        } catch (uploadError) {
          console.error("S3 upload error:", uploadError);
          res.status(500).json({ error: "Failed to upload files to storage" });
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(401).json({
        error: error instanceof Error ? error.message : "Authentication failed",
      });
    }
  }

  /**
   * Handle plugin publish completion and send webhook to frontend
   */
  async handlePublishComplete(req: Request, res: Response): Promise<void> {
    try {
      // Verify authentication
      const auth = await this.verifyAuth(req);
      console.log("Authenticated user:", auth.userId);

      const { pluginData } = req.body as { pluginData: PluginData };

      if (!pluginData) {
        res.status(400).json({ error: "Plugin data is required" });
        return;
      }

      // Validate required fields
      const requiredFields = [
        "name",
        "version",
        "slug",
        "access",
        "entrypointClassName",
        "files",
      ];
      for (const field of requiredFields) {
        if (!pluginData[field as keyof PluginData]) {
          res.status(400).json({ error: `Missing required field: ${field}` });
          return;
        }
      }

      // Send webhook to frontend
      const webhookSuccess = await this.sendWebhookToFrontend(pluginData);

      if (webhookSuccess) {
        res.status(200).json({
          success: true,
          message: "Plugin published successfully",
          slug: pluginData.slug,
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to notify frontend, but files were uploaded",
        });
      }
    } catch (error) {
      console.error("Publish complete error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Send webhook notification to frontend
   */
  private async sendWebhookToFrontend(
    pluginData: PluginData
  ): Promise<boolean> {
    try {
      const frontendUrl =
        process.env.PLUGIN_REPOSITORY_WEBHOOK_WEBSITE_URL ||
        "https://plugins.tensorify.io";
      const webhookUrl = `${frontendUrl}/api/webhooks/plugin-published`;

      console.log("Sending webhook to:", webhookUrl);
      console.log("Plugin data:", pluginData);

      const response = await axios.post(
        webhookUrl,
        {
          slug: pluginData.slug,
          name: pluginData.name,
          version: pluginData.version,
          description: pluginData.description,
          author: pluginData.author,
          status: "published",
          isPublic: pluginData.access === "public",
          githubUrl: pluginData.repository,
          entrypointClassName: pluginData.entrypointClassName,
          files: pluginData.files,
          publishedAt: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Source": "tensorify-backend",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("Webhook sent successfully:", response.status);
        return true;
      } else {
        console.error(
          "Webhook failed with status:",
          response.status,
          response.data
        );
        return false;
      }
    } catch (error) {
      console.error("Webhook error:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Response status:", error.response?.status);
      }
      return false;
    }
  }

  /**
   * Get plugin files from S3 (for reading/processing)
   */
  async getPluginFile(s3Key: string): Promise<Buffer | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || "tensorify-plugins",
        Key: s3Key,
      });

      const response = await this.s3Client.send(command);

      if (response.Body) {
        const chunks: Uint8Array[] = [];
        const stream = response.Body as any;

        for await (const chunk of stream) {
          chunks.push(chunk);
        }

        return Buffer.concat(chunks);
      }

      return null;
    } catch (error) {
      console.error("Error getting plugin file:", error);
      return null;
    }
  }

  /**
   * Health check for the upload service
   */
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // Test S3 connection by attempting to access bucket
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || "tensorify-plugins",
        Key: "health-check-test",
      });

      // We don't care if the file exists, just that we can connect to S3
      try {
        await this.s3Client.send(command);
      } catch (error: any) {
        // NoSuchKey error is expected and means S3 connection is working
        if (error.name !== "NoSuchKey") {
          throw error;
        }
      }

      return { status: "ok", message: "Upload service is healthy" };
    } catch (error) {
      return {
        status: "error",
        message: `Upload service error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();
