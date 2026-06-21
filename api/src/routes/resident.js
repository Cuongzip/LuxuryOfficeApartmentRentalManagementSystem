import { Router } from "express";
import { residentController } from "../controllers/index.js";
import { authenticate, requireRoles, upload } from "../middlewares/index.js";
import { validateBody, createResidentSchema, updateResidentSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

// Secure all endpoints under this router
router.use(authenticate);
router.use(requireRoles(ROLES.SECURITY, ROLES.ADMIN));

router.get("/", residentController.getResidents);
router.get("/:id", residentController.getResidentById);
router.post("/", upload.single("image"), validateBody(createResidentSchema), residentController.createResident);
router.put("/:id", upload.single("image"), validateBody(updateResidentSchema), residentController.updateResident);
router.delete("/:id", residentController.deleteResident);

export default router;
