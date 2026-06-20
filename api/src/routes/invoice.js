import { Router } from "express";
import { invoiceController } from "../controllers/index.js";
import { authenticate, requireRoles, upload } from "../middlewares/index.js";
import { validateBody, createInvoiceSchema, recordPaymentSchema, submitPaymentRequestSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

// List and details are accessible by RENTAL_MANAGER, ADMIN, and CUSTOMER
router.get("/", invoiceController.getInvoices);
router.get("/:id", invoiceController.getInvoiceById);

// Create invoice (RENTAL_MANAGER and ADMIN only)
router.post(
  "/",
  requireRoles(ROLES.RENTAL_MANAGER, ROLES.ADMIN),
  validateBody(createInvoiceSchema),
  invoiceController.createInvoice
);

// Record payment (reconciliation) (RENTAL_MANAGER and ADMIN only)
router.post(
  "/:id/payments",
  requireRoles(ROLES.RENTAL_MANAGER, ROLES.ADMIN),
  validateBody(recordPaymentSchema),
  invoiceController.recordPayment
);

// Customer payment request with receipt file (CUSTOMER only)
router.post(
  "/:id/payment-request",
  requireRoles(ROLES.CUSTOMER),
  upload.single("receipt"),
  validateBody(submitPaymentRequestSchema),
  invoiceController.submitPaymentRequest
);

export default router;
