import { prisma } from "../lib/prisma";
import { StockCacheService } from "./stockCache.service";

export class PortfolioService {
    static async getPortfolio(userId: number) {
        const portfolio = await prisma.portfolio.findUnique({
            where: { userId },
            include: { positions: true },
        });

        if (!portfolio) {
            throw new Error("Portfolio not found for user");
        }

        let totalPositionsValue = 0;

        // Enrich with live prices and calculate unrealized P&L
        const enrichedPositions = await Promise.all(
            portfolio.positions.map(async (pos) => {
                let currentPrice = pos.avgCost; // Fallback
                let error = null;
                try {
                    const quote = await StockCacheService.getQuoteWithCache(pos.symbol);
                    // Assume response shape has a `c` or `close` or `price` - adjust to Massive.com
                    currentPrice = quote.data?.c ?? quote.data?.price ?? currentPrice;
                } catch (e: any) {
                    error = "Live price unavailable";
                }

                const marketValue = pos.shares * currentPrice;
                totalPositionsValue += marketValue;

                const totalCost = pos.shares * pos.avgCost;
                const unrealizedPL = marketValue - totalCost;
                const unrealizedPLPercent = totalCost > 0 ? (unrealizedPL / totalCost) * 100 : 0;

                return {
                    ...pos,
                    currentPrice,
                    marketValue,
                    unrealizedPL,
                    unrealizedPLPercent,
                    error,
                };
            }),
        );

        return {
            id: portfolio.id,
            cash: portfolio.cash,
            totalEquity: portfolio.cash + totalPositionsValue,
            positions: enrichedPositions,
        };
    }

    static async buy(userId: number, symbol: string, shares: number) {
        if (shares <= 0) throw new Error("Shares must be greater than 0");

        return prisma.$transaction(async (tx) => {
            const portfolio = await tx.portfolio.findUnique({ where: { userId } });
            if (!portfolio) throw new Error("Portfolio not found");

            const upperSymbol = symbol.toUpperCase();

            let currentPrice: number;
            try {
                const quote = await StockCacheService.getQuoteWithCache(upperSymbol);
                currentPrice = quote.data?.c ?? quote.data?.price ?? 100; // Mock fallback
            } catch {
                throw new Error("Cannot execute trade: Live price unavailable.");
            }

            const totalCost = currentPrice * shares;
            if (portfolio.cash < totalCost) {
                throw new Error("Insufficient cash");
            }

            // Deduct cash
            await tx.portfolio.update({
                where: { id: portfolio.id },
                data: { cash: { decrement: totalCost } },
            });

            // Update position logic (Weighted Avg)
            const existingPos = await tx.position.findUnique({
                where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol: upperSymbol } },
            });

            if (existingPos) {
                const newTotalShares = existingPos.shares + shares;
                const newAvgCost = (existingPos.shares * existingPos.avgCost + totalCost) / newTotalShares;
                await tx.position.update({
                    where: { id: existingPos.id },
                    data: { shares: newTotalShares, avgCost: newAvgCost },
                });
            } else {
                await tx.position.create({
                    data: {
                        portfolioId: portfolio.id,
                        symbol: upperSymbol,
                        shares,
                        avgCost: currentPrice,
                    },
                });
            }

            // Record Trade
            return tx.trade.create({
                data: {
                    userId,
                    symbol: upperSymbol,
                    side: "BUY",
                    shares,
                    price: currentPrice,
                    total: totalCost,
                },
            });
        });
    }

    static async sell(userId: number, symbol: string, shares: number) {
        if (shares <= 0) throw new Error("Shares must be greater than 0");

        return prisma.$transaction(async (tx) => {
            const portfolio = await tx.portfolio.findUnique({ where: { userId } });
            if (!portfolio) throw new Error("Portfolio not found");

            const upperSymbol = symbol.toUpperCase();
            const existingPos = await tx.position.findUnique({
                where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol: upperSymbol } },
            });

            if (!existingPos || existingPos.shares < shares) {
                throw new Error(`Insufficient shares. You only own ${existingPos?.shares || 0}`);
            }

            let currentPrice: number;
            try {
                const quote = await StockCacheService.getQuoteWithCache(upperSymbol);
                currentPrice = quote.data?.c ?? quote.data?.price ?? 100; // Mock fallback
            } catch {
                throw new Error("Cannot execute trade: Live price unavailable.");
            }

            const revenue = currentPrice * shares;
            const costBasisOfSoldShares = existingPos.avgCost * shares;
            const realizedPL = revenue - costBasisOfSoldShares;

            // Add cash back
            await tx.portfolio.update({
                where: { id: portfolio.id },
                data: { cash: { increment: revenue } },
            });

            // Update/Remove position
            if (existingPos.shares === shares) {
                await tx.position.delete({ where: { id: existingPos.id } });
            } else {
                await tx.position.update({
                    where: { id: existingPos.id },
                    data: { shares: { decrement: shares } },
                });
            }

            // Record Trade
            return tx.trade.create({
                data: {
                    userId,
                    symbol: upperSymbol,
                    side: "SELL",
                    shares,
                    price: currentPrice,
                    total: revenue,
                    realizedPL,
                },
            });
        });
    }

    static async getTradeHistory(userId: number) {
        return prisma.trade.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async getPortfolioHistory(userId: number) {
        return prisma.portfolioSnapshot.findMany({
            where: { userId },
            orderBy: { snapshotDate: "asc" },
        });
    }
}
