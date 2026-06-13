import { Router } from "express";
import { roomController } from "../controllers/index.js";
import { authenticate, requireRoles, upload, parseMultipartImages } from "../middlewares/index.js";
import { validateBody, roomSchema, updateRoomSchema, roomStatusSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

router.get("/", roomController.getRooms);
router.get("/:id", roomController.getRoomById);

// Admin-only endpoints for room modifications
router.post("/", requireRoles(ROLES.ADMIN), upload.array("images", 10), parseMultipartImages, validateBody(roomSchema), roomController.createRoom);
router.put("/:id", requireRoles(ROLES.ADMIN), upload.array("images", 10), parseMultipartImages, validateBody(updateRoomSchema), roomController.updateRoom);
router.patch("/:id/status", requireRoles(ROLES.ADMIN), validateBody(roomStatusSchema), roomController.updateRoomStatus);
router.delete("/:id", requireRoles(ROLES.ADMIN), roomController.deleteRoom);

export default router;
