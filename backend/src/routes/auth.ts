import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authSchema } from "../services/auth.service";
import { requireAuth } from "../middleware/requireAuth";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

// Apply stricter rate limiting to auth routes
router.use(authLimiter);

router.post("/register", validate(authSchema), authController.register);
router.post("/login", validate(authSchema), authController.login);
router.get("/me", requireAuth, authController.getMe);

export default router;
