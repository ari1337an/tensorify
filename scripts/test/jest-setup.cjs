/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');

// Get worker ID from Jest (1-based)
const workerId = process.env.JEST_WORKER_ID || '1';

// Set worker-specific database URL
const baseUrl = process.env.DATABASE_URL;
const workerDbUrl = baseUrl.replace('app_test', `app_test_${workerId}`);

// Set the database URL for this worker
process.env.DATABASE_URL = workerDbUrl;

// Ensure the database exists and run migrations
try {
  // Create database if it doesn't exist (idempotent)
  execSync(`npx prisma db push --accept-data-loss`, { 
    stdio: 'ignore',
    env: { ...process.env, DATABASE_URL: workerDbUrl }
  });
} catch (error) {
  console.warn(`Warning: Could not set up database for worker ${workerId}:`, error.message);
}