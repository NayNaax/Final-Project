import { prisma } from "../lib/prisma";

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
}
