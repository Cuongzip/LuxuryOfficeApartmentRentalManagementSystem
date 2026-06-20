import { Router } from "express";
import { customerController } from "../controllers/index.js";
import { authenticate, requireRoles } from "../middlewares/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);
router.use(requireRoles(ROLES.RENTAL_MANAGER, ROLES.ADMIN));

router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomerById);

export default router;
