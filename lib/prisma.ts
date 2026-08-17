import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production" && prisma) globalForPrisma.prisma = prisma;
