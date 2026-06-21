import { Router } from "express";
import { statisticsController } from "../controllers/index.js";
import { authenticate, requireRoles } from "../middlewares/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

// Apply auth middleware for all statistics endpoints
router.use(authenticate);
router.use(requireRoles(ROLES.ADMIN, ROLES.RENTAL_MANAGER));

router.get("/summary/export", statisticsController.exportSummaryStatistics);

router.get("/revenue", statisticsController.getRevenueStatistics);
router.get("/contracts", statisticsController.getContractStatistics);
router.get("/rooms", statisticsController.getRoomStatistics);

export default router;
