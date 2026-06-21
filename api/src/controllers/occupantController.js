import { occupantService } from "../services/index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getOccupants = asyncHandler(async (req, res) => {
  const {
    search,
    roomId,
    contractId,
    occupancyStatus,
    occupancyType,
    page,
    limit,
  } = req.query;

  const result = await occupantService.getOccupants({
    search,
    roomId,
    contractId,
    occupancyStatus,
    occupancyType,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getOccupantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const occupant = await occupantService.getOccupantById(id);

  res.json({
    success: true,
    data: occupant,
  });
});

export const createOccupant = asyncHandler(async (req, res) => {
  const newOccupant = await occupantService.createOccupant(req.body, req.file);

  res.status(201).json({
    success: true,
    message: "Thêm người sử dụng mới thành công",
    data: newOccupant,
  });
});

export const updateOccupant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedOccupant = await occupantService.updateOccupant(id, req.body, req.file);

  res.json({
    success: true,
    message: "Cập nhật thông tin người sử dụng thành công",
    data: updatedOccupant,
  });
});

export const deleteOccupant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await occupantService.deleteOccupant(id);

  res.json({
    success: true,
    message: result.message,
  });
});
