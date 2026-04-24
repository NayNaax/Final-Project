import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { PortfolioService } from "./portfolio.service";
import { AlertsService } from "./alerts.service";

// Run every night at midnight (server time)
export const initCronJobs = () => {
    cron.schedule("0 0 * * *", async () => {
        console.log("Running scheduled portfolio snapshots...");
        try {
            const users = await prisma.user.findMany({ select: { id: true } });

            for (const user of users) {
                try {
                    // Generates the portfolio breakdown at current market rates
                    const portfolio = await PortfolioService.getPortfolio(user.id);

                    await prisma.portfolioSnapshot.create({
                        data: {
                            userId: user.id,
                            totalValue: portfolio.totalEquity,
                        },
                    });
                } catch (e) {
                    console.error(`Failed snapshot for user ${user.id}`, e);
                }
            }

            console.log("Finished scheduled portfolio snapshots.");
        } catch (err) {
            console.error("Error during batch snapshot processing:", err);
        }
    });

    // Check price alerts every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
        try {
            const { triggeredCount } = await AlertsService.checkAndTrigger();
            if (triggeredCount > 0) {
                console.log(`Triggered ${triggeredCount} new price alert(s)`);
            }
        } catch (err) {
            console.error("Error during scheduled alert checking:", err);
        }
    });

    console.log("Cron jobs initialized.");
};
