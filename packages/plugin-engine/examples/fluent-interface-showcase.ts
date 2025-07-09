/**
 * Clean API Showcase - @tensorify.io/plugin-engine
 *
 * This example demonstrates the clean, professional API design
 * that follows best practices for library packages.
 */

import { createPluginEngine } from "../src/index";

/**
 * Example 1: Primary recommended approach - Direct S3 configuration
 *
 * Users handle their own environment variables and pass explicit configuration.
 * This follows proper library design patterns.
 */
async function primaryRecommendedApproach() {
  // Users handle their own environment variable configuration
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
    forcePathStyle: !!process.env.S3_ENDPOINT, // Required for custom endpoints like MinIO
  };

  // Engine options for execution configuration
  const engineOptions = {
    debug: process.env.NODE_ENV === "development",
    executionTimeout: 60000, // 60 seconds
    memoryLimit: 256, // 256 MB
    basePath: "plugins/v1", // Optional base path for organized plugin storage
  };

  // Create engine with clean API
  const engine = createPluginEngine(
    s3Config,
    "my-plugins-bucket",
    engineOptions
  );

  try {
    // Execute multiple plugins
    const results = await Promise.all([
      engine.getExecutionResult("data-preprocessor", {
        dataset: "sales_data.csv",
        operations: ["clean", "normalize", "feature_engineering"],
        target_column: "revenue",
      }),

      engine.getExecutionResult("ml-trainer", {
        algorithm: "random_forest",
        hyperparameters: {
          n_estimators: 100,
          max_depth: 10,
          random_state: 42,
        },
        validation_split: 0.2,
      }),

      engine.getExecutionResult("model-evaluator", {
        metrics: ["accuracy", "precision", "recall", "f1"],
        cross_validation: true,
        folds: 5,
      }),
    ]);

    console.log("Data preprocessing code:", results[0].code);
    console.log("ML training code:", results[1].code);
    console.log("Model evaluation code:", results[2].code);

    // Plugin management features
    const availablePlugins = await engine.listAvailablePlugins();
    console.log("Available plugins:", availablePlugins);

    // Check plugin existence before execution
    const exists = await engine.pluginExists("custom-transformer");
    if (exists) {
      const metadata = await engine.getPluginMetadata("custom-transformer");
      console.log("Plugin size:", metadata.size, "bytes");
      console.log("Last modified:", metadata.lastModified);
    }
  } finally {
    // Clean up resources
    await engine.dispose();
  }
}

/**
 * Example 2: Production configuration
 *
 * Proper production setup with explicit configuration
 */
async function productionConfiguration() {
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
      debug: false, // Production setting
      executionTimeout: 30000,
      memoryLimit: 512,
    }
  );

  try {
    const result = await engine.getExecutionResult("production-pipeline", {
      environment: "production",
      batch_size: 1000,
      monitoring_enabled: true,
    });

    console.log("Production pipeline code:", result.code);
    console.log("Execution time:", result.metadata?.executionTime, "ms");
  } finally {
    await engine.dispose();
  }
}

/**
 * Example 3: Development with custom endpoints (MinIO, LocalStack)
 *
 * Perfect for local development and testing environments
 */
async function developmentWithCustomEndpoints() {
  const engine = createPluginEngine(
    {
      endpoint: "http://localhost:9000", // MinIO endpoint
      forcePathStyle: true, // Required for custom endpoints
      credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
      },
    },
    "dev-plugins",
    {
      debug: true,
      executionTimeout: 15000, // Shorter timeout for development
      memoryLimit: 128,
    }
  );

  try {
    const result = await engine.getExecutionResult("dev-test-plugin", {
      test_mode: true,
      mock_data: true,
      debug_output: true,
    });

    console.log("Development test result:", result.code);
  } finally {
    await engine.dispose();
  }
}

/**
 * Example 4: Multiple configurations for different environments
 *
 * Shows how to handle different configurations cleanly
 */
