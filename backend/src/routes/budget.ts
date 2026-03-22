import { Router } from "express";
import { getBudget, updateBudget, getBudgetStatus } from "../controllers/budget.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/", getBudget);
router.put("/", updateBudget);
router.get("/status", getBudgetStatus);

export default router;
