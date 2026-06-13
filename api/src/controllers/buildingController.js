import { buildingService } from "../services/index.js";
import { asyncHandler } from "../utils/index.js";

export const getBuildings = asyncHandler(async (req, res) => {
  const { keyword, page, limit } = req.query;

  const result = await buildingService.getBuildings({
    keyword,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });

  res.json({
    success: true,
    data: result.buildings,
    pagination: result.pagination,
  });
});

export const getBuildingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const building = await buildingService.getBuildingById(id);

  res.json({
    success: true,
    data: building,
  });
});

export const createBuilding = asyncHandler(async (req, res) => {
  const building = await buildingService.createBuilding(req.body);

  res.status(201).json({
    success: true,
    message: "Tạo tòa nhà mới thành công",
    data: building,
  });
});

export const updateBuilding = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const building = await buildingService.updateBuilding(id, req.body);

  res.json({
    success: true,
    message: "Cập nhật thông tin tòa nhà thành công",
    data: building,
  });
});

export const deleteBuilding = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await buildingService.deleteBuilding(id);

  res.json({
    success: true,
    message: "Xóa tòa nhà thành công",
  });
});
