import { contractService } from "../services/index.js";
import { asyncHandler, AppError } from "../utils/index.js";
import { ROLES } from "../constants/index.js";

export const getContracts = asyncHandler(async (req, res) => {
  const { customerId, roomId, employeeId, status, page, limit } = req.query;

  const allowedRoles = [ROLES.RENTAL_MANAGER, ROLES.CUSTOMER, ROLES.SECURITY, ROLES.ADMIN];
  if (!allowedRoles.includes(req.user.role)) {
    throw new AppError("Bạn không có quyền truy cập chức năng này", 403);
  }

  let targetCustomerId = customerId;
  if (req.user.role === ROLES.CUSTOMER) {
    if (!req.user.customerId) {
      throw new AppError("Tài khoản chưa được liên kết thông tin khách hàng", 403);
    }
    targetCustomerId = req.user.customerId;
  }

  const result = await contractService.getContracts({
    customerId: targetCustomerId,
    roomId,
    employeeId,
    status,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getContractById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const allowedRoles = [ROLES.RENTAL_MANAGER, ROLES.ADMIN, ROLES.CUSTOMER, ROLES.SECURITY];
  if (!allowedRoles.includes(req.user.role)) {
    throw new AppError("Bạn không có quyền truy cập chức năng này", 403);
  }

  const contract = await contractService.getContractById(id);

  if (req.user.role === ROLES.CUSTOMER && contract.customerId !== req.user.customerId) {
    throw new AppError("Bạn không có quyền truy cập chi tiết hợp đồng của người khác", 403);
  }

  res.json({
    success: true,
    data: contract,
  });
});

export const createContract = asyncHandler(async (req, res) => {
  const newContract = await contractService.createContract(req.body);

  res.status(201).json({
    success: true,
    message: "Tạo hợp đồng thành công",
    data: newContract,
  });
});

export const extendContract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedContract = await contractService.extendContract(id, req.body);

  res.json({
    success: true,
    message: "Gia hạn hợp đồng thành công",
    data: updatedContract,
  });
});

export const cancelContract = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedContract = await contractService.cancelContract(id, req.body);

  res.json({
    success: true,
    message: "Hủy hợp đồng thành công",
    data: updatedContract,
  });
});
