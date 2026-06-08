import prisma from "../config/database.js";
import { AppError } from "../utils/index.js";
import { ROOM_STATUS } from "../constants/index.js";

export const getRooms = async ({ buildingId, floor, status, page = 1, limit = 10 }) => {
  const where = {};
  if (buildingId) {
    where.buildingId = buildingId;
  }
  if (floor) {
    where.floor = parseInt(floor, 10);
  }
  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      include: { building: true },
    }),
    prisma.room.count({ where }),
  ]);

  return {
    data: rooms,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getRoomById = async (id) => {
  const room = await prisma.room.findUnique({
    where: { id },
    include: { building: true },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  return room;
};

export const createRoom = async ({
  id,
  buildingId,
  floor,
  type,
  area,
  price,
  status,
  description,
  image,
  maxPeople,
}) => {
  const building = await prisma.building.findUnique({
    where: { id: buildingId },
  });

  if (!building) {
    throw new AppError("Tòa nhà không tồn tại", 404);
  }

  if (floor > building.numberOfFloors) {
    throw new AppError(
      `Tầng vượt quá giới hạn của tòa nhà (tối đa ${building.numberOfFloors} tầng)`,
      400
    );
  }

  const existingRoom = await prisma.room.findUnique({
    where: { id },
  });

  if (existingRoom) {
    throw new AppError("Mã phòng này đã tồn tại trong tòa nhà!", 400);
  }

  const newRoom = await prisma.room.create({
    data: {
      id,
      buildingId,
      floor,
      type,
      area,
      price,
      status,
      description: description || null,
      image: image || null,
      maxPeople: maxPeople !== undefined ? maxPeople : 2,
    },
  });

  return newRoom;
};

export const updateRoom = async (
  id,
  { buildingId, floor, type, area, price, status, description, image, maxPeople, confirmPriceChange }
) => {
  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  const data = {};

  if (buildingId !== undefined) {
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
    });
    if (!building) {
      throw new AppError("Tòa nhà không tồn tại", 404);
    }
    data.buildingId = buildingId;

    const currentFloor = floor !== undefined ? floor : room.floor;
    if (currentFloor > building.numberOfFloors) {
      throw new AppError(
        `Tầng vượt quá giới hạn của tòa nhà mới (tối đa ${building.numberOfFloors} tầng)`,
        400
      );
    }
  }

  if (floor !== undefined) {
    const targetBuildingId = buildingId !== undefined ? buildingId : room.buildingId;
    const building = await prisma.building.findUnique({
      where: { id: targetBuildingId },
    });
    if (floor > building.numberOfFloors) {
      throw new AppError(
        `Tầng vượt quá giới hạn của tòa nhà (tối đa ${building.numberOfFloors} tầng)`,
        400
      );
    }
    data.floor = floor;
  }

  if (type !== undefined) data.type = type;
  if (area !== undefined) data.area = area;
  if (status !== undefined) data.status = status;
  if (description !== undefined) data.description = description;
  if (image !== undefined) data.image = image;
  if (maxPeople !== undefined) data.maxPeople = maxPeople;

  if (price !== undefined) {
    if (Number(price) !== Number(room.price)) {
      const activeContract = await prisma.contract.findFirst({
        where: {
          roomId: id,
          status: "Đang hiệu lực",
          endDate: { gte: new Date() },
        },
      });
      if (activeContract && !confirmPriceChange) {
        throw new AppError(
          "Phòng này hiện đang có hợp đồng thuê hoạt động. Việc sửa đổi giá chỉ áp dụng cho hợp đồng tương lai. Bạn có muốn tiếp tục?",
          409
        );
      }
      data.price = price;
    }
  }

  const updatedRoom = await prisma.room.update({
    where: { id },
    data,
  });

  return updatedRoom;
};

export const deleteRoom = async (id) => {
  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  const hasContract = await prisma.contract.findFirst({
    where: { roomId: id },
  });

  if (hasContract) {
    throw new AppError(
      "Không thể xóa phòng này vì đã từng phát sinh hợp đồng thuê trong hệ thống!",
      400
    );
  }

  await prisma.room.delete({
    where: { id },
  });
};

export const updateRoomStatus = async (id, status) => {
  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  if (status === ROOM_STATUS.AVAILABLE) {
    const activeContract = await prisma.contract.findFirst({
      where: {
        roomId: id,
        status: "Đang hiệu lực",
        endDate: { gte: new Date() },
      },
    });

    if (activeContract) {
      throw new AppError(
        "Không thể cập nhật trạng thái vì phòng này hiện đang có hợp đồng thuê còn hiệu lực!",
        400
      );
    }
  }

  const updatedRoom = await prisma.room.update({
    where: { id },
    data: { status },
  });

  return updatedRoom;
};
