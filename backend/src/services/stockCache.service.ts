import { stockCache } from "../lib/cache";
import { MassiveService } from "./massive.service";
import { PolygonService, type HistoricalBar as PolygonHistoricalBar } from "./polygon.service";
import { FinnhubService, type HistoricalBar } from "./finnhub.service";

/*
 * This service sits in front of the actual API service to handle the heavy
 * restriction of 5 requests per minute, primarily using caches and
 * fallback structures depending on requirements.
 */
export class StockCacheService {
    private static TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || "60", 10);
    private static HISTORICAL_DATA_TTL_SECONDS = 24 * 60 * 60; // Cache historical data for 24 hours

    static async getQuoteWithCache(symbol: string) {
        const cacheKey = `quote_${symbol.toUpperCase()}`;

        // 1. Try Cache First
        const cachedData = stockCache.get(cacheKey);
        if (cachedData) {
            return { data: cachedData, source: "cache" };
        }

        // 2. Cache Miss - Need to hit Upstream API
        let freshData;
        try {
            // Try Finnhub first (you have this configured and it has generous rate limits)
            freshData = await FinnhubService.getQuote(symbol);
        } catch (finnhubErr: any) {
            try {
                // Fall back to Polygon
                freshData = await PolygonService.fetchQuote(symbol);
            } catch (polygonErr: any) {
                try {
                    // Fall back to Massive
                    freshData = await MassiveService.fetchQuote(symbol);
                } catch (massiveErr: any) {
                    // If all fail, throw a helpful error
                    throw new Error(
                        "Could not fetch stock data from any provider. Please ensure FINNHUB_API_KEY, POLYGON_API_KEY, or MASSIVE_API_KEY is configured.",
                    );
                }
            }
        }

        // Default caching behaviour for successful quote fetches
        stockCache.set(cacheKey, freshData, this.TTL_SECONDS);

        return { data: freshData, source: "api" };
    }

    static async getHistoricalDataWithCache(symbol: string, daysBack: number = 365): Promise<HistoricalBar[]> {
        const cacheKey = `historical_${symbol.toUpperCase()}_${daysBack}d`;

        // 1. Try Cache First
        const cachedData = stockCache.get<HistoricalBar[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // 2. Cache Miss - Fetch from API
        let historicalData: HistoricalBar[] = [];
        try {
            // Try Finnhub first (has generous rate limits and already configured)
            historicalData = await FinnhubService.getHistoricalCandles(symbol, daysBack);
        } catch (finnhubErr: any) {
            console.error(`Finnhub historical fetch failed for ${symbol}:`, finnhubErr.message);
            try {
                // Fall back to Polygon
                historicalData = await PolygonService.fetchHistoricalData(symbol, daysBack);
            } catch (polygonErr: any) {
                console.error(`Polygon historical fetch failed for ${symbol}:`, polygonErr.message);
                // Fall back to sample data for development
                console.log(`Using sample data for ${symbol}`);
                historicalData = this.generateSampleHistoricalData(symbol);
            }
        }

        // Cache the result
        if (historicalData.length > 0) {
            stockCache.set(cacheKey, historicalData, this.HISTORICAL_DATA_TTL_SECONDS);
        }

        return historicalData;
    }

    private static generateSampleHistoricalData(symbol: string): HistoricalBar[] {
        // Generate 365 days of sample data with realistic price movement
        const data: HistoricalBar[] = [];
        const basePrice = Math.random() * 200 + 50; // Random base price between 50-250
        let currentPrice = basePrice;
        const today = new Date();

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Simulate price movement
            const change = (Math.random() - 0.5) * 4; // Random change between -2 and +2
            const open = currentPrice;
            const close = currentPrice + change;
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (1 - Math.random() * 0.01);

            currentPrice = close;

            data.push({
                date: date.toISOString().split("T")[0],
                open: parseFloat(open.toFixed(2)),
                high: parseFloat(high.toFixed(2)),
                low: parseFloat(low.toFixed(2)),
                close: parseFloat(close.toFixed(2)),
                volume: Math.floor(Math.random() * 100000000) + 10000000, // 10M-110M shares
            });
        }

        return data;
    }
}
