import { Router } from "express";
import { invoiceController } from "../controllers/index.js";
import { authenticate, requireRoles, upload } from "../middlewares/index.js";
import { validateBody, createInvoiceSchema, recordPaymentSchema, submitPaymentRequestSchema } from "../validators/index.js";
import { ROLES } from "../constants/index.js";

const router = Router();

router.use(authenticate);

// List and details are accessible by RENTAL_MANAGER and CUSTOMER
router.get("/", invoiceController.getInvoices);
router.get("/:id", invoiceController.getInvoiceById);

// Create invoice (RENTAL_MANAGER)
router.post(
  "/",
  requireRoles(ROLES.RENTAL_MANAGER),
  validateBody(createInvoiceSchema),
  invoiceController.createInvoice
);

// Record payment (reconciliation) (RENTAL_MANAGER)
router.post(
  "/:id/payments",
  requireRoles(ROLES.RENTAL_MANAGER),
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
