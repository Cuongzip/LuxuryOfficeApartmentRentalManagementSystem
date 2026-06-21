import { statisticsService, exportService } from "../services/index.js";
import { asyncHandler, AppError } from "../utils/index.js";

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

const VALID_FORMATS = ["pdf", "xlsx"];

const validateFormat = (format) => {
  if (!format || !VALID_FORMATS.includes(format.toLowerCase())) {
    throw new AppError("Định dạng xuất báo cáo không hợp lệ. Vui lòng chọn PDF hoặc XLSX.", 400);
  }
  return format.toLowerCase();
};


export const exportSummaryStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  let buildingId = req.query.buildingId;
  if (buildingId === "undefined" || buildingId === "null" || !buildingId) {
    buildingId = undefined;
  }
  const format = validateFormat(req.query.format);

  const revenueData = await statisticsService.getRevenueStatistics({ startDate, endDate, buildingId });
  const contractData = await statisticsService.getContractStatistics({ startDate, endDate });
  const roomData = await statisticsService.getRoomStatistics({ buildingId });

  if (format === "xlsx") {
    await exportService.exportSummaryToExcel({ revenueData, contractData, roomData }, res);
  } else {
    await exportService.exportSummaryToPdf({ revenueData, contractData, roomData }, res);
  }
});
