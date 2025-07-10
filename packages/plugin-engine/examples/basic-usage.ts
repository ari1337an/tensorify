/**
 * Basic usage example for @tensorify.io/plugin-engine
 */

import { createPluginEngine } from "../src/index";

// Example 1: Basic usage with credentials and simple functions
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

    // Execute simple function plugins
    const result1 = await engine.getExecutionResult(
      "data-processing-plugin:1.2.0",
      {
        dataset: "users.csv",
        operation: "filter",
        criteria: { age: ">= 18", active: true },
        outputFormat: "json",
      },
      "processData" // Simple function call
    );

    // Execute class method plugins
    const result2 = await engine.getExecutionResult(
      "ml-toolkit-plugin:2.1.0",
      {
        algorithm: "random-forest",
        features: ["age", "income", "education"],
        target: "purchase_probability",
        testSize: 0.2,
      },
      "MLModel.train" // Class method call
    );

    // Execute nested object method plugins
    const result3 = await engine.getExecutionResult(
      "analytics-plugin:1.0.5",
      {
        dataSource: "analytics_db",
        metrics: ["conversion_rate", "user_engagement"],
        timeframe: "last_30_days",
      },
      "handlers.analytics.generateReport" // Nested method call
    );

    console.log("Data processing result:", result1.code);
    console.log("ML training result:", result2.code);
    console.log("Analytics report result:", result3.code);

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

      // Get plugin manifest with entry points
      const manifest = await engine.getPluginManifest("custom-plugin");
      console.log(
        "Available entry points:",
        Object.keys(manifest.entryPoints || {})
      );
    }

    // Get plugin source code
    const sourceCode = await engine.getPluginCode(
      "data-processing-plugin:1.2.0"
    );
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

    // Example with complex payload and simple function
    const result = await engine.getExecutionResult(
      "data-pipeline-plugin",
      {
        source: {
          type: "database",
          connection: "postgresql://localhost:5432/analytics",
          query:
            "SELECT * FROM user_events WHERE created_at > NOW() - INTERVAL '7 days'",
        },
        transformations: [
          { type: "filter", condition: "event_type = 'purchase'" },
          {
            type: "aggregate",
            groupBy: ["user_id"],
            metrics: ["total_amount"],
          },
          { type: "sort", field: "total_amount", order: "desc" },
        ],
        destination: {
          type: "file",
          format: "parquet",
          path: "/output/user_purchases.parquet",
        },
      },
      "executePipeline"
    );

    console.log("Data pipeline result:", result.code);

    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 3: Custom endpoint (MinIO, LocalStack, etc.) with various entry point patterns
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

    // Simple function
    const simpleResult = await engine.getExecutionResult(
      "utility-plugin",
      {
        text: "Hello World",
        operation: "reverse",
      },
      "reverseText"
    );

    // Class method
    const classResult = await engine.getExecutionResult(
      "data-transformer-plugin",
      {
        data: [1, 2, 3, 4, 5],
        transformation: "normalize",
        range: [0, 1],
      },
      "DataTransformer.normalize"
    );

    // Deeply nested method
    const nestedResult = await engine.getExecutionResult(
      "ml-services-plugin",
      {
        modelType: "classification",
        dataset: "iris",
        hyperparameters: {
          learning_rate: 0.01,
          max_depth: 5,
          n_estimators: 100,
        },
      },
      "services.ml.models.RandomForest.train"
    );

    // Utility function
    const utilityResult = await engine.getExecutionResult(
      "math-utils-plugin",
      {
        numbers: [10, 20, 30, 40, 50],
        operation: "standard_deviation",
      },
      "utils.statistics.calculateStdDev"
    );

    console.log("Simple function result:", simpleResult.code);
    console.log("Class method result:", classResult.code);
    console.log("Nested method result:", nestedResult.code);
    console.log("Utility function result:", utilityResult.code);

    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 4: Production configuration with complex workflows
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

    // Complex ML workflow
    const trainingResult = await engine.getExecutionResult(
      "ml-pipeline-plugin:3.1.0",
      {
        experiment: {
          name: "customer_churn_prediction_v2",
          description: "Predicting customer churn using ensemble methods",
        },
        data: {
          source: "s3://data-lake/customer_data/",
          features: [
            "account_age",
            "monthly_spend",
            "support_tickets",
            "last_login_days",
            "feature_usage_score",
          ],
          target: "churned_next_month",
          dateRange: {
            start: "2024-01-01",
            end: "2024-06-30",
          },
        },
        model: {
          algorithm: "gradient_boosting",
          hyperparameters: {
            n_estimators: 200,
            learning_rate: 0.1,
            max_depth: 6,
            subsample: 0.8,
          },
          validation: {
            method: "time_series_split",
            n_splits: 5,
          },
        },
        deployment: {
          endpoint: "customer-churn-model-v2",
          instance_type: "ml.m5.large",
          auto_scaling: {
            min_instances: 1,
            max_instances: 5,
            target_invocations_per_instance: 1000,
          },
        },
      },
      "MLPipeline.trainAndDeploy"
    );

    console.log("ML pipeline result:", trainingResult.code);

    await engine.dispose();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example 5: Error handling with new API
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

    await engine.getExecutionResult(
      "non-existent-plugin",
      { test: "data" },
      "nonExistentFunction"
    );

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

