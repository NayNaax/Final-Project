import rateLimit from "express-rate-limit";

// General API rate limiter (100 reqs / 15 mins)
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests from this IP, please try again after 15 minutes",
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
