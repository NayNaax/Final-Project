import { prisma } from "../lib/prisma";
import { PortfolioService } from "./portfolio.service";

const SECTOR_MAP: Record<string, string> = {
    AAPL: "Tech",
    MSFT: "Tech",
    GOOGL: "Tech",
    NVDA: "Tech",
    AMZN: "Consumer",
    TSLA: "Consumer",
    JNJ: "Healthcare",
    UNH: "Healthcare",
    JPM: "Finance",
    V: "Finance",
    SPY: "ETF",
    QQQ: "ETF",
    XOM: "Energy",
    PG: "Consumer Staples",
    DIS: "Media",
};

export class BudgetService {
    static async getBudget(userId: number) {
        let budget = await prisma.budget.findUnique({
            where: { userId },
            include: { allocations: true },
        });

        if (!budget) {
            budget = await prisma.budget.create({
                data: {
                    userId,
                    allocations: {
                        create: [
                            { category: "Tech", targetPct: 30, color: "#3b82f6" },
                            { category: "Consumer", targetPct: 20, color: "#10b981" },
                            { category: "Healthcare", targetPct: 15, color: "#ef4444" },
                            { category: "Finance", targetPct: 15, color: "#f59e0b" },
                            { category: "ETF", targetPct: 10, color: "#8b5cf6" },
                            { category: "Other", targetPct: 10, color: "#6b7280" },
                        ],
                    },
                },
                include: { allocations: true },
            });
        }

        return budget;
    }

    static async updateBudget(userId: number, allocations: { category: string; targetPct: number; color?: string }[], symbolCategoryMap?: Record<string, string>) {
        const budget = await this.getBudget(userId);

        await prisma.allocation.deleteMany({
            where: { budgetId: budget.id },
        });

        // Ensure targetPct sums to 100? Assuming front-end validates or we just save what comes in.
        const createdAllocations = await Promise.all(
            allocations.map((a) =>
                prisma.allocation.create({
                    data: {
                        budgetId: budget.id,
                        category: a.category,
                        targetPct: a.targetPct,
                        color: a.color || "#6b7280",
                    },
                }),
            ),
        );

        if (symbolCategoryMap) {
            await prisma.budget.update({
                where: { id: budget.id },
                data: { symbolCategoryMap },
            });
        }

        return {
            ...budget,
            allocations: createdAllocations,
            symbolCategoryMap: symbolCategoryMap || budget.symbolCategoryMap,
        };
    }

    static async getBudgetStatus(userId: number) {
        const budget = await this.getBudget(userId);
        const portfolio = await PortfolioService.getPortfolio(userId);

        const actualValues: Record<string, number> = {};
        let totalAllocatedValue = 0;

        // Initialize from budget categories
        budget.allocations.forEach((a) => {
            actualValues[a.category] = 0;
        });

        // Add "Cash" explicitly? Or is cash part of allocations? The user prompt did not say, we will map stocks.
        // Let's create an "Other" category for unmapped holding.
        if (!actualValues["Other"]) {
            actualValues["Other"] = 0;
        }

        const symbolMap = (budget.symbolCategoryMap as Record<string, string>) || {};

        portfolio.positions.forEach((pos) => {
            const equity = pos.shares * pos.currentPrice;
            const category = symbolMap[pos.symbol] || SECTOR_MAP[pos.symbol] || "Other";

            if (actualValues[category] !== undefined) {
                actualValues[category] += equity;
            } else {
                actualValues[category] = equity;
            }
            totalAllocatedValue += equity;
        });

        const status = budget.allocations.map((a) => {
            const actualValue = actualValues[a.category] || 0;
            const actualPct = totalAllocatedValue > 0 ? (actualValue / totalAllocatedValue) * 100 : 0;
            const drift = actualPct - a.targetPct;

            return {
                category: a.category,
                targetPct: a.targetPct,
                actualPct,
                drift,
                actualValue,
                color: a.color,
            };
        });

        const suggestions: string[] = [];
        
        status.forEach(s => {
            if (Math.abs(s.drift) > 5) {
                if (s.drift > 0) {
                    // Overweight
                    const excessValue = totalAllocatedValue * (s.drift / 100);
                    suggestions.push(`Consider reducing ${s.category} by $${excessValue.toFixed(2)} to align with target.`);
                } else {
                    // Underweight
                    const deficitValue = totalAllocatedValue * (Math.abs(s.drift) / 100);
                    suggestions.push(`Consider investing $${deficitValue.toFixed(2)} more into ${s.category} to meet target.`);
                }
            }
        });

        return {
            totalAllocatedValue,
            status,
            suggestions,
        };
    }
}
