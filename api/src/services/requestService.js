import prisma from "../config/database.js";
import { AppError, generateId } from "../utils/index.js";
import { ROOM_STATUS, REQUEST_STATUS, REQUEST_TYPES, ID_PREFIXES } from "../constants/index.js";

export const createRequest = async ({ customerId, roomId, appointmentDate, content }) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  // Case-insensitive status check
  if (!room.status || room.status.toLowerCase() !== ROOM_STATUS.AVAILABLE.toLowerCase()) {
    throw new AppError("Phòng này không còn ở trạng thái Còn trống. Vui lòng chọn phòng trống khác!", 400);
  }

  const apptDate = new Date(appointmentDate);
  const now = new Date();

  if (apptDate < now) {
    throw new AppError("Ngày hẹn không được là ngày trong quá khứ!", 400);
  }

  // Validate working hours in Asia/Ho_Chi_Minh timezone
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
      customer: true,
    },
  });

  return newRequest;
};
