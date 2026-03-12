import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"] });

// Cache in global to avoid connection exhaustion in serverless (Vercel)
globalForPrisma.prisma = prisma;
