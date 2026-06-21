import { Router } from "express";
import { occupantController } from "../controllers/index.js";
import { authenticate, requireRoles, upload } from "../middlewares/index.js";
import { validateBody, createOccupantSchema, updateOccupantSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

// Secure all endpoints under this router
router.use(authenticate);
router.use(requireRoles(ROLES.SECURITY));

router.get("/", occupantController.getOccupants);
router.get("/:id", occupantController.getOccupantById);
router.post("/", upload.single("image"), validateBody(createOccupantSchema), occupantController.createOccupant);
router.put("/:id", upload.single("image"), validateBody(updateOccupantSchema), occupantController.updateOccupant);
router.delete("/:id", occupantController.deleteOccupant);

export default router;
