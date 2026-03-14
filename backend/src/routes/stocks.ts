import { Router } from "express";
import * as stocksController from "../controllers/stocks.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// Generally we require authentication to interact with the finance endpoints
router.use(requireAuth);

router.get("/", stocksController.getLatestPrices);
router.get("/:symbol", stocksController.getStockData);

export default router;
