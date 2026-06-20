import { locationService } from "../services/index.js";
import { asyncHandler } from "../utils/index.js";

export const getProvinces = asyncHandler(async (req, res) => {
  const provinces = await locationService.getProvinces();
  res.json({
    success: true,
    data: provinces,
  });
});

export const getWards = asyncHandler(async (req, res) => {
  const provinceId = req.query.provinceId;
  const wards = await locationService.getWards(provinceId);
  res.json({
    success: true,
    data: wards,
  });
});