// Example 6: Multiple plugin execution with different entry point patterns
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

    // Execute multiple plugins with different entry point patterns in parallel
    const [dataResult, preprocessResult, trainResult, evalResult] =
      await Promise.all([
        // Simple function
        engine.getExecutionResult(
          "data-loader-plugin",
          {
            source: "s3://datasets/customer_data.csv",
            columns: ["age", "income", "spending_score"],
            filters: { age: "> 18" },
          },
          "loadAndClean"
        ),

        // Class method
        engine.getExecutionResult(
          "preprocessing-plugin",
          {
            data: "customer_data_cleaned",
            operations: ["normalize", "encode_categorical", "handle_missing"],
            categorical_columns: ["gender", "education"],
          },
          "DataPreprocessor.transform"
        ),

        // Nested method
        engine.getExecutionResult(
          "model-training-plugin",
          {
            algorithm: "xgboost",
            objective: "binary:logistic",
            hyperparameters: {
              max_depth: 6,
              learning_rate: 0.1,
              n_estimators: 100,
            },
            cross_validation: {
              folds: 5,
              stratified: true,
            },
          },
          "models.ensemble.XGBoost.train"
        ),

        // Deep nested method
        engine.getExecutionResult(
          "evaluation-plugin",
          {
            model: "trained_xgboost_model",
            test_data: "customer_data_test",
            metrics: ["accuracy", "precision", "recall", "f1", "auc"],
            generate_report: true,
            visualizations: [
              "confusion_matrix",
              "roc_curve",
              "feature_importance",
            ],
          },
          "evaluation.metrics.classification.generateReport"
        ),
      ]);

    console.log("Data loading result:", dataResult.code);
    console.log("Preprocessing result:", preprocessResult.code);
    console.log("Model training result:", trainResult.code);
    console.log("Evaluation result:", evalResult.code);

    // Sequential execution for dependent steps
    const pipelineResult = await engine.getExecutionResult(
      "pipeline-orchestrator-plugin",
      {
        steps: [
          { name: "data_loading", completed: true },
          { name: "preprocessing", completed: true },
          { name: "training", completed: true },
          { name: "evaluation", completed: true },
        ],
        final_model_path: "s3://models/customer_churn_model_v1.pkl",
        performance_metrics: {
          accuracy: 0.92,
          f1_score: 0.89,
          auc: 0.95,
        },
      },
      "Pipeline.finalize"
    );

    console.log("Pipeline finalization result:", pipelineResult.code);

    await engine.dispose();
  } catch (error) {
    console.error("Multiple plugin execution error:", error);
  }
}

// Example 7: Working with different plugin export patterns
async function pluginExportPatterns() {
  try {
    const engine = createPluginEngine(
      {
        region: "us-east-1",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      },
      "plugin-examples",
      {
        debug: true,
      }
    );

    // Plugin with simple function exports
    // module.exports = { sum, multiply, divide };
    const mathResult = await engine.getExecutionResult(
      "math-functions-plugin",
      {
        numbers: [10, 20, 30],
        operation: "sum",
      },
      "sum"
    );

    // Plugin with class exports
    // module.exports = { Calculator, Statistics };
    const calculatorResult = await engine.getExecutionResult(
      "calculator-plugin",
      {
        operand1: 100,
        operand2: 25,
        operation: "divide",
      },
      "Calculator.divide"
    );

    // Plugin with nested object exports
    // module.exports = { utils: { math: { ... }, string: { ... } } };
    const utilsResult = await engine.getExecutionResult(
      "utilities-plugin",
      {
        text: "Hello, World!",
        transformation: "slug",
      },
      "utils.string.toSlug"
    );

    // Plugin with mixed exports
    // module.exports = { quickSort, DataStructures, algorithms: { ... } };
    const algorithmResult = await engine.getExecutionResult(
      "algorithms-plugin",
      {
        array: [64, 34, 25, 12, 22, 11, 90],
        algorithm: "merge_sort",
      },
      "algorithms.sorting.mergeSort"
    );

    console.log("Math result:", mathResult.code);
    console.log("Calculator result:", calculatorResult.code);
    console.log("Utils result:", utilsResult.code);
    console.log("Algorithm result:", algorithmResult.code);

    await engine.dispose();
  } catch (error) {
    console.error("Plugin export patterns error:", error);
  }
}

