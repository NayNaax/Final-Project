import { prisma } from "../lib/prisma";
import { StockCacheService } from "./stockCache.service";

// Just fixing the supported stock choices for now
const SUPPORTED_SYMBOLS = [
    "AAPL",
    "MSFT",
    "GOOG",
    "AMZN",
    "NVDA",
    "META",
    "TSLA",
    "BRK.B",
    "V",
    "JNJ",
    "WMT",
    "JPM",
    "PG",
    "MA",
    "PG",
];

export class StocksService {
    static async getLatestPrices() {
        const promises = SUPPORTED_SYMBOLS.map(async (symbol) => {
            try {
                const quote = await StockCacheService.getQuoteWithCache(symbol);
                return { symbol, ...quote.data, error: null };
            } catch (err: any) {
                return { symbol, error: err.message || "Failed to fetch" };
            }
        });

        return await Promise.all(promises);
    }

    static async getStockData(symbol: string) {
        if (!SUPPORTED_SYMBOLS.includes(symbol.toUpperCase())) {
            throw new Error(`Symbol ${symbol} is not currently supported.`);
        }

        // Fetch historical data from DB (seeded earlier)
        const historicalData = await prisma.stock.findMany({
            where: { symbol: symbol.toUpperCase() },
            orderBy: { date: "asc" },
            take: 365, // Limit 1 year
        });

        // Fetch the live price from our cache / upstream wrapper
        let liveQuote = null;
        let liveError = null;
        try {
            liveQuote = await StockCacheService.getQuoteWithCache(symbol.toUpperCase());
        } catch (err: any) {
            liveError = err.message || "Could not fetch current price";
        }

        return {
            symbol: symbol.toUpperCase(),
            liveQuote: liveQuote ? liveQuote.data : null,
            liveError,
            historicalParams:
                historicalData.length > 0
                    ? {
                          dataPoints: historicalData.length,
                          mostRecentDate: historicalData[historicalData.length - 1].date,
                          oldestDate: historicalData[0].date,
                      }
                    : { dataPoints: 0 },
            historicalData,
        };
    }
}
