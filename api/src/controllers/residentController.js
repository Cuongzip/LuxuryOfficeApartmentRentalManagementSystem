import { residentService } from "../services/index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getResidents = asyncHandler(async (req, res) => {
  const {
    search,
    roomId,
    contractId,
    residencyStatus,
    residencyType,
    page,
    limit,
  } = req.query;

  const result = await residentService.getResidents({
    search,
    roomId,
    contractId,
    residencyStatus,
    residencyType,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getResidentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const resident = await residentService.getResidentById(id);

  res.json({
    success: true,
    data: resident,
  });
});

export const createResident = asyncHandler(async (req, res) => {
  const newResident = await residentService.createResident(req.body, req.file);

  res.status(201).json({
    success: true,
    message: "Thêm người sử dụng mới thành công",
    data: newResident,
  });
});

export const updateResident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedResident = await residentService.updateResident(id, req.body, req.file);

  res.json({
    success: true,
    message: "Cập nhật thông tin người sử dụng thành công",
    data: updatedResident,
  });
});

export const deleteResident = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await residentService.deleteResident(id);

  res.json({
    success: true,
    message: result.message,
  });
});
