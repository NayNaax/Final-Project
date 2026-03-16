import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Missing DATABASE_URL environment variable.");
}

if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
    throw new Error(
        "Invalid DATABASE_URL for @prisma/adapter-pg. Use a PostgreSQL URL starting with postgres:// or postgresql://.",
    );
}

const adapter = new PrismaPg({ connectionString });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
