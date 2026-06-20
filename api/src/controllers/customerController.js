import { customerService } from "../services/index.js";
import { asyncHandler } from "../utils/index.js";

export const getCustomers = asyncHandler(async (req, res) => {
  const { keyword, page, limit } = req.query;

  const result = await customerService.getCustomers({
    keyword,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await customerService.getCustomerById(id);

  res.json({
    success: true,
    data: customer,
  });
});
