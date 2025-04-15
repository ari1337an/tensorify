import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const db = globalThis.prisma || new PrismaClient();
export default db;

if (process.env.ENVIRONEMENT !== "production") globalThis.prisma = db;