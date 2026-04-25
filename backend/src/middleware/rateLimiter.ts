import rateLimit from "express-rate-limit";

const isProd = process.env.NODE_ENV === "production";
const generalWindowMs = Number(process.env.GENERAL_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const generalMax = Number(process.env.GENERAL_RATE_LIMIT_MAX || (isProd ? 100 : 1000));

// General API rate limiter (100 reqs / 15 mins)
export const generalLimiter = rateLimit({
    windowMs: generalWindowMs,
    max: generalMax,
    message: {
        error: "Too many requests from this IP, please try again later",
        code: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter auth rate limiter (10 reqs / 15 mins)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: "Too many login/register attempts, please try again after 15 minutes",
        code: 429,
    },
    standardHeaders: true,
    legacyHeaders: false,
});
