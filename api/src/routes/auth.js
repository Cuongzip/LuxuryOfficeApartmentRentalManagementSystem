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
router.post("/logout", authController.logout);

export default router;
