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

    static async updateSettings(userId: number, data: { theme?: string; currency?: string; leaderboardOptIn?: boolean }) {
        const validThemes = ["dark", "light", "system"];
        if (data.theme && !validThemes.includes(data.theme)) {
            throw new Error("Invalid theme choice");
        }

        return prisma.userSettings.upsert({
            where: { userId },
            update: {
                ...(data.theme && { theme: data.theme }),
                ...(data.currency && { currency: data.currency.toUpperCase() }),
                ...(data.leaderboardOptIn !== undefined && { leaderboardOptIn: data.leaderboardOptIn }),
            },
            create: {
                userId,
                ...(data.theme && { theme: data.theme }),
                ...(data.currency && { currency: data.currency.toUpperCase() }),
                ...(data.leaderboardOptIn !== undefined && { leaderboardOptIn: data.leaderboardOptIn }),
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

        const userIds = latestSnapshots.map(s => s.userId);

        const settings = await prisma.userSettings.findMany({
            where: { userId: { in: userIds } },
            select: { userId: true, leaderboardOptIn: true }
        });
        const optInMap = new Map(settings.map(s => [s.userId, s.leaderboardOptIn]));

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, email: true },
        });
        const userMap = new Map(users.map((u) => [u.id, u.email]));

        const STARTING_BALANCE = 100000;
        
        const rankings = latestSnapshots.map(snapshot => {
            const returnPercent = ((snapshot.totalValue - STARTING_BALANCE) / STARTING_BALANCE) * 100;
            return {
                ...snapshot,
                returnPercent,
                isOptedIn: optInMap.get(snapshot.userId) || false
            };
        }).sort((a, b) => b.returnPercent - a.returnPercent);

        return rankings.map((r, index) => ({
            rank: index + 1,
            userId: r.userId,
            email: r.isOptedIn ? userMap.get(r.userId) : "Anonymous Trader",
            totalValue: r.totalValue,
            returnPercent: r.returnPercent,
            snapshotDate: r.snapshotDate,
        }));
    }
}
