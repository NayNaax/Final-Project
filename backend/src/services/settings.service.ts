import { prisma } from "../lib/prisma";

export class SettingsService {
    static async getSettings(userId: number) {
        let settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        // Lazy initialization of settings if they don't exist yet
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: { userId },
            });
        }

        return settings;
    }

    static async updateSettings(userId: number, data: { theme?: string; currency?: string }) {
        const validThemes = ["dark", "light", "system"];
        if (data.theme && !validThemes.includes(data.theme)) {
            throw new Error("Invalid theme choice");
        }

        return prisma.userSettings.upsert({
            where: { userId },
            update: {
                ...(data.theme && { theme: data.theme }),
                ...(data.currency && { currency: data.currency.toUpperCase() }),
            },
            create: {
                userId,
                ...(data.theme && { theme: data.theme }),
                ...(data.currency && { currency: data.currency.toUpperCase() }),
            },
        });
    }

    static async getLeaderboard() {
        // Returns top 20 portfolios by their total value (cash + positions)
        // Since live evaluation is expensive to do for everyone concurrently on one call,
        // a leaderboard is usually driven by the daily PortfolioSnapshot data.

        const latestSnapshots = await prisma.portfolioSnapshot.findMany({
            distinct: ["userId"],
            orderBy: [{ userId: "asc" }, { snapshotDate: "desc" }],
        });

        if (latestSnapshots.length === 0) {
            return [];
        }

        // Sort by total value descending
        const sorted = latestSnapshots.sort((a, b) => b.totalValue - a.totalValue).slice(0, 20);

        // Fetch the actual usernames
        const userIds = sorted.map((s) => s.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true },
        });

        const userMap = new Map(users.map((u) => [u.id, u.email]));

        return sorted.map((snapshot) => ({
            userId: snapshot.userId,
            email: userMap.get(snapshot.userId), // Show real username emails as per user prompt instruction
            totalValue: snapshot.totalValue,
            snapshotDate: snapshot.snapshotDate,
        }));
    }
}
