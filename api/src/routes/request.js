import { Router } from "express";
import { requestController } from "../controllers/index.js";
import { authenticate, requireRoles } from "../middlewares/index.js";
import { validateBody, createRequestSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

// Customers can create a room viewing request
router.post(
  "/",
  requireRoles(ROLES.CUSTOMER),
  validateBody(createRequestSchema),
  requestController.createRequest
);

export default router;
