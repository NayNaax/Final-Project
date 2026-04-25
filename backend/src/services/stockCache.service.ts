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
    // Historical candles change slowly, so we keep them much longer than live quotes.
    private static HISTORICAL_DATA_TTL_SECONDS = 24 * 60 * 60;

    static async getQuoteWithCache(symbol: string): Promise<{ data: QuoteData; source: string }> {
        const normalizedSymbol = symbol.toUpperCase().trim();
        const cacheKey = `quote_${normalizedSymbol}`;

        // Fast path: recent quote in main cache.
        const cachedData = stockCache.get<QuoteData>(cacheKey);
        if (cachedData) {
            return { data: cachedData, source: "cache" };
        }

        // Next best: stale cache (old but usable) to avoid hard failure and save API calls.
        const staleData = stockCache.getStale<QuoteData>(cacheKey);
        if (staleData) {
            return { data: staleData, source: "stale-cache" };
        }

        // No cache hit: ask providers in priority order.
        let freshData: QuoteData;
        try {
            // Provider order matters: try fastest/cheapest first.
            freshData = await FinnhubService.getQuote(normalizedSymbol);
        } catch (finnhubErr: any) {
            try {
                // If Finnhub fails, try Polygon.
                freshData = await PolygonService.fetchQuote(normalizedSymbol);
            } catch (polygonErr: any) {
                // If circuit breaker is open, skip Massive quickly instead of waiting for more failures.
                if (MassiveService.isRateLimited() || MassiveService.isCircuitOpen()) {
                    throw new Error("All quote providers are currently unavailable. Please retry shortly.");
                }

                // Respect local request budget so we avoid 429 storms.
                if (!massiveRateLimiter.canCall()) {
                    throw new Error(
                        `Massive request budget exhausted. Next available in ${Math.ceil(massiveRateLimiter.nextAvailableIn / 1000)}s.`,
                    );
                }

                try {
                    // Last fallback provider.
                    massiveRateLimiter.record();
                    freshData = await MassiveService.fetchQuote(normalizedSymbol);
                } catch (massiveErr: any) {
                    // All providers failed: return one clear message for frontend.
                    throw new Error(
                        "Could not fetch stock data from any provider. Please ensure FINNHUB_API_KEY, POLYGON_API_KEY, or MASSIVE_API_KEY is configured.",
                    );
                }
            }
        }

        // Save both fresh and stale layers so next calls are faster and more resilient.
        stockCache.set(cacheKey, freshData, this.TTL_SECONDS);
        stockCache.setStale(cacheKey, freshData);

        return { data: freshData, source: "api" };
    }

    static async getHistoricalDataWithCache(symbol: string, daysBack: number = 365): Promise<HistoricalBar[]> {
        const normalizedSymbol = symbol.toUpperCase().trim();
        const cacheKey = `historical_${normalizedSymbol}_${daysBack}d`;

        // Fast path for chart requests.
        const cachedData = stockCache.get<HistoricalBar[]>(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        // If missing in cache, try providers one by one and capture why each fails.
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

        // Only cache non-empty history so we do not hide temporary provider outages for too long.
        if (historicalData.length > 0) {
            stockCache.set(cacheKey, historicalData, this.HISTORICAL_DATA_TTL_SECONDS);
        }

        return historicalData;
    }
}
