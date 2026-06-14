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
router.use(requireRoles(ROLES.RENTAL_MANAGER));

router.post("/", validateBody(createContractSchema), contractController.createContract);
router.patch("/:id/extend", validateBody(extendContractSchema), contractController.extendContract);
router.patch("/:id/cancel", validateBody(cancelContractSchema), contractController.cancelContract);

export default router;
