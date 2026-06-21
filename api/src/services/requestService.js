import prisma from "../config/database.js";
import { AppError, generateId } from "../utils/index.js";
import { ROOM_STATUS, REQUEST_STATUS, REQUEST_TYPES, ID_PREFIXES, ROLES } from "../constants/index.js";

export const createRequest = async ({ customerId, roomId, appointmentDate, content }) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  if (!room.status || room.status.toLowerCase() !== ROOM_STATUS.AVAILABLE.toLowerCase()) {
    throw new AppError("Phòng này không còn ở trạng thái Còn trống. Vui lòng chọn phòng trống khác!", 400);
  }

  const apptDate = new Date(appointmentDate);
  const now = new Date();

  if (apptDate < now) {
    throw new AppError("Ngày hẹn không được là ngày trong quá khứ!", 400);
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
    hour: "numeric",
    minute: "numeric",
  });
  
  const parts = formatter.formatToParts(apptDate);
  const hourPart = parts.find((p) => p.type === "hour");
  const minutePart = parts.find((p) => p.type === "minute");
  const localHours = parseInt(hourPart.value, 10);
  const localMinutes = parseInt(minutePart.value, 10);

  if (localHours < 8 || localHours > 18 || (localHours === 18 && localMinutes > 0)) {
    throw new AppError("Giờ hẹn phải nằm trong khoảng giờ làm việc (08:00 - 18:00)!", 400);
  }

  const newRequest = await prisma.request.create({
    data: {
      id: generateId(ID_PREFIXES.REQUEST),
      roomId,
      customerId,
      status: REQUEST_STATUS.PENDING,
      requestType: REQUEST_TYPES.VIEW_ROOM,
      appointmentDate: apptDate,
      content: content || null,
    },
    include: {
      room: {
        include: {
          building: true,
        },
      },
      customer: {
        include: {
          account: true,
        },
      },
    },
  });

  return newRequest;
};

export const getRequests = async ({
  status,
  requestType,
  roomId,
  customerId,
  employeeId,
  page = 1,
  limit = 10,
}) => {
  const where = {};
  const isValidParam = (val) =>
    val !== undefined &&
    val !== null &&
    String(val) !== "undefined" &&
    String(val) !== "null" &&
    String(val).trim() !== "";

  if (isValidParam(status)) {
    where.status = status;
  }
  if (isValidParam(requestType)) {
    where.requestType = requestType;
  }
  if (isValidParam(roomId)) {
    where.roomId = roomId;
  }
  if (isValidParam(customerId)) {
    where.customerId = customerId;
  }
  if (isValidParam(employeeId)) {
    where.employeeId = employeeId;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: "desc" },
      include: {
        room: {
          include: {
            building: true,
          },
        },
        customer: {
          include: {
            account: true,
          },
        },
        employee: true,
      },
    }),
    prisma.request.count({ where }),
  ]);

  return {
    data: requests,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const updateRequestStatus = async (id, { status, employeeId }, user) => {
  const request = await prisma.request.findUnique({
    where: { id },
  });

  if (!request) {
    throw new AppError("Yêu cầu không tồn tại", 404);
  }

  if (user && user.role === ROLES.CUSTOMER) {
    if (request.customerId !== user.customerId) {
      throw new AppError("Bạn không có quyền cập nhật yêu cầu này", 403);
    }
    if (status !== REQUEST_STATUS.CANCELLED) {
      throw new AppError("Khách hàng chỉ có quyền hủy yêu cầu của chính mình", 403);
    }
  }

  const updatedRequest = await prisma.request.update({
    where: { id },
    data: {
      status,
      employeeId: user?.role === ROLES.CUSTOMER ? null : employeeId,
    },
    include: {
      room: {
        include: {
          building: true,
        },
      },
      customer: {
        include: {
          account: true,
        },
      },
      employee: true,
    },
  });

  return updatedRequest;
};

