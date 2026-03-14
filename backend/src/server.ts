import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";
import { prisma } from "./lib/prisma";

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev")); // HTTP request logger
app.use(generalLimiter); // Apply general rate limit to all requests

// Health Check Route
app.get("/api/health", async (req, res) => {
    try {
        // Quick DB query to verify connection
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: "ok",
            db: "connected",
            uptime: process.uptime(),
        });
    } catch (error) {
        res.status(503).json({
            status: "error",
            db: "disconnected",
            uptime: process.uptime(),
        });
    }
});

import authRouter from "./routes/auth";
import stocksRouter from "./routes/stocks";
import watchlistsRouter from "./routes/watchlists";
import portfolioRouter from "./routes/portfolio";
import alertsRouter from "./routes/alerts";
import settingsRouter from "./routes/settings";

// Mount routes here as they are implemented
app.use("/api/auth", authRouter);
app.use("/api/stocks", stocksRouter);
app.use("/api/watchlists", watchlistsRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/settings", settingsRouter);
// ...

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

import { initCronJobs } from "./services/cron.service";

const server = app.listen(port, () => {
    console.log(`Backend server started on http://localhost:${port}`);
    initCronJobs();
});

// Graceful Shutdown Support
const gracefulShutdown = () => {
    console.log("Stopping server...");
    server.close(async () => {
        console.log("Server stopped.");
        await prisma.$disconnect();
        console.log("Prisma disconnected.");
        process.exit(0);
    });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
