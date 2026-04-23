import axios from "axios";
import type { EnrichedQuote } from "./massive.service";

export class PolygonService {
    private static API_URL = "https://api.polygon.io";

    static async fetchQuote(symbol: string): Promise<EnrichedQuote> {
        const apiKey = process.env.POLYGON_API_KEY;
        if (!apiKey) {
            throw new Error("No POLYGON_API_KEY configured - skipping fallback.");
        }

        const normalizedSymbol = symbol.toUpperCase().trim();
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - 10 * 86_400_000).toISOString().split("T")[0];

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
            dayHigh: latest?.h ?? price,
            dayLow: latest?.l ?? price,
            dayOpen: latest?.o ?? price,
            timestamp: latest?.t ?? null,
            source: "polygon-fallback",
        };
    }
}
