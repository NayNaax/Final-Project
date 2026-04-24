import NodeCache from "node-cache";

// Initialize a new cache
// stdTTL: Default time-to-live in seconds
// checkperiod: How often to delete expired elements (in seconds)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const staleCache = new NodeCache({
    stdTTL: parseInt(process.env.CACHE_STALE_TTL_SECONDS || "86400", 10),
    checkperiod: 120,
});

export const stockCache = {
    get: <T>(key: string): T | undefined => {
        return cache.get<T>(key);
    },

    set: <T>(key: string, value: T, ttlSeconds?: number): boolean => {
        if (ttlSeconds) {
            return cache.set(key, value, ttlSeconds);
        }
        return cache.set(key, value);
    },

    getStale: <T>(key: string): T | undefined => {
        return staleCache.get<T>(key);
    },

    setStale: <T>(key: string, value: T, ttlSeconds?: number): boolean => {
        if (ttlSeconds) {
            return staleCache.set(key, value, ttlSeconds);
        }
        return staleCache.set(key, value);
    },

    flush: (): void => {
        cache.flushAll();
        staleCache.flushAll();
    },
};
