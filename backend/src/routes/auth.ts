import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { authSchema, registerSchema } from "../services/auth.service";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(authSchema), authController.login);
router.get("/me", requireAuth, authController.getMe);
router.get("/check-username", authController.checkUsernameAvailable);

export default router;
