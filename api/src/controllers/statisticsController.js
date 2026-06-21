import { statisticsService } from "../services/index.js";
import { asyncHandler } from "../utils/index.js";

export const getRevenueStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, buildingId } = req.query;
  const result = await statisticsService.getRevenueStatistics({
    startDate,
    endDate,
    buildingId,
  });

  res.json({
    success: true,
    data: result,
  });
});

export const getContractStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const result = await statisticsService.getContractStatistics({
    startDate,
    endDate,
  });

  res.json({
    success: true,
    data: result,
  });
});

export const getRoomStatistics = asyncHandler(async (req, res) => {
  const { buildingId } = req.query;
  const result = await statisticsService.getRoomStatistics({
    buildingId,
  });

  res.json({
    success: true,
    data: result,
  });
});
