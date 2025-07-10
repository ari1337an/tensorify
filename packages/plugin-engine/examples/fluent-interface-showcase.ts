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
    // Execute multiple plugins with different entry point patterns
    const results = await Promise.all([
      // Simple function call
      engine.getExecutionResult(
        "data-preprocessor:2.1.0",
        {
          dataset: "sales_data.csv",
          operations: ["clean", "normalize", "feature_engineering"],
          targetColumn: "revenue",
          missingValueStrategy: "median",
          encoding: {
            categorical: "one_hot",
            numerical: "standard_scaler",
          },
        },
        "preprocessData"
      ),

      // Class method call
      engine.getExecutionResult(
        "ml-trainer:3.0.1",
        {
          algorithm: "random_forest",
          hyperparameters: {
            n_estimators: 100,
            max_depth: 10,
            random_state: 42,
            feature_importance: true,
          },
          validation: {
            method: "train_test_split",
            test_size: 0.2,
            stratify: true,
          },
        },
        "MLTrainer.trainModel"
      ),

      // Nested method call
      engine.getExecutionResult(
        "model-evaluator:1.5.2",
        {
          metrics: ["accuracy", "precision", "recall", "f1", "roc_auc"],
          crossValidation: {
            enabled: true,
            folds: 5,
            scoring: "f1_weighted",
          },
          visualization: {
            plot_confusion_matrix: true,
            plot_roc_curve: true,
            plot_feature_importance: true,
          },
        },
        "evaluation.metrics.generateReport"
      ),

      // Deep nested method call
      engine.getExecutionResult(
        "deployment-tools:4.2.0",
        {
          model: "trained_random_forest",
          platform: "aws_sagemaker",
          configuration: {
            instance_type: "ml.m5.large",
            auto_scaling: {
              min_instances: 1,
              max_instances: 10,
              target_invocations_per_instance: 1000,
            },
            monitoring: {
              enable_data_capture: true,
              capture_percentage: 20,
            },
          },
        },
        "deployment.cloud.sagemaker.createEndpoint"
      ),
    ]);

    console.log("Data preprocessing code:", results[0].code);
    console.log("ML training code:", results[1].code);
    console.log("Model evaluation code:", results[2].code);
    console.log("Deployment code:", results[3].code);

    // Plugin management features
    const availablePlugins = await engine.listAvailablePlugins();
    console.log("Available plugins:", availablePlugins);

    // Check plugin existence before execution
    const exists = await engine.pluginExists("custom-transformer");
    if (exists) {
      const metadata = await engine.getPluginMetadata("custom-transformer");
      console.log("Plugin size:", metadata.size, "bytes");
      console.log("Last modified:", metadata.lastModified);

      // Get plugin manifest to see available entry points
      const manifest = await engine.getPluginManifest("custom-transformer");
      console.log(
        "Available entry points:",
        Object.keys(manifest.entryPoints || {})
      );
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
    // Production workflow with complex pipeline
    const result = await engine.getExecutionResult(
      "production-pipeline:5.1.0",
      {
        environment: "production",
        workflow: {
          batch_size: 1000,
          parallelism: 4,
          error_handling: "retry_with_backoff",
          max_retries: 3,
        },
        monitoring: {
          enabled: true,
          metrics: ["throughput", "latency", "error_rate"],
          alerts: {
            email: ["ops@company.com"],
            slack_channel: "#ml-ops",
          },
        },
        data_quality: {
          validation_rules: ["not_null", "data_type_check", "range_validation"],
          quarantine_invalid: true,
        },
      },
      "ProductionPipeline.executeWorkflow"
    );

    console.log("Production pipeline code:", result.code);
    console.log("Execution time:", result.metadata?.executionTime, "ms");
    console.log("Memory usage:", result.metadata?.memoryUsage, "bytes");
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
    // Development testing with mock data
    const testResults = await Promise.all([
      // Simple function for quick testing
      engine.getExecutionResult(
        "dev-test-plugin",
        {
          testMode: true,
          mockData: {
            rows: 1000,
            features: ["feature1", "feature2", "feature3"],
            distribution: "normal",
          },
          debugOutput: true,
          logLevel: "verbose",
        },
        "generateMockDataset"
      ),

      // Class method for data validation
      engine.getExecutionResult(
        "data-validator-plugin",
        {
          schema: {
            columns: ["id", "name", "age", "score"],
            types: ["int", "string", "int", "float"],
            constraints: {
              age: { min: 0, max: 120 },
              score: { min: 0.0, max: 1.0 },
            },
          },
          errorHandling: "log_and_continue",
        },
        "DataValidator.validateSchema"
      ),

      // Nested utility method
      engine.getExecutionResult(
        "dev-utilities-plugin",
        {
          utilities: {
            performance_profiling: true,
            memory_monitoring: true,
            execution_tracing: true,
          },
        },
        "dev.utils.profiling.generateReport"
      ),
    ]);

    console.log("Mock data generation:", testResults[0].code);
    console.log("Data validation:", testResults[1].code);
    console.log("Performance profiling:", testResults[2].code);
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
      executionTimeout: 10000,
      memoryLimit: 128,
    }
  );

  // Staging configuration
  const stagingEngine = createPluginEngine(
    {
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.STAGING_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STAGING_SECRET_ACCESS_KEY!,
      },
    },
    "staging-plugins",
    {
      debug: true,
      executionTimeout: 30000,
      memoryLimit: 256,
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
    // Execute same plugin across different environments
    const environments = [
      { name: "development", engine: devEngine },
      { name: "staging", engine: stagingEngine },
      { name: "production", engine: prodEngine },
    ];

    for (const env of environments) {
      console.log(`\n--- ${env.name.toUpperCase()} ENVIRONMENT ---`);

      const result = await env.engine.getExecutionResult(
        "environment-specific-plugin",
        {
          environment: env.name,
          configuration: {
            logging_level: env.name === "production" ? "error" : "debug",
            cache_enabled: env.name === "production",
            performance_monitoring: env.name !== "development",
          },
          features: {
            experimental: env.name === "development",
            beta: env.name === "staging",
            stable: env.name === "production",
          },
        },
        "EnvironmentHandler.configureForEnvironment"
      );

      console.log(`${env.name} result:`, result.code.substring(0, 200) + "...");
    }
  } finally {
    // Clean up all engines
    await Promise.all([
      devEngine.dispose(),
      stagingEngine.dispose(),
      prodEngine.dispose(),
    ]);
  }
}

