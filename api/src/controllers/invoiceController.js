import { invoiceService } from "../services/index.js";
import { asyncHandler } from "../utils/index.js";

export const getInvoices = asyncHandler(async (req, res) => {
  const { page, limit, status, month, year, keyword } = req.query;

  const result = await invoiceService.getInvoices(
    {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      month: month ? parseInt(month, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      keyword,
    },
    req.user
  );

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await invoiceService.getInvoiceById(id, req.user);

  res.json({
    success: true,
    data: invoice,
  });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const newInvoice = await invoiceService.createInvoice(req.body);

  res.status(201).json({
    success: true,
    message: "Lập hóa đơn thành công",
    data: newInvoice,
  });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedInvoice = await invoiceService.recordPayment(id, req.body);

  res.json({
    success: true,
    message: "Ghi nhận thanh toán thành công",
    data: updatedInvoice,
  });
});

export const submitPaymentRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedInvoice = await invoiceService.submitPaymentRequest(
    id,
    req.body,
    req.file,
    req.user.id
  );

  res.json({
    success: true,
    message: "Gửi yêu cầu thanh toán thành công. Yêu cầu của bạn đang chờ xác nhận.",
    data: updatedInvoice,
  });
});
