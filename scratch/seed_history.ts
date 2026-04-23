import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

async function main() {
    const connectionString = process.env.DATABASE_URL!;
    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found to seed history.");
        return;
    }

    console.log(`Seeding history for user: ${user.email} (ID: ${user.id})`);

    // Delete existing snapshots to avoid dupes or confusion
    await prisma.portfolioSnapshot.deleteMany({ where: { userId: user.id } });

    const now = new Date();
    const snapshots = [];

    // Generate 30 days of dummy data
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Randomish walk around 100k
        const randomValue = 100000 + (Math.random() - 0.5) * 5000 + (30 - i) * 500;
        
        snapshots.push({
            userId: user.id,
            totalValue: randomValue,
            snapshotDate: date,
        });
    }

    await prisma.portfolioSnapshot.createMany({
        data: snapshots,
    });

    console.log(`Successfully seeded ${snapshots.length} history snapshots.`);
    await prisma.$disconnect();
    await pool.end();
}

main().catch(console.error);
