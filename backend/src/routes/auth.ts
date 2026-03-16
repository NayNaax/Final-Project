import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authSchema } from "../services/auth.service";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/register", validate(authSchema), authController.register);
router.post("/login", validate(authSchema), authController.login);
router.get("/me", requireAuth, authController.getMe);

export default router;
