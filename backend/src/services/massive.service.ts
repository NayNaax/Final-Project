import axios from "axios";

export interface EnrichedQuote {
    symbol: string;
    price: number;
    c: number;
    previousClose: number;
    change: number;
    changePercent: number;
    volume: number;
    d: number;
    dp: number;
    v: number;
    dayHigh: number;
    dayLow: number;
    dayOpen: number;
    timestamp: number | null;
    source: string;
}

export interface HistoricalBar {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Massive API integration service (formerly Polygon)
export class MassiveService {
    private static API_URL = "https://api.polygon.io";
    private static circuitBreakerOpen = false;
    private static failureCount = 0;
    private static MAX_FAILURES = 5;
    private static rateLimitResetAt = 0;

    private static markRateLimited(retryAfterHeader?: string | string[]): void {
        const firstValue = Array.isArray(retryAfterHeader) ? retryAfterHeader[0] : retryAfterHeader;
        const retryAfterSeconds = Number(firstValue);
        const retryAfterMs =
            Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : 60_000;
        this.rateLimitResetAt = Date.now() + retryAfterMs;
    }

    static isRateLimited(): boolean {
        return Date.now() < this.rateLimitResetAt;
    }

    static isCircuitOpen(): boolean {
        return this.circuitBreakerOpen;
    }

    static recordSuccess(): void {
        this.failureCount = 0;
        this.circuitBreakerOpen = false;
        this.rateLimitResetAt = 0;
    }

    static recordFailure(): void {
        this.failureCount++;
        if (this.failureCount >= this.MAX_FAILURES) {
            this.circuitBreakerOpen = true;
        }
    }

    static async fetchQuote(symbol: string) {
        if (this.isRateLimited()) {
            throw new Error("Massive rate limit cooldown is active.");
        }

        if (this.isCircuitOpen()) {
            throw new Error("Massive circuit breaker is open.");
        }

        const apiKey = process.env.MASSIVE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing MASSIVE_API_KEY");
        }

        const normalizedSymbol = symbol.toUpperCase().trim();
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - 10 * 86_400_000).toISOString().split("T")[0];

        try {
            const response = await axios.get(
                `${this.API_URL}/v2/aggs/ticker/${normalizedSymbol}/range/1/day/${from}/${to}`,
                {
                    params: {
                        apiKey,
                        adjusted: true,
                        sort: "asc",
                    },
                    timeout: 10_000,
                },
            );

            const bars = response.data?.results ?? [];
            if (bars.length === 0) {
                throw new Error(`No aggregate bars found for ${normalizedSymbol}`);
            }

            const latest = bars[bars.length - 1];
            const previous = bars[bars.length - 2] ?? latest;
            const price = latest?.c ?? 0;
            const previousClose = previous?.c ?? price;

            return {
                symbol: normalizedSymbol,
                price,
                c: price,
                previousClose,
                change: price - previousClose,
                changePercent: previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0,
                volume: latest?.v ?? 0,
                d: price - previousClose,
                dp: previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0,
                v: latest?.v ?? 0,
                dayHigh: latest?.h ?? price,
                dayLow: latest?.l ?? price,
                dayOpen: latest?.o ?? price,
                timestamp: latest?.t ?? null,
                source: "massive",
            };
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                this.markRateLimited(error.response.headers?.["retry-after"]);
                this.recordFailure();
                throw new Error("Massive rate limit reached. Using fallback provider/cache.");
            }

            this.recordFailure();
            console.error(`Failed to fetch quote for ${symbol} from Massive:`, error.message);
            throw error;
        }
    }

    static async fetchAllFromAggs(symbols: string[]) {
        if (this.isRateLimited()) {
            return [];
        }

        if (this.isCircuitOpen()) {
            return [];
        }

        const apiKey = process.env.MASSIVE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing MASSIVE_API_KEY");
        }

        const quotes = [];
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - 10 * 86_400_000).toISOString().split("T")[0];

        for (const symbol of symbols) {
            if (this.isRateLimited() || this.isCircuitOpen()) {
                break;
            }

            try {
                const response = await axios.get(
                    `${this.API_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/day/${from}/${to}`,
                    {
                        params: {
                            apiKey,
                            adjusted: true,
                            sort: "asc",
                        },
                        timeout: 10_000,
                    },
                );

                const bars = response.data?.results ?? [];
                if (bars.length > 0) {
                    const latest = bars[bars.length - 1];
                    const previous = bars[bars.length - 2] ?? latest;
                    const price = latest?.c ?? 0;
                    const previousClose = previous?.c ?? price;

                    quotes.push({
                        symbol: symbol.toUpperCase(),
                        price,
                        c: price,
                        previousClose,
                        change: price - previousClose,
                        changePercent: previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0,
                        volume: latest?.v ?? 0,
                        d: price - previousClose,
                        dp: previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0,
                        v: latest?.v ?? 0,
                        dayHigh: latest?.h ?? price,
                        dayLow: latest?.l ?? price,
                        dayOpen: latest?.o ?? price,
                        timestamp: latest?.t ?? null,
                        source: "massive",
                    });
                }
            } catch (error: any) {
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    this.markRateLimited(error.response.headers?.["retry-after"]);
                    this.recordFailure();
                    console.warn("Massive rate limit reached while fetching bulk quotes. Ending this warm cycle.");
                    break;
                }

                this.recordFailure();
                console.error(`Failed to fetch quote for ${symbol} from Massive:`, error.message);
                // Continue to next symbol on error
            }
        }

        if (quotes.length > 0) {
            this.recordSuccess();
        }

        return quotes;
    }

    static async fetchHistoricalData(symbol: string, daysBack: number = 365): Promise<HistoricalBar[]> {
        if (this.isRateLimited()) {
            throw new Error("Massive rate limit cooldown is active.");
        }

        if (this.isCircuitOpen()) {
            throw new Error("Massive circuit breaker is open.");
        }

        const apiKey = process.env.MASSIVE_API_KEY;
        if (!apiKey) {
            throw new Error("Missing MASSIVE_API_KEY");
        }

        const normalizedSymbol = symbol.toUpperCase().trim();
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - daysBack * 86_400_000).toISOString().split("T")[0];

        try {
            const response = await axios.get(
                `${this.API_URL}/v2/aggs/ticker/${normalizedSymbol}/range/1/day/${from}/${to}`,
                {
                    params: {
                        apiKey,
                        adjusted: true,
                        sort: "asc",
                    },
                    timeout: 10_000,
                },
            );

            const bars = response.data?.results ?? [];
            return bars.map((bar: any) => ({
                date: new Date(bar.t).toISOString().split("T")[0],
                open: bar.o ?? 0,
                high: bar.h ?? 0,
                low: bar.l ?? 0,
                close: bar.c ?? 0,
                volume: bar.v ?? 0,
            }));
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response?.status === 429) {
                this.markRateLimited(error.response.headers?.["retry-after"]);
                this.recordFailure();
                throw new Error("Massive rate limit reached. Using fallback provider/cache.");
            }

            this.recordFailure();
            console.error(`Failed to fetch historical data for ${symbol} from Massive:`, error.message);
            throw error;
        }
    }

    static async fetchWithRetry<T>(fn: () => Promise<T>, maxRetries: number = 3, backoffMs: number = 1000): Promise<T> {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error: any) {
                if (attempt === maxRetries - 1) throw error;
                await new Promise((resolve) => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
            }
        }
        throw new Error("Max retries exceeded");
    }
}
