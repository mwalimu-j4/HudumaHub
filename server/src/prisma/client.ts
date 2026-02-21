// Prisma 7 Client Setup
// The database connection URL is configured in prisma.config.ts
// PrismaClient needs adapter or accelerateUrl in Prisma 7
// This file will be updated when database is configured

import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined;
};

// Note: In production, configure PrismaClient with proper adapter
// For now, this is a scaffold — actual DB connection setup will be added
// when the PostgreSQL database is provisioned
export const prisma = globalForPrisma.prisma ?? null;

export { PrismaClient };
