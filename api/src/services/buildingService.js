import prisma from "../config/database.js";
import { AppError, generateId } from "../utils/index.js";
import { ID_PREFIXES } from "../constants/index.js";

export const getBuildings = async ({ keyword, page = 1, limit = 10 }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (keyword) {
    const trimmedKeyword = keyword.trim();
    where.OR = [
      { id: { contains: trimmedKeyword } },
      { name: { contains: trimmedKeyword } },
      { address: { contains: trimmedKeyword } },
    ];
  }

  const [buildings, total] = await Promise.all([
    prisma.building.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { id: "asc" },
    }),
    prisma.building.count({ where }),
  ]);

  return {
    buildings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getBuildingById = async (id) => {
  const building = await prisma.building.findUnique({
    where: { id },
  });

  if (!building) {
    throw new AppError("Tòa nhà không tồn tại", 404);
  }

  return building;
};

export const createBuilding = async ({
  name,
  address,
  numberOfFloors,
  description,
  image,
}) => {
  const [existingName, existingAddress] = await Promise.all([
    prisma.building.findFirst({ where: { name } }),
    prisma.building.findFirst({ where: { address } }),
  ]);

  const errors = {};
  if (existingName) {
    errors.name = "Tên tòa nhà đã tồn tại!";
  }
  if (existingAddress) {
    errors.address = "Địa chỉ này đã được đăng ký cho tòa nhà khác!";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Thông tin tòa nhà không hợp lệ", 400, errors);
  }

  const id = generateId(ID_PREFIXES.BUILDING);

  const newBuilding = await prisma.building.create({
    data: {
      id,
      name,
      address,
      numberOfFloors,
      description: description || null,
      image: image || null,
    },
  });

  return newBuilding;
};

export const updateBuilding = async (
  id,
  { name, address, numberOfFloors, description, image }
) => {
  const building = await prisma.building.findUnique({
    where: { id },
  });

  if (!building) {
    throw new AppError("Tòa nhà không tồn tại", 404);
  }

  const [existingName, existingAddress] = await Promise.all([
    prisma.building.findFirst({ where: { name } }),
    prisma.building.findFirst({ where: { address } }),
  ]);

  const errors = {};
  if (existingName && existingName.id !== id) {
    errors.name = "Tên tòa nhà đã tồn tại!";
  }
  if (existingAddress && existingAddress.id !== id) {
    errors.address = "Địa chỉ này đã được đăng ký cho tòa nhà khác!";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Thông tin chỉnh sửa không hợp lệ", 400, errors);
  }

  const updatedBuilding = await prisma.building.update({
    where: { id },
    data: {
      name,
      address,
      numberOfFloors,
      description: description !== undefined ? description : building.description,
      image: image !== undefined ? image : building.image,
    },
  });

  return updatedBuilding;
};

export const deleteBuilding = async (id) => {
  const building = await prisma.building.findUnique({
    where: { id },
  });

  if (!building) {
    throw new AppError("Tòa nhà không tồn tại", 404);
  }

  const roomCount = await prisma.room.count({
    where: { buildingId: id },
  });

  if (roomCount > 0) {
    throw new AppError(
      "Không thể xóa tòa nhà này vì hiện vẫn còn phòng thuộc tòa nhà trong hệ thống!",
      400
    );
  }

  await prisma.building.delete({
    where: { id },
  });
};
