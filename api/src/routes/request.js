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

router.use(requireRoles(ROLES.RENTAL_MANAGER));

router.get("/", requestController.getRequests);

router.patch(
  "/:id/status",
  validateBody(updateRequestStatusSchema),
  requestController.updateRequestStatus
);

export default router;
