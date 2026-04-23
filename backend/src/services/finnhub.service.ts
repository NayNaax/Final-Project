import axios from "axios";
import { stockCache } from "../lib/cache";

export interface CompanyNewsItem {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

export interface HistoricalBar {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface CompanyNewsParams {
    symbol: string;
    from: string;
    to: string;
}

export class FinnhubService {
    private static API_URL = "https://finnhub.io/api/v1";
    private static NEWS_CACHE_TTL_SECONDS = 900;

    private static getApiKey(): string {
        const apiKey = process.env.FINNHUB_API_KEY;
        if (!apiKey) {
            throw new Error("Missing FINNHUB_API_KEY");
        }

        return apiKey;
    }

    static async getCompanyNews(params: CompanyNewsParams): Promise<CompanyNewsItem[]> {
        const symbol = params.symbol.toUpperCase().trim();
        const from = params.from;
        const to = params.to;
        const cacheKey = `finnhub_company_news_${symbol}_${from}_${to}`;

        const cached = stockCache.get<CompanyNewsItem[]>(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.API_URL}/company-news`, {
                params: {
                    symbol,
                    from,
                    to,
                    token: this.getApiKey(),
                },
                timeout: 10_000,
            });

            const news = Array.isArray(response.data) ? response.data : [];
            stockCache.set(cacheKey, news, this.NEWS_CACHE_TTL_SECONDS);

            return news;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    throw new Error("Finnhub API key rejected by upstream service.");
                }

                if (status === 429) {
                    throw new Error("Finnhub rate limit reached. Please retry shortly.");
                }
            }

            throw error;
        }
    }

    static async getQuote(symbol: string) {
        const normalizedSymbol = symbol.toUpperCase().trim();

        try {
            const response = await axios.get(`${this.API_URL}/quote`, {
                params: {
                    symbol: normalizedSymbol,
                    token: this.getApiKey(),
                },
                timeout: 10_000,
            });

            const data = response.data;
            return {
                symbol: normalizedSymbol,
                price: data.c || 0,
                c: data.c || 0,
                previousClose: data.pc || data.c || 0,
                change: (data.c || 0) - (data.pc || data.c || 0),
                changePercent: data.dp || 0,
                volume: data.v || 0,
                dayHigh: data.h || data.c || 0,
                dayLow: data.l || data.c || 0,
                dayOpen: data.o || data.c || 0,
                timestamp: (data.t || 0) * 1000,
            };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    throw new Error("Finnhub API key rejected by upstream service.");
                }

                if (status === 429) {
                    throw new Error("Finnhub rate limit reached. Please retry shortly.");
                }
            }

            throw error;
        }
    }

    static async getHistoricalCandles(symbol: string, daysBack: number = 365): Promise<HistoricalBar[]> {
        const normalizedSymbol = symbol.toUpperCase().trim();
        const now = Math.floor(Date.now() / 1000);
        const from = now - daysBack * 86400; // Convert days to seconds

        try {
            const response = await axios.get(`${this.API_URL}/stock/candle`, {
                params: {
                    symbol: normalizedSymbol,
                    resolution: "D", // Daily candles
                    from,
                    to: now,
                    token: this.getApiKey(),
                },
                timeout: 10_000,
            });

            const data = response.data;
            if (data.s !== "ok" || !data.o || data.o.length === 0) {
                throw new Error(`No candle data for ${normalizedSymbol}`);
            }

            // Map Finnhub candle format to HistoricalBar format
            return data.o.map((open: number, idx: number) => ({
                date: new Date(data.t[idx] * 1000).toISOString().split("T")[0],
                open: open,
                high: data.h[idx] ?? 0,
                low: data.l[idx] ?? 0,
                close: data.c[idx] ?? 0,
                volume: data.v[idx] ?? 0,
            }));
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401 || status === 403) {
                    throw new Error("Finnhub API key rejected by upstream service.");
                }

                if (status === 429) {
                    throw new Error("Finnhub rate limit reached. Please retry shortly.");
                }
            }

            throw error;
        }
    }
}
