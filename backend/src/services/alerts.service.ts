import { prisma } from "../lib/prisma";
import { FinnhubService } from "./finnhub.service";

export class AlertsService {
    static async getAllForUser(userId: number) {
        return prisma.priceAlert.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async create(userId: number, symbol: string, targetPrice: number, direction: string) {
        if (!symbol || !targetPrice || !direction) {
            throw new Error("Symbol, targetPrice, and direction are required");
        }

        const upperSymbol = symbol.toUpperCase();
        const upperDirection = direction.toUpperCase();

        if (!["ABOVE", "BELOW"].includes(upperDirection)) {
            throw new Error("Direction must be 'ABOVE' or 'BELOW'");
        }

        return prisma.priceAlert.create({
            data: {
                userId,
                symbol: upperSymbol,
                targetPrice,
                direction: upperDirection,
                triggered: false,
            },
        });
    }

    static async delete(userId: number, alertId: number) {
        const existing = await prisma.priceAlert.findUnique({
            where: { id: alertId },
        });

        if (!existing || existing.userId !== userId) {
            throw new Error("Alert not found or unauthorized");
        }

        await prisma.priceAlert.delete({
            where: { id: alertId },
        });

        return { success: true };
    }

    static async checkAndTrigger() {
        const untriggeredAlerts = await prisma.priceAlert.findMany({
            where: { triggered: false },
        });

        if (untriggeredAlerts.length === 0) return { triggeredCount: 0 };

        const symbols = [...new Set(untriggeredAlerts.map(a => a.symbol))];
        const prices: Record<string, number> = {};

        for (const sym of symbols) {
            try {
                const quote = await FinnhubService.getQuote(sym);
                prices[sym] = quote.price;
            } catch (err) {
                console.error(`Failed to fetch quote for ${sym} in checkAndTrigger:`, err);
            }
        }

        let triggeredCount = 0;
        const now = new Date();

        for (const alert of untriggeredAlerts) {
            const currentPrice = prices[alert.symbol];
            if (currentPrice === undefined) continue;

            let shouldTrigger = false;
            if (alert.direction === "ABOVE" && currentPrice >= alert.targetPrice) {
                shouldTrigger = true;
            } else if (alert.direction === "BELOW" && currentPrice <= alert.targetPrice) {
                shouldTrigger = true;
            }

            if (shouldTrigger) {
                await prisma.priceAlert.update({
                    where: { id: alert.id },
                    data: {
                        triggered: true,
                        triggeredAt: now,
                    },
                });
                triggeredCount++;
            }
        }

        return { triggeredCount };
    }

    static async rearm(userId: number, alertId: number) {
        const existing = await prisma.priceAlert.findUnique({
            where: { id: alertId },
        });

        if (!existing || existing.userId !== userId) {
            throw new Error("Alert not found or unauthorized");
        }

        return prisma.priceAlert.update({
            where: { id: alertId },
            data: {
                triggered: false,
                triggeredAt: null,
            },
        });
    }
}
