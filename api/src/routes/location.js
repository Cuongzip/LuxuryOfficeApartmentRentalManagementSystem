import { Router } from "express";
import { locationController } from "../controllers/index.js";

const router = Router();

router.get("/provinces", locationController.getProvinces);
router.get("/wards", locationController.getWards);

export default router;
