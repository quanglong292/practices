import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "@/config";

const adapter = new PrismaPg({ connectionString: config.database.url });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (config.env !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
