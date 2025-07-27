import { PrismaClient } from "./prisma/generated/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Only initialize Prisma client if we have a DATABASE_URL and we're not in build time
function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "DATABASE_URL not found, Prisma client will not be initialized"
    );
    return null;
  }

  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    return null;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
