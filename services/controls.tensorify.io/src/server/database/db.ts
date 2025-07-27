import { PrismaClient } from "./prisma/generated/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const db = globalThis.prisma || new PrismaClient();
export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
