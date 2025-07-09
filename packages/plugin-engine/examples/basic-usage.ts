/**
 * Basic usage example for @tensorify.io/plugin-engine
 */

import {
  getExecutionResult,
  PluginEngineFactory,
  PluginEngine,
  S3StorageService,
  IStorageService,
} from "../src/index";
import { S3Client } from "@aws-sdk/client-s3";

// Example 1: Simple usage with the main function
async function simpleUsage() {
  try {
    // Using environment variables for configuration
    const result = await getExecutionResult("my-plugin", {
      inputData: "test data",
      parameters: { threshold: 0.5 },
    });

    console.log("Generated code:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 2: Using the factory pattern
async function factoryUsage() {
  try {
    // Create engine with credentials
    const engine = PluginEngineFactory.createWithCredentials(
      "my-plugins-bucket",
      {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: "us-west-2",
      }
    );

    // Execute multiple plugins
    const result1 = await engine.getExecutionResult("plugin-1", {
      type: "tensorflow",
      layers: ["dense", "dropout"],
    });

    const result2 = await engine.getExecutionResult("plugin-2", {
      type: "pytorch",
      model: "resnet",
    });

    console.log("TensorFlow plugin result:", result1.code);
    console.log("PyTorch plugin result:", result2.code);

    // List available plugins
    const plugins = await engine.listAvailablePlugins();
    console.log("Available plugins:", plugins);

    // Cleanup
    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 3: Advanced usage with custom configuration
async function advancedUsage() {
  try {
    // Custom S3 client
    const s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Create factory with custom defaults
    const factory = new PluginEngineFactory({
      defaultBucketName: "tensorify-plugins",
      defaultExecutionTimeout: 60000, // 60 seconds
      defaultMemoryLimit: 256, // 256 MB
      defaultDebug: true,
    });

    // Create engine with custom configuration
    const engine = factory.createWithS3Client(s3Client, {
      bucketName: "my-custom-bucket",
      basePath: "plugins/production",
      executionTimeout: 30000,
      memoryLimit: 512,
      debug: true,
    });

    // Execute plugin with detailed error handling
    const result = await engine.getExecutionResult("advanced-plugin", {
      model: {
        type: "transformer",
        layers: 12,
        hiddenSize: 768,
      },
      training: {
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
      },
    });

    console.log("Generated code:", result.code);
    console.log("Execution time:", result.metadata?.executionTime, "ms");
    console.log("Memory usage:", result.metadata?.memoryUsage);

    // Check if plugin exists before execution
    const pluginExists = await engine.pluginExists("another-plugin");
    if (pluginExists) {
      console.log("Plugin exists, can execute safely");
    }

    // Get plugin metadata
    const metadata = await engine.getPluginMetadata("advanced-plugin");
    console.log("Plugin metadata:", metadata);

    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 4: Error handling
async function errorHandlingExample() {
  try {
    const engine = PluginEngineFactory.createDefault("test-bucket");

    const result = await engine.getExecutionResult("non-existent-plugin", {});

    await engine.dispose();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      console.error("Error type:", error.constructor.name);
      console.error("Message:", error.message);

      // Type-specific error handling
      if ("code" in error) {
        console.error("Error code:", (error as any).code);
      }

      if ("timestamp" in error) {
        console.error("Error timestamp:", (error as any).timestamp);
      }
    }
  }
}

// Example 5: Testing setup
async function testingSetup() {
  try {
    // Create engine for testing with LocalStack or MinIO
    const engine = PluginEngineFactory.createForTesting(
      "test-bucket",
      "http://localhost:4566", // LocalStack endpoint
      {
        executionTimeout: 5000,
        memoryLimit: 64,
        debug: true,
      }
    );

    // Test plugin execution
    const result = await engine.getExecutionResult("test-plugin", {
      test: true,
      data: "sample",
    });

    console.log("Test result:", result.code);

    await engine.dispose();
  } catch (error) {
    console.error("Test error:", error);
  }
}

// Run examples
if (require.main === module) {
  console.log("Plugin Engine Examples");
  console.log("=====================");

  // Uncomment to run specific examples
  // simpleUsage();
  // factoryUsage();
  // advancedUsage();
  // errorHandlingExample();
  // testingSetup();
}

export {
  simpleUsage,
  factoryUsage,
  advancedUsage,
  errorHandlingExample,
  testingSetup,
};
