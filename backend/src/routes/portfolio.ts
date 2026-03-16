import { Router } from "express";
import * as portfolioController from "../controllers/portfolio.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/", portfolioController.getPortfolio);
router.get("/history", portfolioController.getPortfolioHistory);
router.get("/trades", portfolioController.getTradeHistory);
router.post("/buy", portfolioController.buy);
router.post("/sell", portfolioController.sell);

export default router;
