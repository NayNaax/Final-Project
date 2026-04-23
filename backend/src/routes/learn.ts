import { Router } from "express";
import * as learnController from "../controllers/learn.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/progress", learnController.getProgress);
router.post("/lesson/:lessonId/complete", learnController.completeLesson);
router.post("/quiz/:lessonId/submit", learnController.submitQuiz);
router.get("/missions", learnController.getMissions);
router.post("/mission/:missionId/complete", learnController.completeMission);
router.get("/journal", learnController.getJournal);
router.post("/journal/reason", learnController.addJournalReason);

export default router;
