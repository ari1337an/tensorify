#!/usr/bin/env node

/**
 * S3 Plugin Management MCP Server
 *
 * A Model Context Protocol server that provides tools for managing plugins
 * in S3-compatible storage systems. This server is designed to work with
 * Claude in Cursor IDE for seamless plugin development and deployment.
 */

import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { S3PluginMCPServer } from "./server.js";
import { validateEnvironment, createSafeErrorMessage } from "./utils.js";

/**
 * Main function to start the MCP server
 */
async function main(): Promise<void> {
  try {
    // Validate environment configuration
    const config = validateEnvironment(process.env);

    // Create and start the MCP server
    const mcpServer = new S3PluginMCPServer(config);
    await mcpServer.start();

    // Setup stdio transport for MCP communication
    const transport = new StdioServerTransport();
    await mcpServer.getServer().connect(transport);

    // Setup graceful shutdown
    const shutdown = async () => {
      console.error("Shutting down MCP server...");
      try {
        await mcpServer.stop();
        process.exit(0);
      } catch (error) {
        console.error("Error during shutdown:", createSafeErrorMessage(error));
        process.exit(1);
      }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    process.on("SIGHUP", shutdown);
  } catch (error) {
    console.error("Failed to start MCP server:", createSafeErrorMessage(error));

    // Provide helpful error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes("S3_ACCESS_KEY_ID")) {
        console.error(
          "\n💡 Make sure to set your S3 credentials in environment variables:"
        );
        console.error(
          "   S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_REGION, S3_BUCKET_NAME"
        );
        console.error("\n📖 See env.template for the complete configuration.");
      }

      if (error.message.includes("S3_ENDPOINT")) {
        console.error(
          "\n💡 Make sure S3_ENDPOINT is a valid URL (e.g., https://s3.amazonaws.com)"
        );
      }
    }

    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the server
main().catch((error) => {
  console.error("Fatal error:", createSafeErrorMessage(error));
  process.exit(1);
});
