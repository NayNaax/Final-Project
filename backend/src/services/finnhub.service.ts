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
}
