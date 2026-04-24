import "dotenv/config";
import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

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

const db = new PrismaClient({ adapter });

const STARTING_BALANCE = 100000;

// Fake trader data with varying returns
const fakeTraders = [
    { username: "alpha_trader", email: "alpha@example.com", returnPercent: 45.8 },
    { username: "beta_hawk", email: "beta@example.com", returnPercent: 38.2 },
    { username: "gamma_moon", email: "gamma@example.com", returnPercent: 32.5 },
    { username: "delta_surge", email: "delta@example.com", returnPercent: 28.7 },
    { username: "epsilon_rise", email: "epsilon@example.com", returnPercent: 24.3 },
    { username: "zeta_smart", email: "zeta@example.com", returnPercent: 19.9 },
    { username: "theta_wise", email: "theta@example.com", returnPercent: 15.4 },
    { username: "iota_bull", email: "iota@example.com", returnPercent: 12.8 },
    { username: "kappa_steady", email: "kappa@example.com", returnPercent: 8.6 },
    { username: "lambda_growth", email: "lambda@example.com", returnPercent: 5.2 },
];

async function seedLeaderboard() {
    try {
        console.log("🌱 Seeding leaderboard with fake traders...\n");

        for (const trader of fakeTraders) {
            // Check if user already exists
            const existingUser = await db.user.findUnique({
                where: { email: trader.email },
            });

            if (existingUser) {
                console.log(`⏭️  Skipping ${trader.username} (already exists)`);
                continue;
            }

            // Create user
            const hashedPassword = await bcrypt.hash("password123", 10);
            const user = await db.user.create({
                data: {
                    email: trader.email,
                    username: trader.username,
                    passwordHash: hashedPassword,
                },
            });

            // Create portfolio
            const portfolio = await db.portfolio.create({
                data: {
                    userId: user.id,
                    cash: STARTING_BALANCE * 0.1, // 10% cash, 90% invested
                },
            });

            // Create user settings with leaderboard opt-in
            await db.userSettings.create({
                data: {
                    userId: user.id,
                    leaderboardOptIn: true,
                    theme: "dark",
                    currency: "USD",
                },
            });

            // Calculate total portfolio value based on return
            const totalValue = STARTING_BALANCE + (STARTING_BALANCE * trader.returnPercent) / 100;

            // Create portfolio snapshot (today's date)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            await db.portfolioSnapshot.create({
                data: {
                    userId: user.id,
                    totalValue,
                    snapshotDate: today,
                },
            });

            console.log(`✅ Created ${trader.username} with ${trader.returnPercent}% return`);
        }

        console.log("\n✨ Leaderboard seeding complete!");
    } catch (error) {
        console.error("❌ Error seeding leaderboard:", error);
        process.exit(1);
    } finally {
        await db.$disconnect();
    }
}

seedLeaderboard();
