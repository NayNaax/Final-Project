import { prisma } from "../lib/prisma";
import { StockCacheService } from "./stockCache.service";

// Just fixing the supported stock choices for now
const SUPPORTED_SYMBOLS = [
    "AAPL",
    "MSFT",
    "GOOG",
    "GOOGL",
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
];

export class StocksService {
    static async getLatestPrices() {
        const promises = SUPPORTED_SYMBOLS.map(async (symbol) => {
            try {
                const quote = await StockCacheService.getQuoteWithCache(symbol);
                return { ...quote.data, symbol, error: null };
            } catch (err: any) {
                return { symbol, error: err.message || "Failed to fetch" };
            }
        });

        return await Promise.all(promises);
    }

    static async getStockData(symbol: string) {
        const normalizedSymbol = symbol.toUpperCase().trim();

        if (!SUPPORTED_SYMBOLS.includes(normalizedSymbol)) {
            throw new Error(`Symbol ${normalizedSymbol} is not currently supported.`);
        }

        // Fetch historical data for the chart
        let historicalData: any[] = [];
        try {
            historicalData = await StockCacheService.getHistoricalDataWithCache(normalizedSymbol, 365);
        } catch (err: any) {
            console.error(`Failed to fetch historical data for ${normalizedSymbol}:`, err.message);
            // Continue without historical data - the current price will still load
        }

        if (historicalData.length === 0) {
            try {
                historicalData = await StockCacheService.getHistoricalDataWithCache(normalizedSymbol, 30);
            } catch (err: any) {
                console.error(`Fallback historical data fetch failed for ${normalizedSymbol}:`, err.message);
            }
        }

        // Fetch the live price from our cache / upstream wrapper
        let liveQuote;
        try {
            liveQuote = await StockCacheService.getQuoteWithCache(normalizedSymbol);
        } catch (err: any) {
            console.error(`Stock fetch error for ${normalizedSymbol}:`, err.message);
            // Re-throw the error so the API can return a proper error response
            throw new Error(err.message || "Failed to fetch stock data");
        }

        return {
            symbol: normalizedSymbol,
            current: liveQuote.data,
            history: historicalData || [],
            historicalParams:
                historicalData.length > 0
                    ? {
                          dataPoints: historicalData.length,
                          mostRecentDate: historicalData[historicalData.length - 1].date,
                          oldestDate: historicalData[0].date,
                      }
                    : { dataPoints: 0 },
        };
    }
}
