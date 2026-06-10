import prisma from "../config/database.js";
import { AppError } from "../utils/index.js";
import { CONTRACT_STATUS } from "../constants/index.js";

export const getContracts = async ({ customerId, roomId, employeeId, status, page = 1, limit = 10 }) => {
  const where = {};
  if (customerId) {
    where.customerId = customerId;
  }
  if (roomId) {
    where.roomId = roomId;
  }
  if (employeeId) {
    where.employeeId = employeeId;
  }
  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      skip,
      take: limit,
      include: {
        room: { include: { building: true } },
        customer: true,
        employee: true,
      },
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    data: contracts,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getContractById = async (id) => {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      room: { include: { building: true } },
      customer: true,
      employee: true,
    },
  });

  if (!contract) {
    throw new AppError("Hợp đồng không tồn tại", 404);
  }

  return contract;
};

export const createContract = async ({
  id,
  customerId,
  employeeId,
  roomId,
  startDate,
  endDate,
  deposit,
}) => {
  const existingContract = await prisma.contract.findUnique({
    where: { id },
  });

  if (existingContract) {
    throw new AppError("Mã hợp đồng này đã tồn tại!", 400);
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new AppError("Khách hàng không tồn tại", 404);
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new AppError("Nhân viên không tồn tại", 404);
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new AppError("Ngày kết thúc phải sau ngày bắt đầu", 400);
  }

  const activeContract = await prisma.contract.findFirst({
    where: {
      roomId,
      status: CONTRACT_STATUS.ACTIVE,
      endDate: { gte: new Date() },
    },
  });

  if (activeContract) {
    throw new AppError("Phòng này hiện đang có hợp đồng thuê còn hiệu lực!", 400);
  }

  const newContract = await prisma.contract.create({
    data: {
      id,
      customerId,
      employeeId,
      roomId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      deposit: deposit || 0,
      status: CONTRACT_STATUS.ACTIVE,
      createdDate: new Date(),
    },
  });

  await prisma.room.update({
    where: { id: roomId },
    data: { status: "Đã thuê" },
  });

  return newContract;
};

export const extendContract = async (id, { endDate }) => {
  const contract = await prisma.contract.findUnique({
    where: { id },
  });

  if (!contract) {
    throw new AppError("Hợp đồng không tồn tại", 404);
  }

  if (contract.status !== CONTRACT_STATUS.ACTIVE) {
    throw new AppError("Chỉ có thể gia hạn hợp đồng đang hiệu lực", 400);
  }

  if (new Date(endDate) <= new Date(contract.endDate)) {
    throw new AppError("Ngày hết hạn mới phải sau ngày hết hạn hiện tại", 400);
  }

  const updatedContract = await prisma.contract.update({
    where: { id },
    data: { endDate: new Date(endDate) },
  });

  return updatedContract;
};

export const cancelContract = async (id, { force = false }) => {
  const contract = await prisma.contract.findUnique({
    where: { id },
  });

  if (!contract) {
    throw new AppError("Hợp đồng không tồn tại", 404);
  }

  if (contract.status === CONTRACT_STATUS.CANCELLED) {
    throw new AppError("Hợp đồng này đã bị hủy", 400);
  }

  if (contract.status === CONTRACT_STATUS.EXPIRED) {
    throw new AppError("Hợp đồng này đã hết hạn", 400);
  }

  if (!force) {
    const hasUnpaidInvoices = await prisma.invoice.findFirst({
      where: {
        contractId: id,
        paymentStatus: { not: "Đã thanh toán" },
      },
    });

    if (hasUnpaidInvoices) {
      throw new AppError(
        "Hợp đồng này còn hóa đơn chưa thanh toán. Vui lòng thanh toán hoặc sử dụng tùy chọn force để hủy",
        400
      );
    }
  }

  const updatedContract = await prisma.contract.update({
    where: { id },
    data: { status: CONTRACT_STATUS.CANCELLED },
  });

  if (contract.roomId) {
    await prisma.room.update({
      where: { id: contract.roomId },
      data: { status: "Còn trống" },
    });
  }

  return updatedContract;
};
