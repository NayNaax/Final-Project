import { prisma } from "../lib/prisma";

export class WatchlistsService {
    static async getAllForUser(userId: number) {
        return prisma.watchlist.findMany({
            where: { userId },
        });
    }

    static async create(userId: number, name: string) {
        if (!name || name.trim() === "") {
            throw new Error("Watchlist name is required");
        }

        try {
            return await prisma.watchlist.create({
                data: {
                    userId,
                    name: name.trim(),
                    symbols: [],
                },
            });
        } catch (error: any) {
            if (error.code === "P2002") {
                throw new Error("A watchlist with this name already exists");
            }
            throw error;
        }
    }

    static async rename(userId: number, watchlistId: number, newName: string) {
        if (!newName || newName.trim() === "") {
            throw new Error("New watchlist name is required");
        }

        // Verify ownership
        const existing = await prisma.watchlist.findUnique({ where: { id: watchlistId } });
        if (!existing || existing.userId !== userId) {
            throw new Error("Watchlist not found or unauthorized");
        }

        try {
            return await prisma.watchlist.update({
                where: { id: watchlistId },
                data: { name: newName.trim() },
            });
        } catch (error: any) {
            if (error.code === "P2002") {
                throw new Error("A watchlist with this name already exists");
            }
            throw error;
        }
    }

    static async delete(userId: number, watchlistId: number) {
        // Verify ownership
        const existing = await prisma.watchlist.findUnique({ where: { id: watchlistId } });
        if (!existing || existing.userId !== userId) {
            throw new Error("Watchlist not found or unauthorized");
        }

        await prisma.watchlist.delete({ where: { id: watchlistId } });
        return { success: true };
    }

    static async addSymbol(userId: number, watchlistId: number, symbol: string) {
        if (!symbol) throw new Error("Symbol is required");

        const existing = await prisma.watchlist.findUnique({ where: { id: watchlistId } });
        if (!existing || existing.userId !== userId) {
            throw new Error("Watchlist not found or unauthorized");
        }

        const upperSymbol = symbol.toUpperCase();
        if (existing.symbols.includes(upperSymbol)) {
            return existing; // Already inserted
        }

        return prisma.watchlist.update({
            where: { id: watchlistId },
            data: {
                symbols: {
                    push: upperSymbol,
                },
            },
        });
    }

    static async removeSymbol(userId: number, watchlistId: number, symbol: string) {
        const existing = await prisma.watchlist.findUnique({ where: { id: watchlistId } });
        if (!existing || existing.userId !== userId) {
            throw new Error("Watchlist not found or unauthorized");
        }

        const upperSymbol = symbol.toUpperCase();
        const updatedSymbols = existing.symbols.filter((s) => s !== upperSymbol);

        return prisma.watchlist.update({
            where: { id: watchlistId },
            data: {
                symbols: {
                    set: updatedSymbols,
                },
            },
        });
    }
}
