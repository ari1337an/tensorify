import { PrismaClient } from "./prisma/generated/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const db = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export default db;
