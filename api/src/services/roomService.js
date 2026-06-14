import prisma from "../config/database.js";
import { AppError, generateId } from "../utils/index.js";
import { ROOM_STATUS, CONTRACT_STATUS, ID_PREFIXES } from "../constants/index.js";

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
      include: {
        building: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
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
    include: {
      building: true,
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  return room;
};

export const createRoom = async ({
  buildingId,
  roomNumber,
  floor,
  type,
  area,
  price,
  status,
  description,
  images,
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

  const existingRoom = await prisma.room.findFirst({
    where: {
      buildingId,
      roomNumber,
      deletedAt: null,
    },
  });

  if (existingRoom) {
    throw new AppError("Số phòng này đã tồn tại trong tòa nhà!", 400);
  }

  const id = generateId(ID_PREFIXES.ROOM);

  const newRoom = await prisma.room.create({
    data: {
      id,
      roomNumber,
      buildingId,
      floor,
      type,
      area,
      price,
      status,
      description: description || null,
      maxPeople: maxPeople !== undefined ? maxPeople : 2,
      images: images && images.length > 0 ? {
        create: images.map((img, index) => {
          const imgObj = typeof img === "string" ? { imagePath: img } : img;
          return {
            id: generateId(ID_PREFIXES.IMAGE),
            imagePath: imgObj.imagePath,
            displayOrder: imgObj.displayOrder !== undefined ? imgObj.displayOrder : index + 1,
            isPrimary: imgObj.isPrimary !== undefined ? imgObj.isPrimary : index === 0,
          };
        }),
      } : undefined,
    },
    include: {
      building: true,
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return newRoom;
};

export const updateRoom = async (
  id,
  { buildingId, roomNumber, floor, type, area, price, status, description, images, maxPeople, confirmPriceChange }
) => {
  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    throw new AppError("Phòng không tồn tại", 404);
  }

  const data = {};

  if (roomNumber !== undefined) {
    const targetBuildingId = buildingId !== undefined ? buildingId : room.buildingId;
    const existingRoom = await prisma.room.findFirst({
      where: {
        buildingId: targetBuildingId,
        roomNumber,
        id: { not: id },
        deletedAt: null,
      },
    });
    if (existingRoom) {
      throw new AppError("Số phòng này đã tồn tại trong tòa nhà!", 400);
    }
    data.roomNumber = roomNumber;
  }

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
  if (maxPeople !== undefined) data.maxPeople = maxPeople;

  if (images !== undefined) {
    data.images = {
      deleteMany: {},
      create: images ? images.map((img, index) => {
        const imgObj = typeof img === "string" ? { imagePath: img } : img;
        return {
          id: generateId(ID_PREFIXES.IMAGE),
          imagePath: imgObj.imagePath,
          displayOrder: imgObj.displayOrder !== undefined ? imgObj.displayOrder : index + 1,
          isPrimary: imgObj.isPrimary !== undefined ? imgObj.isPrimary : index === 0,
        };
      }) : [],
    };
  }

  if (price !== undefined) {
    if (Number(price) !== Number(room.price)) {
      const activeContract = await prisma.contractDetail.findFirst({
        where: {
          roomId: id,
          contract: {
            status: CONTRACT_STATUS.ACTIVE,
          },
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
    include: {
      building: true,
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
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

  const hasContract = await prisma.contractDetail.findFirst({
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
    const activeContract = await prisma.contractDetail.findFirst({
      where: {
        roomId: id,
        contract: {
          status: CONTRACT_STATUS.ACTIVE,
        },
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
