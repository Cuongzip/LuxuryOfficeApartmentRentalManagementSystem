import { Router } from "express";
import { contractController } from "../controllers/index.js";
import { authenticate, requireRoles } from "../middlewares/index.js";
import { validateBody, createContractSchema, extendContractSchema, cancelContractSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

router.get("/", contractController.getContracts);
router.get("/:id", contractController.getContractById);

// RENTAL_MANAGER-only endpoints for contract operations
router.post("/", requireRoles(ROLES.RENTAL_MANAGER), validateBody(createContractSchema), contractController.createContract);
router.patch("/:id/extend", requireRoles(ROLES.RENTAL_MANAGER), validateBody(extendContractSchema), contractController.extendContract);
router.patch("/:id/cancel", requireRoles(ROLES.RENTAL_MANAGER), validateBody(cancelContractSchema), contractController.cancelContract);

export default router;
