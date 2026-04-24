import { stockCache } from "../lib/cache";
import { massiveRateLimiter } from "../lib/massiveRateLimiter";
import { MassiveService } from "./massive.service";
import { PolygonService } from "./polygon.service";
import { FinnhubService, type HistoricalBar } from "./finnhub.service";

type QuoteData = {
    symbol: string;
    price: number;
    c: number;
    previousClose: number;
    change: number;
    changePercent: number;
    volume: number;
    dayHigh: number;
    dayLow: number;
    dayOpen: number;
    timestamp: number | null;
    d?: number;
    dp?: number;
    v?: number;
    source?: string;
};

/*
 * This service sits in front of the actual API service to handle the heavy
 * restriction of 5 requests per minute, primarily using caches and
 * fallback structures depending on requirements.
 */
export class StockCacheService {
    private static TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || "60", 10);
    private static HISTORICAL_DATA_TTL_SECONDS = 24 * 60 * 60; // Cache historical data for 24 hours

    static async getQuoteWithCache(symbol: string): Promise<{ data: QuoteData; source: string }> {
        const normalizedSymbol = symbol.toUpperCase().trim();
        const cacheKey = `quote_${normalizedSymbol}`;

        // 1. Try Cache First
        const cachedData = stockCache.get<QuoteData>(cacheKey);
        if (cachedData) {
            return { data: cachedData, source: "cache" };
        }

        // 2. Fall back to stale cache before spending API quota
        const staleData = stockCache.getStale<QuoteData>(cacheKey);
        if (staleData) {
            return { data: staleData, source: "stale-cache" };
        }

        // 3. Cache Miss - Need to hit Upstream API
        let freshData: QuoteData;
        try {
            // Try Finnhub first (you have this configured and it has generous rate limits)
            freshData = await FinnhubService.getQuote(normalizedSymbol);
        } catch (finnhubErr: any) {
            try {
                // Fall back to Polygon
                freshData = await PolygonService.fetchQuote(normalizedSymbol);
            } catch (polygonErr: any) {
                if (MassiveService.isRateLimited() || MassiveService.isCircuitOpen()) {
                    throw new Error("All quote providers are currently unavailable. Please retry shortly.");
                }

                if (!massiveRateLimiter.canCall()) {
                    throw new Error(
                        `Massive request budget exhausted. Next available in ${Math.ceil(massiveRateLimiter.nextAvailableIn / 1000)}s.`,
                    );
                }

                try {
                    // Fall back to Massive
                    massiveRateLimiter.record();
                    freshData = await MassiveService.fetchQuote(normalizedSymbol);
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
        stockCache.setStale(cacheKey, freshData);

        return { data: freshData, source: "api" };
    }

    static async getHistoricalDataWithCache(symbol: string, daysBack: number = 365): Promise<HistoricalBar[]> {
        const normalizedSymbol = symbol.toUpperCase().trim();
        const cacheKey = `historical_${normalizedSymbol}_${daysBack}d`;

        // 1. Try Cache First
        const cachedData = stockCache.get<HistoricalBar[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // 2. Cache Miss - Fetch from API
        let historicalData: HistoricalBar[] = [];
        const fallbackReasons: string[] = [];
        const hasFinnhubKey = Boolean(process.env.FINNHUB_API_KEY?.trim());
        const hasPolygonKey = Boolean(process.env.POLYGON_API_KEY?.trim());

        if (hasFinnhubKey) {
            try {
                historicalData = await FinnhubService.getHistoricalCandles(normalizedSymbol, daysBack);
            } catch (finnhubErr: any) {
                fallbackReasons.push(`Finnhub unavailable (${finnhubErr.message})`);
            }
        } else {
            fallbackReasons.push("Finnhub skipped (FINNHUB_API_KEY missing)");
        }

        if (historicalData.length === 0) {
            if (hasPolygonKey) {
                try {
                    historicalData = await PolygonService.fetchHistoricalData(normalizedSymbol, daysBack);
                } catch (polygonErr: any) {
                    fallbackReasons.push(`Polygon unavailable (${polygonErr.message})`);
                }
            } else {
                fallbackReasons.push("Polygon skipped (POLYGON_API_KEY missing)");
            }
        }

        if (historicalData.length === 0) {
            const hasMassiveKey = Boolean(process.env.MASSIVE_API_KEY?.trim());
            if (hasMassiveKey) {
                try {
                    historicalData = await MassiveService.fetchHistoricalData(normalizedSymbol, daysBack);
                } catch (massiveErr: any) {
                    fallbackReasons.push(`Massive unavailable (${massiveErr.message})`);
                }
            } else {
                fallbackReasons.push("Massive skipped (MASSIVE_API_KEY missing)");
            }
        }

        if (historicalData.length === 0) {
            console.warn(
                `Historical providers unavailable for ${normalizedSymbol}. Returning empty history. ${fallbackReasons.join(" | ")}`,
            );
        }

        // Cache the result
        if (historicalData.length > 0) {
            stockCache.set(cacheKey, historicalData, this.HISTORICAL_DATA_TTL_SECONDS);
        }

        return historicalData;
    }
}
