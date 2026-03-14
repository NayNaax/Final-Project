import { stockCache } from "../lib/cache";
import { MassiveService } from "./massive.service";

/*
 * This service sits in front of the actual API service to handle the heavy
 * restriction of 5 requests per minute, primarily using caches and
 * fallback structures depending on requirements.
 */
export class StockCacheService {
    private static TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || "60", 10);

    // Rate-limiting trackers for upstream calls
    private static apiCallsInCurrentMinute = 0;
    private static currentMinuteWindowStart = Date.now();

    static async getQuoteWithCache(symbol: string) {
        const cacheKey = `quote_${symbol.toUpperCase()}`;

        // 1. Try Cache First
        const cachedData = stockCache.get(cacheKey);
        if (cachedData) {
            return { data: cachedData, source: "cache" };
        }

        // 2. Cache Miss - Need to hit Upstream API
        // Check our internal counter first to respect the 5/min limit.
        const now = Date.now();
        if (now - this.currentMinuteWindowStart > 60000) {
            // Rollover window
            this.currentMinuteWindowStart = now;
            this.apiCallsInCurrentMinute = 0;
        }

        if (this.apiCallsInCurrentMinute >= 5) {
            // Provide a more elegant fallback if needed, but for now we simply throw
            throw new Error("Upstream rate limit exceeded (5 requests/min). Try again later.");
        }

        this.apiCallsInCurrentMinute++;

        const freshData = await MassiveService.fetchQuote(symbol);

        // Default caching behaviour for successful quote fetches
        stockCache.set(cacheKey, freshData, this.TTL_SECONDS);

        return { data: freshData, source: "api" };
    }
}