// Example 8: Real-world data science workflow
async function dataScienceWorkflow() {
  try {
    const engine = createPluginEngine(
      {
        region: "us-west-2",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      },
      "data-science-plugins",
      {
        executionTimeout: 180000, // 3 minutes for complex operations
        memoryLimit: 1024, // 1GB for large datasets
        debug: false,
      }
    );

    // Complete data science workflow
    const workflowSteps = [
      {
        name: "Data Ingestion",
        plugin: "data-ingestion-plugin:2.0.0",
        payload: {
          sources: [
            {
              type: "api",
              url: "https://api.example.com/customer_data",
              auth: { type: "bearer", token: process.env.API_TOKEN },
            },
            {
              type: "database",
              connection: "postgresql://localhost/analytics",
              query: "SELECT * FROM transactions WHERE date >= '2024-01-01'",
            },
            {
              type: "s3",
              bucket: "raw-data",
              prefix: "external_sources/",
            },
          ],
          output_format: "parquet",
        },
        entryPoint: "DataIngestion.collectAndMerge",
      },
      {
        name: "Exploratory Data Analysis",
        plugin: "eda-plugin:1.5.0",
        payload: {
          dataset: "merged_customer_data.parquet",
          analysis_type: "comprehensive",
          generate_visualizations: true,
          statistical_tests: ["normality", "correlation", "outlier_detection"],
        },
        entryPoint: "analysis.exploratory.generateReport",
      },
      {
        name: "Feature Engineering",
        plugin: "feature-engineering-plugin:3.2.1",
        payload: {
          target_variable: "customer_lifetime_value",
          feature_selection: {
            methods: ["correlation", "mutual_info", "recursive_elimination"],
            max_features: 20,
          },
          transformations: [
            { type: "polynomial", degree: 2, features: ["age", "income"] },
            {
              type: "interaction",
              feature_pairs: [
                ["age", "income"],
                ["tenure", "monthly_spend"],
              ],
            },
            { type: "binning", features: ["age"], bins: 5 },
          ],
        },
        entryPoint: "FeatureEngineering.createFeatureSet",
      },
      {
        name: "Model Training and Selection",
        plugin: "automl-plugin:4.0.0",
        payload: {
          problem_type: "regression",
          models: [
            "linear_regression",
            "random_forest",
            "xgboost",
            "neural_network",
          ],
          hyperparameter_tuning: {
            method: "bayesian_optimization",
            iterations: 100,
            cv_folds: 5,
          },
          ensemble: {
            method: "stacking",
            meta_learner: "linear_regression",
          },
        },
        entryPoint: "AutoML.trainAndSelect",
      },
    ];

    // Execute workflow steps sequentially
    const results = [];
    for (const step of workflowSteps) {
      console.log(`\nExecuting: ${step.name}`);
      const result = await engine.getExecutionResult(
        step.plugin,
        step.payload,
        step.entryPoint
      );
      results.push({
        step: step.name,
        code: result.code,
        metadata: result.metadata,
      });
      console.log(
        `Completed: ${step.name} (${result.metadata.executionTime}ms)`
      );
    }

    // Generate final report
    const reportResult = await engine.getExecutionResult(
      "reporting-plugin:1.1.0",
      {
        workflow_results: results,
        report_type: "comprehensive",
        include_code: true,
        include_visualizations: true,
        format: "html",
      },
      "ReportGenerator.createWorkflowReport"
    );

    console.log("\n=== Workflow Complete ===");
    console.log("Final report:", reportResult.code);

    await engine.dispose();
  } catch (error) {
    console.error("Data science workflow error:", error);
  }
}

// Run examples
async function runExamples() {
  console.log("=== Plugin Engine Examples ===\n");

  await basicUsageWithCredentials();
  await environmentVariablesUsage();
  await customEndpointUsage();
  await productionConfiguration();
  await errorHandlingExample();
  await multiplePluginExecution();
  await pluginExportPatterns();
  await dataScienceWorkflow();

  console.log("\n=== Examples Complete ===");
}

// Export for use in other files
export {
  basicUsageWithCredentials,
  environmentVariablesUsage,
  customEndpointUsage,
  productionConfiguration,
  errorHandlingExample,
  multiplePluginExecution,
  pluginExportPatterns,
  dataScienceWorkflow,
  runExamples,
};

// Run if called directly
if (require.main === module) {
  runExamples().catch(console.error);
}
