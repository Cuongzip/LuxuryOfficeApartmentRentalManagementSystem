import prisma from "../config/database.js";
import { AppError, generateId, deletePhysicalImages, prepareImagesData } from "../utils/index.js";
import { ID_PREFIXES } from "../constants/index.js";

export const getBuildings = async ({ keyword, provinceId, wardId, page = 1, limit = 10 }) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const isValidParam = (val) => val && val !== "undefined" && val !== "null" && val.trim() !== "";

  const where = {};
  if (isValidParam(keyword)) {
    const trimmedKeyword = keyword.trim();
    where.OR = [
      { id: { contains: trimmedKeyword } },
      { name: { contains: trimmedKeyword } },
      {
        address: {
          OR: [
            { detailAddress: { contains: trimmedKeyword } },
            { ward: { name: { contains: trimmedKeyword } } },
            { ward: { province: { name: { contains: trimmedKeyword } } } },
          ],
        },
      },
    ];
  }

  if (isValidParam(provinceId) || isValidParam(wardId)) {
    where.address = {};
    if (isValidParam(wardId)) {
      where.address.wardId = wardId;
    }
    if (isValidParam(provinceId)) {
      where.address.ward = {
        provinceId: provinceId,
      };
    }
  }

  const [buildings, total] = await Promise.all([
    prisma.building.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { id: "asc" },
      include: {
        address: {
          include: {
            ward: {
              include: {
                province: true,
              },
            },
          },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
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
    include: {
      address: {
        include: {
          ward: {
            include: {
              province: true,
            },
          },
        },
      },
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!building) {
    throw new AppError("Tòa nhà không tồn tại", 404);
  }

  return building;
};

export const createBuilding = async ({
  name,
  wardId,
  detailAddress,
  numberOfFloors,
  description,
  images,
}) => {
  const ward = await prisma.ward.findUnique({ where: { id: wardId } });
  if (!ward) {
    throw new AppError("Thông tin tòa nhà không hợp lệ", 400, {
      wardId: "Phường/xã không tồn tại!",
    });
  }

  const [existingName, existingBuildingWithAddress] = await Promise.all([
    prisma.building.findFirst({ where: { name } }),
    prisma.building.findFirst({
      where: {
        address: {
          wardId,
          detailAddress,
        },
      },
    }),
  ]);

  const errors = {};
  if (existingName) {
    errors.name = "Tên tòa nhà đã tồn tại!";
  }
  if (existingBuildingWithAddress) {
    errors.detailAddress = "Địa chỉ này đã được đăng ký cho tòa nhà khác!";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Thông tin tòa nhà không hợp lệ", 400, errors);
  }

  const id = generateId(ID_PREFIXES.BUILDING);
  const addressId = generateId(ID_PREFIXES.ADDRESS);

  const newBuilding = await prisma.building.create({
    data: {
      id,
      name,
      numberOfFloors,
      description: description || null,
      address: {
        create: {
          id: addressId,
          detailAddress,
          wardId,
        },
      },
      images: images && images.length > 0 ? {
        create: prepareImagesData(images),
      } : undefined,
    },
    include: {
      address: {
        include: {
          ward: {
            include: {
              province: true,
            },
          },
        },
      },
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return newBuilding;
};

export const updateBuilding = async (
  id,
  { name, wardId, detailAddress, numberOfFloors, description, images }
) => {
  const building = await prisma.building.findUnique({
    where: { id },
    include: { images: true, address: true },
  });

  if (!building) {
    throw new AppError("Tòa nhà không tồn tại", 404);
  }

  if (wardId !== undefined) {
    const ward = await prisma.ward.findUnique({ where: { id: wardId } });
    if (!ward) {
      throw new AppError("Thông tin chỉnh sửa không hợp lệ", 400, {
        wardId: "Phường/xã không tồn tại!",
      });
    }
  }

  const [existingName, existingBuildingWithAddress] = await Promise.all([
    name !== undefined ? prisma.building.findFirst({ where: { name } }) : null,
    (wardId !== undefined || detailAddress !== undefined)
      ? prisma.building.findFirst({
        where: {
          address: {
            wardId: wardId !== undefined ? wardId : building.address.wardId,
            detailAddress: detailAddress !== undefined ? detailAddress : building.address.detailAddress,
          },
        },
      })
      : null,
  ]);

  const errors = {};
  if (existingName && existingName.id !== id) {
    errors.name = "Tên tòa nhà đã tồn tại!";
  }
  if (existingBuildingWithAddress && existingBuildingWithAddress.id !== id) {
    errors.detailAddress = "Địa chỉ này đã được đăng ký cho tòa nhà khác!";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Thông tin chỉnh sửa không hợp lệ", 400, errors);
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (numberOfFloors !== undefined) data.numberOfFloors = numberOfFloors;
  if (description !== undefined) data.description = description;

  if (wardId !== undefined || detailAddress !== undefined) {
    data.address = {
      update: {
        wardId: wardId !== undefined ? wardId : undefined,
        detailAddress: detailAddress !== undefined ? detailAddress : undefined,
      },
    };
  }

  let filesToDelete = [];

  if (images !== undefined) {
    const existingPaths = building.images.map(img => img.imagePath);
    const newPaths = images.map(img => typeof img === "string" ? img : img.imagePath);
    filesToDelete = existingPaths.filter(p => !newPaths.includes(p));

    data.images = {
      deleteMany: {},
      create: prepareImagesData(images),
    };
  }

  const updatedBuilding = await prisma.building.update({
    where: { id },
    data,
    include: {
      address: {
        include: {
          ward: {
            include: {
              province: true,
            },
          },
        },
      },
      images: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  deletePhysicalImages(filesToDelete);

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

  const addressId = building.addressId;

  await prisma.building.delete({
    where: { id },
  });

  if (addressId) {
    try {
      await prisma.address.delete({
        where: { id: addressId },
      });
    } catch (err) {}
  }
};