/**
 * Example 5: Comprehensive error handling in production
 *
 * Shows proper error handling with detailed error information
 */
async function productionErrorHandling() {
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

  try {
    // This will demonstrate error handling
    await engine.getExecutionResult(
      "non-existent-plugin",
      {
        data: "test data",
        shouldFail: true,
      },
      "NonExistentClass.missingMethod"
    );
  } catch (error) {
    // Type-safe error handling
    if (error instanceof Error) {
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);

      // Plugin engine specific error properties
      const pluginError = error as any;
      if (pluginError.bucketName) {
        console.error("Bucket:", pluginError.bucketName);
      }
      if (pluginError.pluginSlug) {
        console.error("Plugin:", pluginError.pluginSlug);
      }
      if (pluginError.executionTime) {
        console.error("Execution time:", pluginError.executionTime, "ms");
      }
      if (pluginError.memoryUsed) {
        console.error("Memory used:", pluginError.memoryUsed, "bytes");
      }
    }
  } finally {
    await engine.dispose();
  }
}

/**
 * Example 6: Advanced plugin management and introspection
 *
 * Shows advanced features for plugin discovery and management
 */
async function advancedPluginManagement() {
  const engine = createPluginEngine(
    {
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    },
    "ml-plugins",
    {
      debug: true,
    }
  );

  try {
    // Discover available plugins
    const plugins = await engine.listAvailablePlugins(20);
    console.log(`Found ${plugins.length} available plugins:`);

    for (const pluginSlug of plugins.slice(0, 5)) {
      // Check if plugin exists
      const exists = await engine.pluginExists(pluginSlug);
      if (!exists) continue;

      // Get plugin metadata
      const metadata = await engine.getPluginMetadata(pluginSlug);
      console.log(`\n--- ${pluginSlug} ---`);
      console.log("Size:", metadata.size, "bytes");
      console.log("Last modified:", metadata.lastModified?.toISOString());

      // Get plugin manifest to understand capabilities
      try {
        const manifest = await engine.getPluginManifest(pluginSlug);
        console.log("Name:", manifest.name);
        console.log("Version:", manifest.version);
        console.log("Description:", manifest.description);

        if (manifest.entryPoints) {
          console.log(
            "Available entry points:",
            Object.keys(manifest.entryPoints)
          );

          // Show entry point details
          Object.entries(manifest.entryPoints).forEach(
            ([entryPoint, config]) => {
              console.log(
                `  - ${entryPoint}: ${config.description || "No description"}`
              );
              if (config.parameters) {
                const paramNames = Object.keys(config.parameters);
                console.log(`    Parameters: ${paramNames.join(", ")}`);
              }
            }
          );
        }

        // Test execution with first available entry point
        const entryPoints = Object.keys(manifest.entryPoints || {});
        if (entryPoints.length > 0) {
          const firstEntryPoint = entryPoints[0];
          console.log(`Testing entry point: ${firstEntryPoint}`);

          try {
            const result = await engine.getExecutionResult(
              pluginSlug,
              {
                test: true,
                mode: "demonstration",
                sampleData: [1, 2, 3, 4, 5],
              },
              firstEntryPoint
            );
            console.log("Test execution successful!");
            console.log(
              "Generated code length:",
              result.code.length,
              "characters"
            );
          } catch (execError) {
            console.log("Test execution failed:", (execError as Error).message);
          }
        }
      } catch (manifestError) {
        console.log(
          "Could not read manifest:",
          (manifestError as Error).message
        );
      }
    }
  } finally {
    await engine.dispose();
  }
}

