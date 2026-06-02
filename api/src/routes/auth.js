import { Router } from "express";

import * as authController from "../controllers/authController.js";
import { validateBody } from "../validators/validate.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";

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
