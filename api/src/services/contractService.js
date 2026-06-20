import prisma from "../config/database.js";
import { AppError, generateId } from "../utils/index.js";
import { CONTRACT_STATUS, ROOM_STATUS, PAYMENT_STATUS, ID_PREFIXES } from "../constants/index.js";

export const getContracts = async ({ customerId, roomId, employeeId, status, page = 1, limit = 10 }) => {
  const where = {};
  if (customerId) {
    where.customerId = customerId;
  }
  if (roomId) {
    where.contractDetails = {
      some: {
        roomId: roomId,
      },
    };
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
        contractDetails: {
          include: {
            room: {
              include: {
                building: true,
              },
            },
          },
        },
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
      contractDetails: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
        },
      },
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
  customerId,
  employeeId,
  roomIds,
  startDate,
  endDate,
  deposit,
}) => {
  let id = generateId(ID_PREFIXES.CONTRACT);
  let existingContract = await prisma.contract.findUnique({
    where: { id },
  });

  while (existingContract) {
    id = generateId(ID_PREFIXES.CONTRACT);
    existingContract = await prisma.contract.findUnique({
      where: { id },
    });
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

  const rooms = await prisma.room.findMany({
    where: { id: { in: roomIds } },
  });

  if (rooms.length !== roomIds.length) {
    throw new AppError("Một hoặc nhiều phòng không tồn tại", 404);
  }

  const unavailableRooms = rooms.filter((r) => r.status !== ROOM_STATUS.AVAILABLE);
  if (unavailableRooms.length > 0) {
    const numbers = unavailableRooms.map((r) => r.roomNumber).join(", ");
    throw new AppError(`Phòng [${numbers}] hiện không ở trạng thái sẵn sàng để cho thuê!`, 400);
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new AppError("Ngày kết thúc phải sau ngày bắt đầu", 400);
  }

  const activeContract = await prisma.contractDetail.findFirst({
    where: {
      roomId: { in: roomIds },
      contract: {
        status: CONTRACT_STATUS.ACTIVE,
      },
      endDate: { gte: new Date() },
    },
    include: {
      room: true,
    },
  });

  if (activeContract) {
    throw new AppError(`Phòng [${activeContract.room.roomNumber}] hiện đang có hợp đồng thuê còn hiệu lực!`, 400);
  }

  const newContract = await prisma.$transaction(async (tx) => {
    const createdContract = await tx.contract.create({
      data: {
        id,
        customerId,
        employeeId,
        deposit: deposit || 0,
        status: CONTRACT_STATUS.ACTIVE,
        createdDate: new Date(),
        contractImage: "",
        contractDetails: {
          create: rooms.map((room) => ({
            roomId: room.id,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            agreedPrice: room.price,
          })),
        },
      },
      include: {
        contractDetails: {
          include: {
            room: {
              include: {
                building: true,
              },
            },
          },
        },
        customer: true,
        employee: true,
      },
    });

    await tx.room.updateMany({
      where: { id: { in: roomIds } },
      data: { status: ROOM_STATUS.RENTED },
    });

    return createdContract;
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

  const details = await prisma.contractDetail.findMany({
    where: { contractId: id },
  });

  if (details.length === 0) {
    throw new AppError("Chi tiết hợp đồng không tồn tại", 404);
  }

  const maxEndDate = new Date(Math.max(...details.map((d) => new Date(d.endDate).getTime())));
  if (new Date(endDate) <= maxEndDate) {
    throw new AppError("Ngày hết hạn mới phải sau ngày hết hạn hiện tại", 400);
  }

  await prisma.contractDetail.updateMany({
    where: { contractId: id },
    data: { endDate: new Date(endDate) },
  });

  const updatedContract = await prisma.contract.findUnique({
    where: { id },
    include: {
      contractDetails: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
        },
      },
      customer: true,
      employee: true,
    },
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
        paymentStatus: { not: PAYMENT_STATUS.PAID },
      },
    });

    if (hasUnpaidInvoices) {
      throw new AppError(
        "Hợp đồng này còn hóa đơn chưa thanh toán. Vui lòng thanh toán hoặc sử dụng tùy chọn force để hủy",
        400
      );
    }
  }

  const details = await prisma.contractDetail.findMany({
    where: { contractId: id },
  });

  const updatedContract = await prisma.$transaction(async (tx) => {
    const uContract = await tx.contract.update({
      where: { id },
      data: { status: CONTRACT_STATUS.CANCELLED },
      include: {
        contractDetails: {
          include: {
            room: {
              include: {
                building: true,
              },
            },
          },
        },
        customer: true,
        employee: true,
      },
    });

    if (details.length > 0) {
      const roomIds = details.map((d) => d.roomId);
      await tx.room.updateMany({
        where: { id: { in: roomIds } },
        data: { status: ROOM_STATUS.AVAILABLE },
      });
    }

    return uContract;
  });

  return updatedContract;
};
