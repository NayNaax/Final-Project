import { prisma } from "../lib/prisma";
import { StockCacheService } from "./stockCache.service";

export class PortfolioService {
    static async getPortfolio(userId: number) {
        // Load one portfolio with its positions in a single query.
        const portfolio = await prisma.portfolio.findUnique({
            where: { userId },
            include: { positions: true },
        });

        if (!portfolio) {
            throw new Error("Portfolio not found for user");
        }

        let totalPositionsValue = 0;

        // For each position: fetch latest price, then compute current value and unrealized profit/loss.
        const enrichedPositions = await Promise.all(
            portfolio.positions.map(async (pos) => {
                // If live quote fails, fall back to avg cost so portfolio still renders.
                let currentPrice = pos.avgCost;
                let error = null;
                try {
                    const quote = await StockCacheService.getQuoteWithCache(pos.symbol);
                    // Support slightly different quote shapes from multiple providers.
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

        // Transaction keeps cash, position, and trade record consistent if anything fails.
        return prisma.$transaction(async (tx) => {
            const portfolio = await tx.portfolio.findUnique({ where: { userId } });
            if (!portfolio) throw new Error("Portfolio not found");

            const upperSymbol = symbol.toUpperCase();

            let currentPrice: number;
            try {
                const quote = await StockCacheService.getQuoteWithCache(upperSymbol);
                currentPrice = quote.data?.c ?? quote.data?.price ?? 100;
            } catch {
                throw new Error("Cannot execute trade: Live price unavailable.");
            }

            const totalCost = currentPrice * shares;
            if (portfolio.cash < totalCost) {
                throw new Error("Insufficient cash");
            }

            // Step 1: reserve cash for the purchase.
            await tx.portfolio.update({
                where: { id: portfolio.id },
                data: { cash: { decrement: totalCost } },
            });

            // Step 2: either update existing holding or create a new holding row.
            const existingPos = await tx.position.findUnique({
                where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol: upperSymbol } },
            });

            if (existingPos) {
                // Weighted average keeps one clean avg cost after multiple buys.
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

            // Step 3: write a trade log for audit/history UI.
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

        // Transaction keeps holdings, cash, and sell record in sync.
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
                currentPrice = quote.data?.c ?? quote.data?.price ?? 100;
            } catch {
                throw new Error("Cannot execute trade: Live price unavailable.");
            }

            // Revenue is what user receives now; cost basis is what those sold shares originally cost.
            const revenue = currentPrice * shares;
            const costBasisOfSoldShares = existingPos.avgCost * shares;
            const realizedPL = revenue - costBasisOfSoldShares;

            // Step 1: add sale proceeds back to cash balance.
            await tx.portfolio.update({
                where: { id: portfolio.id },
                data: { cash: { increment: revenue } },
            });

            // Step 2: remove position if fully sold, otherwise decrease share count.
            if (existingPos.shares === shares) {
                await tx.position.delete({ where: { id: existingPos.id } });
            } else {
                await tx.position.update({
                    where: { id: existingPos.id },
                    data: { shares: { decrement: shares } },
                });
            }

            // Step 3: log realized P&L so reports and journal can use it directly.
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