async function multipleEnvironmentConfigurations() {
  // Development configuration
  const devEngine = createPluginEngine(
    {
      endpoint: "http://localhost:9000",
      forcePathStyle: true,
      credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
      },
    },
    "dev-plugins",
    {
      debug: true,
      executionTimeout: 15000,
    }
  );

  // Production configuration
  const prodEngine = createPluginEngine(
    {
      region: "us-west-2",
      credentials: {
        accessKeyId: process.env.PROD_ACCESS_KEY_ID!,
        secretAccessKey: process.env.PROD_SECRET_ACCESS_KEY!,
      },
    },
    "prod-plugins",
    {
      debug: false,
      executionTimeout: 60000,
      memoryLimit: 512,
    }
  );

  try {
    // Run different plugins in different environments
    const [devResult, prodResult] = await Promise.all([
      devEngine.getExecutionResult("test-plugin", { env: "development" }),
      prodEngine.getExecutionResult("production-plugin", { env: "production" }),
    ]);

    console.log("Development result:", devResult.code);
    console.log("Production result:", prodResult.code);
  } finally {
    await Promise.all([devEngine.dispose(), prodEngine.dispose()]);
  }
}

/**
 * Example 5: Production-ready error handling
 *
 * Demonstrates comprehensive error handling with specific error types
 */
async function productionErrorHandling() {
  try {
    const engine = createPluginEngine(
      {
        region: "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      },
      "production-plugins"
    );

    const result = await engine.getExecutionResult("critical-analysis", {
      priority: "high",
      data_sensitivity: "confidential",
    });

    console.log("Critical analysis completed:", result.code);
    await engine.dispose();
  } catch (error) {
    // Handle specific error types for better monitoring and debugging
    if (error instanceof Error) {
      console.error(`[${error.constructor.name}] ${error.message}`);

      // Log additional context for specific error types
      if ("bucketName" in error) {
        console.error("Bucket:", (error as any).bucketName);
      }

      if ("timeoutMs" in error) {
        console.error("Timeout after:", (error as any).timeoutMs, "ms");
      }

      if ("limitMB" in error) {
        console.error("Memory limit:", (error as any).limitMB, "MB");
      }

      // In production, you would send this to your monitoring system
      // logger.error('Plugin execution failed', { error, context: {...} });
    }
  }
}

/**
 * Example 6: Advanced plugin management
 *
 * Shows all plugin management features
 */
async function advancedPluginManagement() {
  const engine = createPluginEngine(
    {
      region: process.env.S3_REGION || "us-east-1",
      credentials: process.env.S3_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          }
        : undefined,
    },
    "plugin-library",
    {
      debug: true,
    }
  );

  try {
    // List all available plugins
    const allPlugins = await engine.listAvailablePlugins(50);
    console.log("All available plugins:", allPlugins);

    // Check existence and get metadata for each plugin
    for (const pluginSlug of allPlugins.slice(0, 5)) {
      const exists = await engine.pluginExists(pluginSlug);
      if (exists) {
        const metadata = await engine.getPluginMetadata(pluginSlug);
        console.log(`Plugin ${pluginSlug}:`, {
          size: metadata.size,
          lastModified: metadata.lastModified,
          contentType: metadata.contentType,
        });

        // Get source code for inspection
        const sourceCode = await engine.getPluginCode(pluginSlug);
        console.log(`${pluginSlug} source length:`, sourceCode.length);
      }
    }
  } finally {
    await engine.dispose();
  }
}

// Export all examples for testing and documentation
export {
  primaryRecommendedApproach,
  productionConfiguration,
  developmentWithCustomEndpoints,
  multipleEnvironmentConfigurations,
  productionErrorHandling,
  advancedPluginManagement,
};

// Demo runner
if (require.main === module) {
  console.log("🚀 Plugin Engine Clean API Showcase");
  console.log("===================================");
  console.log("");
  console.log("This showcases the new clean, professional API that:");
  console.log("✅ Takes explicit S3 configuration objects");
  console.log("✅ Maps directly to S3Client constructor options");
  console.log("✅ Lets users handle their own environment variables");
  console.log("✅ Provides clear, typed interfaces");
  console.log("✅ Follows library best practices");
  console.log("");
  console.log("Uncomment examples below to test them:");
  console.log("");

  // Uncomment to run examples:
  // primaryRecommendedApproach();
  // productionConfiguration();
  // developmentWithCustomEndpoints();
  // multipleEnvironmentConfigurations();
  // productionErrorHandling();
  // advancedPluginManagement();
}
