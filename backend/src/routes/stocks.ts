import { Router } from "express";
import * as stocksController from "../controllers/stocks.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// Health/Debug routes don't necessarily need auth for this specific DB verification task
router.get("/raw", stocksController.getRawStocks);

// Finance endpoints generally require authentication
router.get("/", requireAuth, stocksController.getLatestPrices);
router.get("/:symbol", requireAuth, stocksController.getStockData);

export default router;
