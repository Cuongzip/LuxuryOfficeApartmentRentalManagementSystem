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
  rooms: contractRooms,
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

  // Parse room lease data
  let roomsData = [];
  if (contractRooms && contractRooms.length > 0) {
    roomsData = contractRooms.map(item => ({
      roomId: item.roomId,
      agreedPrice: Number(item.agreedPrice),
      startDate: new Date(item.startDate),
      endDate: new Date(item.endDate),
    }));
  } else if (roomIds && roomIds.length > 0) {
    if (!startDate || !endDate) {
      throw new AppError("Thiếu thông tin ngày thuê", 400);
    }
    const roomsFromDb = await prisma.room.findMany({
      where: { id: { in: roomIds } },
    });
    roomsData = roomsFromDb.map(r => ({
      roomId: r.id,
      agreedPrice: Number(r.price),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    }));
  }

  if (roomsData.length === 0) {
    throw new AppError("Hợp đồng phải có ít nhất một phòng", 400);
  }

  const targetRoomIds = roomsData.map(r => r.roomId);
  const rooms = await prisma.room.findMany({
    where: { id: { in: targetRoomIds } },
  });

  if (rooms.length !== targetRoomIds.length) {
    throw new AppError("Một hoặc nhiều phòng không tồn tại", 404);
  }

  const unavailableRooms = rooms.filter((r) => r.status !== ROOM_STATUS.AVAILABLE);
  if (unavailableRooms.length > 0) {
    const numbers = unavailableRooms.map((r) => r.roomNumber).join(", ");
    throw new AppError(`Phòng [${numbers}] hiện không ở trạng thái sẵn sàng để cho thuê!`, 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check dates and overlaps for each room
  for (const item of roomsData) {
    if (isNaN(item.startDate.getTime()) || isNaN(item.endDate.getTime())) {
      throw new AppError("Ngày bắt đầu hoặc ngày kết thúc không hợp lệ", 400);
    }
    const itemStartDateOnly = new Date(item.startDate);
    itemStartDateOnly.setHours(0, 0, 0, 0);
    if (itemStartDateOnly < today) {
      const room = rooms.find(r => r.id === item.roomId);
      throw new AppError(`Ngày bắt đầu thuê của phòng ${room?.roomNumber || item.roomId} không được trước ngày hiện tại`, 400);
    }
    if (item.startDate >= item.endDate) {
      const room = rooms.find(r => r.id === item.roomId);
      throw new AppError(`Ngày kết thúc phải sau ngày bắt đầu đối với phòng ${room?.roomNumber || item.roomId}`, 400);
    }

    const activeContract = await prisma.contractDetail.findFirst({
      where: {
        roomId: item.roomId,
        contract: {
          status: CONTRACT_STATUS.ACTIVE,
        },
        startDate: { lte: item.endDate },
        endDate: { gte: item.startDate },
      },
      include: {
        room: true,
      },
    });

    if (activeContract) {
      throw new AppError(`Phòng [${activeContract.room.roomNumber}] hiện đang có hợp đồng thuê còn hiệu lực trong khoảng thời gian này!`, 400);
    }
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
          create: roomsData.map((item) => ({
            roomId: item.roomId,
            startDate: item.startDate,
            endDate: item.endDate,
            agreedPrice: item.agreedPrice,
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
      where: { id: { in: targetRoomIds } },
      data: { status: ROOM_STATUS.RENTED },
    });

    return createdContract;
  });

  return newContract;
};

export const extendContract = async (id, { endDate, rooms }) => {
  const contract = await prisma.contract.findUnique({
    where: { id },
  });

  if (!contract) {
    throw new AppError("Hợp đồng không tồn tại.", 404);
  }

  if (contract.status !== CONTRACT_STATUS.ACTIVE) {
    throw new AppError("Hợp đồng này không ở trạng thái hoạt động để có thể gia hạn.", 400);
  }

  const details = await prisma.contractDetail.findMany({
    where: { contractId: id },
  });

  if (details.length === 0) {
    throw new AppError("Chi tiết hợp đồng không tồn tại", 404);
  }

  // Parse rooms to extend
  let extensionItems = [];
  if (rooms && rooms.length > 0) {
    extensionItems = rooms.map(r => ({
      roomId: r.roomId,
      newEndDate: new Date(r.endDate),
    }));
  } else if (endDate) {
    extensionItems = details.map(d => ({
      roomId: d.roomId,
      newEndDate: new Date(endDate),
    }));
  } else {
    throw new AppError("Thiếu thông tin ngày gia hạn.", 400);
  }

  const extendedDetails = [];

  // Check and validate each extension item
  for (const item of extensionItems) {
    const detail = details.find(d => d.roomId === item.roomId);
    if (!detail) {
      throw new AppError(`Phòng [${item.roomId}] không nằm trong hợp đồng này.`, 400);
    }

    if (item.newEndDate <= detail.endDate) {
      throw new AppError(
        `Ngày gia hạn mới cho phòng ${detail.roomId} phải sau ngày hết hạn hiện tại của phòng (${formatDate(detail.endDate)}).`,
        400
      );
    }

    // Check for overlapping active contracts during the extended period
    const overlappingContract = await prisma.contractDetail.findFirst({
      where: {
        roomId: item.roomId,
        contractId: { not: id },
        contract: {
          status: CONTRACT_STATUS.ACTIVE,
        },
        startDate: { lte: item.newEndDate },
        endDate: { gte: detail.endDate },
      },
      include: {
        room: true,
      },
    });

    if (overlappingContract) {
      throw new AppError(
        `Phòng [${overlappingContract.room.roomNumber}] hiện đang có hợp đồng thuê khác còn hiệu lực trong khoảng thời gian gia hạn này!`,
        400
      );
    }

    extendedDetails.push(item);
  }

  if (extendedDetails.length === 0) {
    throw new AppError("Không có phòng nào được gia hạn.", 400);
  }

  const updatedContract = await prisma.$transaction(async (tx) => {
    // 1. Update contract detail end dates
    for (const item of extendedDetails) {
      await tx.contractDetail.update({
        where: {
          contractId_roomId: {
            contractId: id,
            roomId: item.roomId,
          },
        },
        data: { endDate: item.newEndDate },
      });

      // 2. Create a contract extension record
      let extensionId = generateId("GH");
      let existingExtension = await tx.contractExtension.findUnique({
        where: { id: extensionId },
      });

      while (existingExtension) {
        extensionId = generateId("GH");
        existingExtension = await tx.contractExtension.findUnique({
          where: { id: extensionId },
        });
      }

      await tx.contractExtension.create({
        data: {
          id: extensionId,
          contractId: id,
          roomId: item.roomId,
          newEndDate: item.newEndDate,
          createdDate: new Date(),
        },
      });
    }

    // 3. Return the updated contract
    return tx.contract.findUnique({
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
