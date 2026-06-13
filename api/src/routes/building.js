import { Router } from "express";
import { buildingController } from "../controllers/index.js";
import { authenticate, requireRoles, upload, parseMultipartImages } from "../middlewares/index.js";
import { validateBody, buildingSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);
router.use(requireRoles(ROLES.ADMIN));

router.get("/", buildingController.getBuildings);
router.get("/:id", buildingController.getBuildingById);
router.post("/", upload.array("images", 10), parseMultipartImages, validateBody(buildingSchema), buildingController.createBuilding);
router.put("/:id", upload.array("images", 10), parseMultipartImages, validateBody(buildingSchema), buildingController.updateBuilding);
router.delete("/:id", buildingController.deleteBuilding);

export default router;
