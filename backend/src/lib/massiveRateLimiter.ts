class SlidingWindowLimiter {
    private timestamps: number[] = [];
    private readonly windowMs = 60_000;
    private readonly maxCalls: number;

    constructor(maxCalls: number) {
        this.maxCalls = maxCalls;
    }

    private prune(now = Date.now()): void {
        this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    }

    canCall(): boolean {
        const now = Date.now();
        this.prune(now);
        return this.timestamps.length < this.maxCalls;
    }

    record(): void {
        this.prune();
        this.timestamps.push(Date.now());
        console.log(`[RateLimiter] Call recorded. Remaining budget: ${this.remainingCalls}/${this.maxCalls}`);
    }

    get remainingCalls(): number {
        this.prune();
        return Math.max(0, this.maxCalls - this.timestamps.length);
    }

    get nextAvailableIn(): number {
        this.prune();
        if (this.timestamps.length < this.maxCalls) {
            return 0;
        }

        const oldest = this.timestamps[0];
        return Math.max(0, this.windowMs - (Date.now() - oldest));
    }
}

export const massiveRateLimiter = new SlidingWindowLimiter(parseInt(process.env.MASSIVE_MAX_CALLS_PER_MIN || "5", 10));

export type { SlidingWindowLimiter };
