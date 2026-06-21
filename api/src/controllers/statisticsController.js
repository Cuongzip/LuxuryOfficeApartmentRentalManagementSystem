import { statisticsService } from "../services/index.js";
import { asyncHandler } from "../utils/index.js";

export const getRevenueStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  let buildingId = req.query.buildingId;
  if (buildingId === 'undefined' || buildingId === 'null' || !buildingId) {
    buildingId = undefined;
  }
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
  let buildingId = req.query.buildingId;
  if (buildingId === 'undefined' || buildingId === 'null' || !buildingId) {
    buildingId = undefined;
  }
  const result = await statisticsService.getRoomStatistics({
    buildingId,
  });

  res.json({
    success: true,
    data: result,
  });
});
