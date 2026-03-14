import NodeCache from "node-cache";

// Initialize a new cache
// stdTTL: Default time-to-live in seconds
// checkperiod: How often to delete expired elements (in seconds)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

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

    flush: (): void => {
        cache.flushAll();
    },
};
