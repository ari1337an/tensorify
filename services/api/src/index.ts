import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createExpressEndpoints } from "@ts-rest/express";
import { contracts, actions, openapi } from "./loader";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
  requestValidationErrorHandler: (err, req, res, next) => {
    //             err is typed as ^ RequestValidationError
    res.status(400).json({
      message: "Validation failed",
    });
  },
});

// Serve the Swagger UI
openapi.forEach(({ json, name }) => {
  app.use(`/api/${name}`, swaggerUi.serveFiles(json), swaggerUi.setup(json));
});

// Add a simple health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
