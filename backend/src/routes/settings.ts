import { Router } from "express";
import * as settingsController from "../controllers/settings.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// Leaderboard can be public or semi-restricted, going with auth required here for now.
router.get("/leaderboard", requireAuth, settingsController.getLeaderboard);

router.get("/", requireAuth, settingsController.getSettings);
router.patch("/", requireAuth, settingsController.updateSettings);

export default router;
