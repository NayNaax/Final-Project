import axios from "axios";
import type { EnrichedQuote } from "./massive.service";

export interface HistoricalBar {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

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
            d: price - previousClose,
            dp: previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0,
            v: latest?.v ?? 0,
            dayHigh: latest?.h ?? price,
            dayLow: latest?.l ?? price,
            dayOpen: latest?.o ?? price,
            timestamp: latest?.t ?? null,
            source: "polygon-fallback",
        };
    }

    static async fetchHistoricalData(symbol: string, daysBack: number = 365): Promise<HistoricalBar[]> {
        const apiKey = process.env.POLYGON_API_KEY;
        if (!apiKey) {
            throw new Error("No POLYGON_API_KEY configured");
        }

        const normalizedSymbol = symbol.toUpperCase().trim();
        const to = new Date().toISOString().split("T")[0];
        const from = new Date(Date.now() - daysBack * 86_400_000).toISOString().split("T")[0];

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
    }
}
