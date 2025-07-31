const { execSync } = require("child_process");
const path = require("path");

// Get worker ID from Jest (1-based)
const workerId = process.env.JEST_WORKER_ID || "1";

const baseUrl = process.env.DATABASE_URL;

// Ensure we are using testing database
if (!baseUrl.includes("app_test")) {
  throw new Error("DATABASE_URL is not a testing database");
}

// Set worker-specific database URL
const workerDbUrl = baseUrl.replace("app_test", `app_test_${workerId}`);

// Set the database URL for this worker
process.env.DATABASE_URL = workerDbUrl;

// Set the correct schema path relative to the working directory
const schemaPath = path.resolve(
  __dirname,
  "../../src/server/database/prisma/schema.prisma"
);

// Ensure the database exists and run migrations
try {
  // Create database if it doesn't exist (idempotent)
  execSync(`npx prisma db push --accept-data-loss --schema="${schemaPath}"`, {
    stdio: "ignore",
    env: { ...process.env, DATABASE_URL: workerDbUrl },
  });

  // Generate Prisma client with the correct schema
  execSync(`npx prisma generate --schema="${schemaPath}"`, {
    stdio: "ignore",
    env: { ...process.env, DATABASE_URL: workerDbUrl },
  });
} catch (error) {
  console.warn(
    `Warning: Could not set up database for worker ${workerId}:`,
    error.message
  );
}
