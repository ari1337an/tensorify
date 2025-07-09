/**
 * Basic usage example for @tensorify.io/plugin-engine
 */

import { createPluginEngine } from "../src/index";

// Example 1: Basic usage with credentials
async function basicUsageWithCredentials() {
  try {
    const engine = createPluginEngine(
      {
        region: "us-west-2",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      },
      "my-plugins-bucket",
      {
        debug: true,
        executionTimeout: 60000,
        memoryLimit: 256,
      }
    );

    // Execute plugins
    const result1 = await engine.getExecutionResult("tensorflow-plugin", {
      type: "tensorflow",
      layers: ["dense", "dropout"],
      epochs: 100,
    });

    const result2 = await engine.getExecutionResult("pytorch-plugin", {
      type: "pytorch",
      model: "resnet",
      pretrained: true,
    });

    console.log("TensorFlow plugin result:", result1.code);
    console.log("PyTorch plugin result:", result2.code);

    // List available plugins
    const plugins = await engine.listAvailablePlugins();
    console.log("Available plugins:", plugins);

    // Check if plugin exists
    const exists = await engine.pluginExists("custom-plugin");
    console.log("Custom plugin exists:", exists);

    // Get plugin metadata
    if (exists) {
      const metadata = await engine.getPluginMetadata("custom-plugin");
      console.log("Plugin metadata:", metadata);
    }

    // Get plugin source code
    const sourceCode = await engine.getPluginCode("tensorflow-plugin");
    console.log("Plugin source code:", sourceCode);

    // Cleanup
    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 2: Environment variables approach (user manages their own env vars)
async function environmentVariablesUsage() {
  try {
    // Users handle their own environment variables
    const s3Config = {
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT,
      credentials: process.env.S3_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
            sessionToken: process.env.S3_SESSION_TOKEN,
          }
        : undefined,
      forcePathStyle: !!process.env.S3_ENDPOINT,
    };

    const engine = createPluginEngine(s3Config, "my-plugins-bucket", {
      debug: process.env.NODE_ENV === "development",
      executionTimeout: 30000,
    });

    const result = await engine.getExecutionResult("data-processing-plugin", {
      dataset: "users.csv",
      operations: ["normalize", "filter", "aggregate"],
      outputFormat: "json",
    });

    console.log("Data processing result:", result.code);

    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 3: Custom endpoint (MinIO, LocalStack, etc.)
async function customEndpointUsage() {
  try {
    const engine = createPluginEngine(
      {
        endpoint: "http://localhost:9000", // MinIO endpoint
        forcePathStyle: true,
        credentials: {
          accessKeyId: "minioadmin",
          secretAccessKey: "minioadmin",
        },
      },
      "development-plugins",
      {
        debug: true,
        executionTimeout: 15000,
        memoryLimit: 128,
        basePath: "plugins/v1",
      }
    );

    const result = await engine.getExecutionResult("test-plugin", {
      environment: "development",
      testData: true,
    });

    console.log("Development result:", result.code);

    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 4: Production configuration
async function productionConfiguration() {
  try {
    const engine = createPluginEngine(
      {
        region: "us-west-2",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      },
      "production-plugins",
      {
        executionTimeout: 120000,
        memoryLimit: 512,
        debug: false,
        basePath: "plugins/v1",
      }
    );

    const result = await engine.getExecutionResult("ml-model-plugin", {
      algorithm: "random-forest",
      features: ["age", "income", "education"],
      target: "purchase_probability",
    });

    console.log("ML model result:", result.code);

    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 5: Error handling
async function errorHandlingExample() {
  try {
    const engine = createPluginEngine(
      {
        region: "us-east-1",
        credentials: {
          accessKeyId: "invalid-key",
          secretAccessKey: "invalid-secret",
        },
      },
      "test-bucket"
    );

    await engine.getExecutionResult("non-existent-plugin", {});

    await engine.dispose();
  } catch (error) {
    // Handle specific error types from the library
    if (error instanceof Error) {
      console.error("Error type:", error.constructor.name);
      console.error("Message:", error.message);

      // Check for specific plugin engine error properties
      if ("code" in error) {
        console.error("Error code:", (error as any).code);
      }

      if ("timestamp" in error) {
        console.error("Error timestamp:", (error as any).timestamp);
      }

      if ("bucketName" in error) {
        console.error("Bucket:", (error as any).bucketName);
      }
    }
  }
}

// Example 6: Multiple plugin execution
async function multiplePluginExecution() {
  try {
    const engine = createPluginEngine(
      {
        region: "us-east-1",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      },
      "ml-plugins",
      {
        executionTimeout: 60000,
        memoryLimit: 256,
      }
    );

    // Execute multiple plugins in parallel
    const [dataResult, modelResult, analysisResult] = await Promise.all([
      engine.getExecutionResult("data-preprocessor", { dataset: "users.csv" }),
      engine.getExecutionResult("ml-trainer", { algorithm: "random-forest" }),
      engine.getExecutionResult("result-analyzer", { threshold: 0.85 }),
    ]);

    console.log("Data processing:", dataResult.code);
    console.log("Model training:", modelResult.code);
    console.log("Analysis:", analysisResult.code);

    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run examples
if (require.main === module) {
  console.log("Plugin Engine Examples - Clean API");
  console.log("==================================");

  // Uncomment to run specific examples
  // basicUsageWithCredentials();
  // environmentVariablesUsage();
  // customEndpointUsage();
  // productionConfiguration();
  // errorHandlingExample();
  // multiplePluginExecution();
}

export {
  basicUsageWithCredentials,
  environmentVariablesUsage,
  customEndpointUsage,
  productionConfiguration,
  errorHandlingExample,
  multiplePluginExecution,
};
