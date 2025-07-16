// Load environment variables
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  createExpressEndpoints,
  RequestValidationError,
} from "@ts-rest/express";
import { contracts, actions, openapi } from "./loader";
import swaggerUi from "swagger-ui-express";

import { uploadService } from "./utils/upload";

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create Express endpoints
createExpressEndpoints(contracts, actions, app, {
  logInitialization: true,
  jsonQuery: true,
  responseValidation: true,
  globalMiddleware: [
    (req, res, next) => {
      console.info(req.method, req.url);
      next();
    },
  ],
  requestValidationErrorHandler: (
    err: RequestValidationError,
    req,
    res,
    next
  ) => {
    if (err.pathParams) {
      res.status(400).json({
        message: "Path parameter validation failed",
      });
    } else if (err.headers) {
      res.status(400).json({
        message: "Header validation failed",
      });
    } else if (err.query) {
      res.status(400).json({
        message: "Query parameter validation failed",
      });
    } else if (err.body) {
      res.status(400).json({
        message: "Body validation failed",
      });
    } else {
      // console.error(err);
      res.status(400).json({
        message: "Validation failed",
      });
    }
    return;
  },
});

// Serve Swagger UI
openapi.forEach(({ json, name }) => {
  app.use(`/api/${name}`, swaggerUi.serveFiles(json), swaggerUi.setup(json));
});

// Add file upload endpoints
app.post("/api/upload/single", async (req, res) => {
  try {
    await uploadService.handleFileUpload(req, res);
  } catch (error) {
    console.error("Single file upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.post("/api/upload/multiple", async (req, res) => {
  try {
    await uploadService.handleMultipleFileUpload(req, res);
  } catch (error) {
    console.error("Multiple file upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Add plugin publish completion endpoint
app.post("/api/publish-complete", async (req, res) => {
  try {
    await uploadService.handlePublishComplete(req, res);
  } catch (error) {
    console.error("Publish complete error:", error);
    res.status(500).json({ error: "Publish completion failed" });
  }
});

// Add health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check if service is in maintenance mode
    const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

    if (isMaintenanceMode) {
      res.status(503).json({
        status: "maintenance",
        timestamp: new Date().toISOString(),
        message:
          "Tensorify servers are currently under maintenance to provide you with a smoother experience. Please try again in a few hours.",
        services: {
          upload: { status: "maintenance" },
        },
      });
      return;
    }

    const uploadHealth = await uploadService.healthCheck();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "All services are operational",
      services: {
        upload: uploadHealth,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      timestamp: new Date().toISOString(),
      message: "One or more services are experiencing issues",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 404 handler - must be last middleware
app.use((req, res) => {
  res.status(404).json({ status: "failed", message: "Not Found" });
});

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.info(
    `🚀 API Server listening at ${
      process.env.NODE_ENV === "production"
        ? `https://backend.tensorify.io`
        : `http://localhost:${port}`
    }`
  );
  console.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.info(`Process ID: ${process.pid}`);
});

// Enhanced error handling for production stability
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  console.error("Stack:", error.stack);

  // Attempt graceful shutdown
  server.close(() => {
    console.info("Server closed due to uncaught exception");
    process.exit(1);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error("Forcing exit due to timeout");
    process.exit(1);
  }, 5000);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't exit on unhandled rejections in production, just log them
  // PM2 will handle restarts if needed
});

process.on("SIGTERM", () => {
  console.error("Received SIGTERM signal, starting graceful shutdown...");
  server.close(() => {
    console.error("Server closed gracefully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.error("Received SIGINT signal, starting graceful shutdown...");
  server.close(() => {
    console.error("Server closed gracefully");
    process.exit(0);
  });
});

// Keep the process alive and handle any other errors
process.on("exit", (code) => {
  console.log(`Process exiting with code: ${code}`);
});