/**
 * Example 7: Plugin patterns and best practices
 *
 * Demonstrates different plugin usage patterns and best practices
 */
async function pluginPatternsAndBestPractices() {
  const engine = createPluginEngine(
    {
      region: "us-west-2",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    },
    "pattern-examples",
    {
      debug: true,
    }
  );

  try {
    console.log("=== Plugin Usage Patterns ===\n");

    // Pattern 1: Simple function calls
    console.log("1. Simple Function Calls:");
    const simpleResults = await Promise.all([
      engine.getExecutionResult(
        "utility-functions",
        { text: "Hello World", operation: "reverse" },
        "reverseString"
      ),
      engine.getExecutionResult(
        "math-functions",
        { numbers: [1, 2, 3, 4, 5], operation: "sum" },
        "calculateSum"
      ),
      engine.getExecutionResult(
        "data-functions",
        { data: [{ a: 1 }, { a: 2 }], key: "a" },
        "extractColumn"
      ),
    ]);
    simpleResults.forEach((result, i) => {
      console.log(
        `  Function ${i + 1} result: ${result.code.substring(0, 50)}...`
      );
    });

    // Pattern 2: Class method calls
    console.log("\n2. Class Method Calls:");
    const classResults = await Promise.all([
      engine.getExecutionResult(
        "data-processors",
        {
          data: "raw_dataset.csv",
          transformations: ["normalize", "clean", "encode"],
        },
        "DataProcessor.transform"
      ),
      engine.getExecutionResult(
        "ml-models",
        {
          algorithm: "random_forest",
          hyperparameters: { n_estimators: 100, max_depth: 10 },
        },
        "RandomForestModel.train"
      ),
      engine.getExecutionResult(
        "evaluation-tools",
        {
          predictions: "model_predictions.npy",
          ground_truth: "true_labels.npy",
          metrics: ["accuracy", "f1", "precision", "recall"],
        },
        "ModelEvaluator.generateReport"
      ),
    ]);
    classResults.forEach((result, i) => {
      console.log(
        `  Class method ${i + 1} result: ${result.code.substring(0, 50)}...`
      );
    });

    // Pattern 3: Nested object methods
    console.log("\n3. Nested Object Methods:");
    const nestedResults = await Promise.all([
      engine.getExecutionResult(
        "analytics-suite",
        {
          data_source: "user_analytics",
          time_range: "last_30_days",
          metrics: ["engagement", "retention", "conversion"],
        },
        "analytics.reports.generateDashboard"
      ),
      engine.getExecutionResult(
        "ml-pipeline-tools",
        {
          stages: ["preprocess", "train", "validate", "deploy"],
          config: { parallel: true, monitoring: true },
        },
        "pipeline.orchestration.executeWorkflow"
      ),
      engine.getExecutionResult(
        "data-quality-tools",
        {
          dataset: "customer_data.parquet",
          checks: ["completeness", "validity", "consistency"],
          thresholds: { completeness: 0.95, validity: 0.99 },
        },
        "quality.validation.runChecks"
      ),
    ]);
    nestedResults.forEach((result, i) => {
      console.log(
        `  Nested method ${i + 1} result: ${result.code.substring(0, 50)}...`
      );
    });

    // Pattern 4: Deep nesting with services
    console.log("\n4. Deep Service Methods:");
    const serviceResults = await Promise.all([
      engine.getExecutionResult(
        "enterprise-ml-suite",
        {
          project: "customer_churn_prediction",
          model_type: "ensemble",
          deployment_target: "production",
          monitoring: { enabled: true, alerts: true },
        },
        "services.ml.models.ensemble.GradientBoosting.trainAndDeploy"
      ),
      engine.getExecutionResult(
        "data-platform-tools",
        {
          source: "data_lake",
          destination: "feature_store",
          transformations: ["clean", "aggregate", "feature_engineer"],
          schedule: "daily",
        },
        "platform.data.pipeline.etl.createScheduledJob"
      ),
    ]);
    serviceResults.forEach((result, i) => {
      console.log(
        `  Service method ${i + 1} result: ${result.code.substring(0, 50)}...`
      );
    });

    console.log("\n=== Best Practices Demonstrated ===");
    console.log("✓ Clear and descriptive entry point names");
    console.log("✓ Structured payload data with proper nesting");
    console.log("✓ Consistent naming conventions");
    console.log("✓ Appropriate use of different plugin patterns");
    console.log("✓ Parallel execution where possible");
    console.log("✓ Proper error handling and resource cleanup");
  } finally {
    await engine.dispose();
  }
}

