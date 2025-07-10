/**
 * MCP Server for S3 Plugin Management
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { S3PluginService } from "./s3-service.js";
import {
  EnvConfig,
  CheckPluginExistsParamsSchema,
  ListFilesParamsSchema,
  UploadPluginCodeParamsSchema,
  UploadPluginManifestParamsSchema,
  DeletePluginParamsSchema,
  ToolResponse,
} from "./types.js";
import { Logger, generateRequestId, createSafeErrorMessage } from "./utils.js";

/**
 * MCP Server for S3 Plugin Management
 */
export class S3PluginMCPServer {
  private readonly server: Server;
  private readonly s3Service: S3PluginService;
  private readonly logger: Logger;

  constructor(config: EnvConfig) {
    this.logger = new Logger(config.DEBUG_LOGGING);
    this.s3Service = new S3PluginService(config, this.logger);

    this.server = new Server(
      {
        name: "tensorify-s3-plugin-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.logger.info("S3PluginMCPServer initialized");
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const requestId = generateRequestId();
      this.logger.debug(`Processing tool call: ${request.params.name}`, {
        requestId,
      });

      try {
        switch (request.params.name) {
          case "check_if_plugin_exists":
            return await this.handleCheckPluginExists(
              request.params.arguments,
              requestId
            );

          case "list_files_for_plugins":
            return await this.handleListFilesForPlugins(
              request.params.arguments,
              requestId
            );

          case "upload_plugin_code":
            return await this.handleUploadPluginCode(
              request.params.arguments,
              requestId
            );

          case "upload_plugin_manifest":
            return await this.handleUploadPluginManifest(
              request.params.arguments,
              requestId
            );

          case "delete_plugin_code":
            return await this.handleDeletePluginCode(
              request.params.arguments,
              requestId
            );

          case "delete_plugin_manifest":
            return await this.handleDeletePluginManifest(
              request.params.arguments,
              requestId
            );

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        this.logger.error(`Tool call failed: ${request.params.name}`, {
          requestId,
          error: createSafeErrorMessage(error),
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: createSafeErrorMessage(error),
                  requestId,
                },
                null,
                2
              ),
            },
          ],
        };
      }
    });
  }

  /**
   * Get available tools for MCP
   */
  private getAvailableTools(): Tool[] {
    return [
      {
        name: "check_if_plugin_exists",
        description:
          "Check if a plugin exists in S3 storage by its slug (@namespace/plugin-name:version)",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description:
                "Plugin slug in format @namespace/plugin-name:version",
              pattern: "^@[a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+:\\d+\\.\\d+\\.\\d+$",
            },
          },
          required: ["slug"],
        },
      },
      {
        name: "list_files_for_plugins",
        description:
          "List plugin files in S3 storage with optional filtering by namespace, plugin name, or version",
        inputSchema: {
          type: "object",
          properties: {
            namespace: {
              type: "string",
              description: "Filter by namespace (optional)",
            },
            pluginName: {
              type: "string",
              description: "Filter by plugin name (optional)",
            },
            version: {
              type: "string",
              description: "Filter by version (optional)",
            },
            limit: {
              type: "number",
              description:
                "Maximum number of plugins to return (default: 100, max: 1000)",
              minimum: 1,
              maximum: 1000,
            },
          },
        },
      },
      {
        name: "upload_plugin_code",
        description: "Upload plugin code to S3 storage",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description:
                "Plugin slug in format @namespace/plugin-name:version",
              pattern: "^@[a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+:\\d+\\.\\d+\\.\\d+$",
            },
            code: {
              type: "string",
              description: "Plugin code content",
              minLength: 1,
            },
            contentType: {
              type: "string",
              description:
                "Content type for the code file (default: application/javascript)",
              default: "application/javascript",
            },
          },
          required: ["slug", "code"],
        },
      },
      {
        name: "upload_plugin_manifest",
        description: "Upload plugin manifest to S3 storage",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description:
                "Plugin slug in format @namespace/plugin-name:version",
              pattern: "^@[a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+:\\d+\\.\\d+\\.\\d+$",
            },
            manifest: {
              type: "string",
              description: "Plugin manifest as JSON string",
              minLength: 1,
            },
          },
          required: ["slug", "manifest"],
        },
      },
      {
        name: "delete_plugin_code",
        description: "Delete plugin code from S3 storage",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description:
                "Plugin slug in format @namespace/plugin-name:version",
              pattern: "^@[a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+:\\d+\\.\\d+\\.\\d+$",
            },
          },
          required: ["slug"],
        },
      },
      {
        name: "delete_plugin_manifest",
        description: "Delete plugin manifest from S3 storage",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description:
                "Plugin slug in format @namespace/plugin-name:version",
              pattern: "^@[a-zA-Z0-9_-]+\\/[a-zA-Z0-9_-]+:\\d+\\.\\d+\\.\\d+$",
            },
          },
          required: ["slug"],
        },
      },
    ];
  }

  /**
   * Handle check_if_plugin_exists tool call
   */
  private async handleCheckPluginExists(args: any, requestId: string) {
    const params = CheckPluginExistsParamsSchema.parse(args);
    const result = await this.s3Service.checkPluginExists(params.slug);

    this.logger.debug(`check_if_plugin_exists completed`, {
      requestId,
      slug: params.slug,
      success: result.success,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle list_files_for_plugins tool call
   */
  private async handleListFilesForPlugins(args: any, requestId: string) {
    const params = ListFilesParamsSchema.parse(args || {});
    const result = await this.s3Service.listPluginFiles(
      params.namespace,
      params.pluginName,
      params.version,
      params.limit
    );

    this.logger.debug(`list_files_for_plugins completed`, {
      requestId,
      success: result.success,
      count: result.data?.length || 0,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle upload_plugin_code tool call
   */
  private async handleUploadPluginCode(args: any, requestId: string) {
    const params = UploadPluginCodeParamsSchema.parse(args);
    const result = await this.s3Service.uploadPluginCode(
      params.slug,
      params.code,
      params.contentType
    );

    this.logger.debug(`upload_plugin_code completed`, {
      requestId,
      slug: params.slug,
      success: result.success,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle upload_plugin_manifest tool call
   */
  private async handleUploadPluginManifest(args: any, requestId: string) {
    const params = UploadPluginManifestParamsSchema.parse(args);
    const result = await this.s3Service.uploadPluginManifest(
      params.slug,
      params.manifest
    );

    this.logger.debug(`upload_plugin_manifest completed`, {
      requestId,
      slug: params.slug,
      success: result.success,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle delete_plugin_code tool call
   */
  private async handleDeletePluginCode(args: any, requestId: string) {
    const params = DeletePluginParamsSchema.parse(args);
    const result = await this.s3Service.deletePluginCode(params.slug);

    this.logger.debug(`delete_plugin_code completed`, {
      requestId,
      slug: params.slug,
      success: result.success,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle delete_plugin_manifest tool call
   */
  private async handleDeletePluginManifest(args: any, requestId: string) {
    const params = DeletePluginParamsSchema.parse(args);
    const result = await this.s3Service.deletePluginManifest(params.slug);

    this.logger.debug(`delete_plugin_manifest completed`, {
      requestId,
      slug: params.slug,
      success: result.success,
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Get the MCP server instance
   */
  getServer(): Server {
    return this.server;
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    this.logger.info("Starting S3 Plugin MCP Server");

    // Perform health check
    const healthCheck = await this.s3Service.healthCheck();
    if (!healthCheck.success) {
      this.logger.error("S3 health check failed, but continuing anyway", {
        error: healthCheck.error,
      });
    } else {
      this.logger.info("S3 health check passed");
    }
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    this.logger.info("Stopping S3 Plugin MCP Server");
    await this.server.close();
  }
}
