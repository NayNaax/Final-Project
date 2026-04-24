import { Router } from "express";
import * as alertsController from "../controllers/alerts.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/", alertsController.getAllForUser);
router.post("/", alertsController.create);
router.delete("/:id", alertsController.deleteAlert);
router.patch("/:id/rearm", alertsController.rearm);

export default router;
