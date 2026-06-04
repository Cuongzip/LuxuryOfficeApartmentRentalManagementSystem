import { Router } from "express";

import { authController } from "../controllers/index.js";
import { validateBody, registerSchema, loginSchema } from "../validators/index.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  authController.register,
);
router.get("/verify-email", authController.verifyEmail);
router.post(
  "/login",
  validateBody(loginSchema),
  authController.login,
);

export default router;
