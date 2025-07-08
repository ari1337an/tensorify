import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { initServer } from "@ts-rest/express";
import { createExpressEndpoints } from "@ts-rest/express";
import { contracts as v1Contracts, actions as v1Actions } from "./v1";
import { contracts as v2Contracts, actions as v2Actions } from "./v2";
import { initContract } from "@ts-rest/core";

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const s = initServer();
const c = initContract();

// Create the main contract router with proper versioning
const allContracts = c.router(
  {
    v1: v1Contracts,
    v2: v2Contracts,
  },
  {
    pathPrefix: "/api",
    strictStatusCodes: true,
  }
);

// Create the actions router that matches the contract structure
const allActions = s.router(allContracts, {
  v1: v1Actions,
  v2: v2Actions,
});

createExpressEndpoints(allContracts, allActions, app);

// Add a simple health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log(`🚀 API Server listening at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Process ID: ${process.pid}`);
});

// Enhanced error handling for production stability
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  console.error("Stack:", error.stack);

  // Attempt graceful shutdown
  server.close(() => {
    console.log("Server closed due to uncaught exception");
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
  console.log("Received SIGTERM signal, starting graceful shutdown...");
  server.close(() => {
    console.log("Server closed gracefully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("Received SIGINT signal, starting graceful shutdown...");
  server.close(() => {
    console.log("Server closed gracefully");
    process.exit(0);
  });
});

// Keep the process alive and handle any other errors
process.on("exit", (code) => {
  console.log(`Process exiting with code: ${code}`);
});