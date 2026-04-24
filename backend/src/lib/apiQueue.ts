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

    const symbolsToWarm = SUPPORTED_SYMBOLS.slice(0, massiveRateLimiter.remainingCalls);
    if (symbolsToWarm.length === 0) {
        console.warn("[Pre-Warmer] Skipped: no remaining call budget.");
        return;
    }

    try {
        const snapshots = [];

        for (const symbol of symbolsToWarm) {
            if (!massiveRateLimiter.canCall() || MassiveService.isRateLimited() || MassiveService.isCircuitOpen()) {
                break;
            }

            massiveRateLimiter.record();

            try {
                const quote = await MassiveService.fetchWithRetry(() => MassiveService.fetchQuote(symbol));
                snapshots.push(quote);
            } catch (error: any) {
                if (axios.isAxiosError(error) && error.response?.status === 429) {
                    console.warn("[Pre-Warmer] Massive returned 429. Ending warm cycle early.");
                    break;
                }

                console.error(`[Pre-Warmer] Failed for ${symbol}:`, error?.message || "Unknown error");
            }
        }

        for (const quote of snapshots) {
            const key = `quote_${quote.symbol}`;
            stockCache.set(key, quote);
            stockCache.setStale(key, quote);
        }

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
