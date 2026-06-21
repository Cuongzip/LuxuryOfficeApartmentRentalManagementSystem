import prisma from "../config/database.js";
import { AppError } from "../utils/index.js";
import { PAYMENT_STATUS, CONTRACT_STATUS, ROOM_STATUS } from "../constants/index.js";

export const getRevenueStatistics = async ({ startDate, endDate, buildingId }) => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), 0, 1);
  const end = endDate ? new Date(endDate) : now;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError("Ngày bắt đầu hoặc kết thúc không hợp lệ", 400);
  }
  if (start > end) {
    throw new AppError("Khoảng thời gian không hợp lệ (ngày bắt đầu lớn hơn ngày kết thúc)", 400);
  }

  // Fetch all invoice details where the parent invoice is paid and matches range
  const invoiceDetails = await prisma.invoiceDetail.findMany({
    where: {
      invoice: {
        paymentStatus: PAYMENT_STATUS.PAID,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      contractDetail: buildingId ? { room: { buildingId } } : undefined,
    },
    include: {
      contractDetail: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
        },
      },
      invoice: true,
      service: true,
    },
  });

  let totalRevenue = 0;
  const monthsMap = {};
  const buildingsMap = {};
  const servicesMap = {};
  const roomsMap = {};

  for (const detail of invoiceDetails) {
    const amount = Number(detail.quantity) * Number(detail.unitPrice);
    totalRevenue += amount;

    // Group by month
    const monthKey = `${String(detail.invoice.paymentMonth).padStart(2, "0")}/${detail.invoice.paymentYear}`;
    monthsMap[monthKey] = (monthsMap[monthKey] || 0) + amount;

    // Group by building
    const buildingName = detail.contractDetail.room.building.name;
    buildingsMap[buildingName] = (buildingsMap[buildingName] || 0) + amount;

    // Group by service
    const serviceName = detail.service.name;
    servicesMap[serviceName] = (servicesMap[serviceName] || 0) + amount;

    // Group by room
    const roomNumber = `${detail.contractDetail.room.roomNumber} (${detail.contractDetail.room.building.name})`;
    roomsMap[roomNumber] = (roomsMap[roomNumber] || 0) + amount;
  }

  const byMonth = Object.entries(monthsMap).map(([month, amount]) => ({ month, amount })).sort((a, b) => {
    const [m1, y1] = a.month.split("/").map(Number);
    const [m2, y2] = b.month.split("/").map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });

  const byBuilding = Object.entries(buildingsMap).map(([building, amount]) => ({ building, amount }));
  const byService = Object.entries(servicesMap).map(([service, amount]) => ({ service, amount }));
  const byRoom = Object.entries(roomsMap).map(([room, amount]) => ({ room, amount }));

  return {
    totalRevenue,
    byMonth,
    byBuilding,
    byService,
    byRoom,
  };
};

export const getContractStatistics = async ({ startDate, endDate }) => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const end = endDate ? new Date(endDate) : now;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError("Ngày bắt đầu hoặc kết thúc không hợp lệ", 400);
  }
  if (start > end) {
    throw new AppError("Khoảng thời gian không hợp lệ (ngày bắt đầu lớn hơn ngày kết thúc)", 400);
  }

  // Fetch all contracts created in period
  const contracts = await prisma.contract.findMany({
    where: {
      createdDate: {
        gte: start,
        lte: end,
      },
    },
  });

  let activeCount = 0;
  let expiredCount = 0;
  let cancelledCount = 0;
  const trendMap = {};

  for (const contract of contracts) {
    if (contract.status === CONTRACT_STATUS.ACTIVE) activeCount++;
    else if (contract.status === CONTRACT_STATUS.EXPIRED) expiredCount++;
    else if (contract.status === CONTRACT_STATUS.CANCELLED) cancelledCount++;

    const date = new Date(contract.createdDate);
    const monthKey = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    trendMap[monthKey] = (trendMap[monthKey] || 0) + 1;
  }

  const trend = Object.entries(trendMap).map(([month, count]) => ({ month, count })).sort((a, b) => {
    const [m1, y1] = a.month.split("/").map(Number);
    const [m2, y2] = b.month.split("/").map(Number);
    return y1 !== y2 ? y1 - y2 : m1 - m2;
  });

  return {
    totalCreated: contracts.length,
    activeCount,
    expiredCount,
    cancelledCount,
    trend,
  };
};

export const getRoomStatistics = async ({ buildingId }) => {
  const rooms = await prisma.room.findMany({
    where: buildingId ? { buildingId } : undefined,
    include: {
      building: true,
    },
  });

  let total = rooms.length;
  let available = 0;
  let rented = 0;
  let maintenance = 0;
  const buildingsMap = {};

  for (const room of rooms) {
    if (room.status === ROOM_STATUS.AVAILABLE) available++;
    else if (room.status === ROOM_STATUS.RENTED) rented++;
    else if (room.status === ROOM_STATUS.MAINTENANCE) maintenance++;

    const bId = room.buildingId;
    const bName = room.building.name;
    if (!buildingsMap[bId]) {
      buildingsMap[bId] = {
        buildingId: bId,
        buildingName: bName,
        total: 0,
        available: 0,
        rented: 0,
        maintenance: 0,
      };
    }
    buildingsMap[bId].total++;
    if (room.status === ROOM_STATUS.AVAILABLE) buildingsMap[bId].available++;
    else if (room.status === ROOM_STATUS.RENTED) buildingsMap[bId].rented++;
    else if (room.status === ROOM_STATUS.MAINTENANCE) buildingsMap[bId].maintenance++;
  }

  const occupancyRate = total > 0 ? Number(((rented / total) * 100).toFixed(2)) : 0;

  const byBuilding = Object.values(buildingsMap).map((b) => ({
    ...b,
    occupancyRate: b.total > 0 ? Number(((b.rented / b.total) * 100).toFixed(2)) : 0,
  }));

  return {
    total,
    available,
    rented,
    maintenance,
    occupancyRate,
    byBuilding,
  };
};
