import { contractService } from "../services/index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getContracts = asyncHandler(async (req, res) => {
  const { customerId, roomId, employeeId, status, page, limit } = req.query;

  const result = await contractService.getContracts({
    customerId,
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
  const contract = await contractService.getContractById(id);

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
