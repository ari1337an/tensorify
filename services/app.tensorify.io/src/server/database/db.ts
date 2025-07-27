import { PrismaClient } from "./prisma/generated/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  try {
    const client = new PrismaClient({
      // log:
      //   process.env.NODE_ENV === "development"
      //     ? ["query", "error", "warn"]
      //     : ["error"],
    });

    // Test the connection
    client.$connect();

    return client;
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    throw error;
  }
}

// Initialize database client
const db = globalThis.prisma || createPrismaClient();

// Save reference in development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export default db;
