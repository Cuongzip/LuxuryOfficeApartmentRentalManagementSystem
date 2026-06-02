import { Router } from "express";

import * as authController from "../controllers/authController.js";
import { validateBody } from "../validators/validate.js";
import { registerSchema } from "../validators/authValidators.js";

const router = Router();

router.post(
  "/register",
  validateBody(registerSchema),
  authController.register,
);
router.get("/verify-email", authController.verifyEmail);

export default router;