// Main function to run all examples
async function runShowcase() {
  console.log("🚀 Plugin Engine Clean API Showcase");
  console.log("=====================================\n");

  const examples = [
    { name: "Primary Recommended Approach", fn: primaryRecommendedApproach },
    { name: "Production Configuration", fn: productionConfiguration },
    {
      name: "Development with Custom Endpoints",
      fn: developmentWithCustomEndpoints,
    },
    {
      name: "Multiple Environment Configurations",
      fn: multipleEnvironmentConfigurations,
    },
    { name: "Production Error Handling", fn: productionErrorHandling },
    { name: "Advanced Plugin Management", fn: advancedPluginManagement },
    {
      name: "Plugin Patterns and Best Practices",
      fn: pluginPatternsAndBestPractices,
    },
  ];

  for (const example of examples) {
    try {
      console.log(`\n📋 Running: ${example.name}`);
      console.log("─".repeat(50));
      await example.fn();
      console.log("✅ Completed successfully");
    } catch (error) {
      console.error("❌ Error:", (error as Error).message);
    }
  }

  console.log("\n🎉 Showcase completed!");
  console.log("\nKey benefits of this clean API:");
  console.log("• ✅ Users control their own environment variables");
  console.log("• ✅ Explicit S3 configuration following AWS SDK patterns");
  console.log("• ✅ Type-safe TypeScript API");
  console.log("• ✅ Flexible entry point system");
  console.log("• ✅ Professional error handling");
  console.log("• ✅ Resource management with dispose()");
  console.log("• ✅ Comprehensive plugin management features");
  console.log("• ✅ Support for various plugin export patterns");
}

// Export all functions for use in other files
export {
  primaryRecommendedApproach,
  productionConfiguration,
  developmentWithCustomEndpoints,
  multipleEnvironmentConfigurations,
  productionErrorHandling,
  advancedPluginManagement,
  pluginPatternsAndBestPractices,
  runShowcase,
};

// Run if called directly
if (require.main === module) {
  runShowcase().catch(console.error);
}
