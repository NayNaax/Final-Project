import { stockCache } from "./cache";
import { massiveRateLimiter } from "./massiveRateLimiter";
import { MassiveService } from "../services/massive.service";
import axios from "axios";

export const SUPPORTED_SYMBOLS = [
    "AAPL",
    "MSFT",
    "AMZN",
    "GOOGL",
    "TSLA",
    "SPY",
    "QQQ",
    "XOM",
    "UNH",
    "DIS",
    "META",
    "BRK.B",
    "WMT",
    "JPM",
    "MA",
];

export async function warmAllSymbols(): Promise<void> {
    console.log(`[Pre-Warmer] Warming ${SUPPORTED_SYMBOLS.length} symbols via aggregates...`);

    if (MassiveService.isCircuitOpen()) {
        console.warn("[Pre-Warmer] Skipped: circuit is open.");
        return;
    }

    if (!massiveRateLimiter.canCall()) {
        console.warn("[Pre-Warmer] Skipped: rate limit window exhausted.");
        return;
    }

    massiveRateLimiter.record();

    try {
        const snapshots = await MassiveService.fetchWithRetry(() => MassiveService.fetchAllFromAggs(SUPPORTED_SYMBOLS));

        for (const quote of snapshots) {
            const key = `quote_${quote.symbol}`;
            stockCache.set(key, quote);
            stockCache.setStale(key, quote);
        }

        MassiveService.recordSuccess();
        console.log(`[Pre-Warmer] Cached ${snapshots.length} symbols.`);
    } catch (error: any) {
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            console.warn("[Pre-Warmer] Aggregates endpoint not entitled for this key. Skipping warm cycle.");
            return;
        }

        MassiveService.recordFailure();
        console.error("[Pre-Warmer] Failed:", error?.message || "Unknown error");
    }
}
