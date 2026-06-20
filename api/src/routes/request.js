import { Router } from "express";
import { requestController } from "../controllers/index.js";
import { authenticate, requireRoles } from "../middlewares/index.js";
import { validateBody, createRequestSchema, updateRequestStatusSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  requireRoles(ROLES.CUSTOMER),
  validateBody(createRequestSchema),
  requestController.createRequest
);

// Both RENTAL_MANAGER and CUSTOMER can get requests and update status
router.get(
  "/",
  requireRoles(ROLES.RENTAL_MANAGER, ROLES.CUSTOMER),
  requestController.getRequests
);

router.patch(
  "/:id/status",
  requireRoles(ROLES.RENTAL_MANAGER, ROLES.CUSTOMER),
  validateBody(updateRequestStatusSchema),
  requestController.updateRequestStatus
);

export default router;

