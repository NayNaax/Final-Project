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
        if (!SUPPORTED_SYMBOLS.includes(symbol.toUpperCase())) {
            throw new Error(`Symbol ${symbol} is not currently supported.`);
        }

        // Fetch historical data for the chart
        let historicalData: any[] = [];
        try {
            historicalData = await StockCacheService.getHistoricalDataWithCache(symbol.toUpperCase(), 365);
        } catch (err: any) {
            console.error(`Failed to fetch historical data for ${symbol}:`, err.message);
            // Continue without historical data - the current price will still load
        }

        // Fetch the live price from our cache / upstream wrapper
        let liveQuote;
        try {
            liveQuote = await StockCacheService.getQuoteWithCache(symbol.toUpperCase());
        } catch (err: any) {
            console.error(`Stock fetch error for ${symbol}:`, err.message);
            // Re-throw the error so the API can return a proper error response
            throw new Error(err.message || "Failed to fetch stock data");
        }

        return {
            symbol: symbol.toUpperCase(),
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
