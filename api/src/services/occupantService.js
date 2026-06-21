import prisma from "../config/database.js";
import { AppError, generateId, deletePhysicalImages } from "../utils/index.js";
import { ID_PREFIXES, CONTRACT_STATUS } from "../constants/index.js";

export const getOccupants = async ({
  search,
  roomId,
  contractId,
  occupancyStatus,
  occupancyType,
  page = 1,
  limit = 10,
}) => {
  const where = {
    deletedAt: null, // Filter out soft-deleted occupants
  };

  const isValidParam = (val) =>
    val !== undefined &&
    val !== null &&
    String(val) !== "undefined" &&
    String(val) !== "null" &&
    String(val).trim() !== "";

  if (isValidParam(search)) {
    const trimmed = search.trim();
    where.OR = [
      { fullName: { contains: trimmed } },
      { phoneNumber: { contains: trimmed } },
      { nationalId: { contains: trimmed } },
    ];
  }

  if (isValidParam(roomId)) {
    where.roomId = roomId;
  }

  if (isValidParam(contractId)) {
    where.contractId = contractId;
  }

  if (isValidParam(occupancyStatus)) {
    where.occupancyStatus = occupancyStatus;
  }

  if (isValidParam(occupancyType)) {
    where.occupancyType = occupancyType;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [occupants, total] = await Promise.all([
    prisma.occupant.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        contractDetail: {
          include: {
            room: {
              include: {
                building: true,
              },
            },
            contract: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    }),
    prisma.occupant.count({ where }),
  ]);

  return {
    data: occupants,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getOccupantById = async (id) => {
  const occupant = await prisma.occupant.findFirst({
    where: { id, deletedAt: null },
    include: {
      contractDetail: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
          contract: {
            include: {
              customer: true,
            },
          },
        },
      },
    },
  });

  if (!occupant) {
    throw new AppError("Người sử dụng không tồn tại hoặc đã bị xóa", 404);
  }

  return occupant;
};

export const createOccupant = async (data, imageFile) => {
  // 1. Verify nationalId uniqueness among active occupants
  const existingId = await prisma.occupant.findFirst({
    where: { nationalId: data.nationalId, deletedAt: null },
  });
  if (existingId) {
    throw new AppError("Số CCCD đã tồn tại trong hệ thống", 400, {
      nationalId: "Số CCCD đã tồn tại trong hệ thống",
    });
  }

  // 2. Verify phoneNumber uniqueness among active occupants
  const existingPhone = await prisma.occupant.findFirst({
    where: { phoneNumber: data.phoneNumber, deletedAt: null },
  });
  if (existingPhone) {
    throw new AppError("Số điện thoại đã tồn tại trong hệ thống", 400, {
      phoneNumber: "Số điện thoại đã tồn tại trong hệ thống",
    });
  }

  // 3. Verify contract and room combination exist in ContractDetail
  const contractDetail = await prisma.contractDetail.findUnique({
    where: {
      contractId_roomId: {
        contractId: data.contractId,
        roomId: data.roomId,
      },
    },
    include: {
      contract: true,
    },
  });
  if (!contractDetail) {
    throw new AppError(
      "Phòng và Hợp đồng không hợp lệ hoặc không liên kết với nhau",
      400,
      {
        contractId: "Hợp đồng không hợp lệ",
        roomId: "Phòng không hợp lệ",
      }
    );
  }

  // 4. Verify contract is active
  if (contractDetail.contract.status !== CONTRACT_STATUS.ACTIVE) {
    throw new AppError("Hợp đồng thuê này đã hết hạn hoặc đã bị hủy", 400, {
      contractId: "Hợp đồng thuê không còn hiệu lực",
    });
  }

  const id = generateId(ID_PREFIXES.OCCUPANT);

  const occupant = await prisma.occupant.create({
    data: {
      id,
      fullName: data.fullName,
      nationalId: data.nationalId,
      phoneNumber: data.phoneNumber,
      image: imageFile ? `/static/uploads/${imageFile.filename}` : null,
      occupancyType: data.occupancyType || "Cư dân",
      occupancyStatus: data.occupancyStatus || "Tạm trú",
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      contractId: data.contractId,
      roomId: data.roomId,
    },
    include: {
      contractDetail: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
          contract: {
            include: {
              customer: true,
            },
          },
        },
      },
    },
  });

  return occupant;
};

export const updateOccupant = async (id, data, imageFile) => {
  const occupant = await prisma.occupant.findFirst({
    where: { id, deletedAt: null },
  });
  if (!occupant) {
    throw new AppError("Người sử dụng không tồn tại hoặc đã bị xóa", 404);
  }

  // 1. Verify nationalId uniqueness if changed
  if (data.nationalId && data.nationalId !== occupant.nationalId) {
    const existingId = await prisma.occupant.findFirst({
      where: { nationalId: data.nationalId, deletedAt: null },
    });
    if (existingId) {
      throw new AppError("Số CCCD đã tồn tại trong hệ thống", 400, {
        nationalId: "Số CCCD đã tồn tại trong hệ thống",
      });
    }
  }

  // 2. Verify phoneNumber uniqueness if changed
  if (data.phoneNumber && data.phoneNumber !== occupant.phoneNumber) {
    const existingPhone = await prisma.occupant.findFirst({
      where: { phoneNumber: data.phoneNumber, deletedAt: null },
    });
    if (existingPhone) {
      throw new AppError("Số điện thoại đã tồn tại trong hệ thống", 400, {
        phoneNumber: "Số điện thoại đã tồn tại trong hệ thống",
      });
    }
  }

  // 3. Verify contract and room combination if changed
  const newContractId = data.contractId || occupant.contractId;
  const newRoomId = data.roomId || occupant.roomId;

  if (newContractId !== occupant.contractId || newRoomId !== occupant.roomId) {
    const contractDetail = await prisma.contractDetail.findUnique({
      where: {
        contractId_roomId: {
          contractId: newContractId,
          roomId: newRoomId,
        },
      },
      include: {
        contract: true,
      },
    });
    if (!contractDetail) {
      throw new AppError(
        "Phòng và Hợp đồng không hợp lệ hoặc không liên kết với nhau",
        400,
        {
          contractId: "Hợp đồng không hợp lệ",
          roomId: "Phòng không hợp lệ",
        }
      );
    }
    if (contractDetail.contract.status !== CONTRACT_STATUS.ACTIVE) {
      throw new AppError("Hợp đồng thuê này đã hết hạn hoặc đã bị hủy", 400, {
        contractId: "Hợp đồng thuê không còn hiệu lực",
      });
    }
  }

  // 4. Handle image upload
  let imagePath = occupant.image;
  if (imageFile) {
    if (occupant.image) {
      deletePhysicalImages([occupant.image]);
    }
    imagePath = `/static/uploads/${imageFile.filename}`;
  }

  const updatedOccupant = await prisma.occupant.update({
    where: { id },
    data: {
      fullName: data.fullName,
      nationalId: data.nationalId,
      phoneNumber: data.phoneNumber,
      image: imagePath,
      occupancyType: data.occupancyType,
      occupancyStatus: data.occupancyStatus,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      contractId: newContractId,
      roomId: newRoomId,
    },
    include: {
      contractDetail: {
        include: {
          room: {
            include: {
              building: true,
            },
          },
          contract: {
            include: {
              customer: true,
            },
          },
        },
      },
    },
  });

  return updatedOccupant;
};

export const deleteOccupant = async (id) => {
  const occupant = await prisma.occupant.findFirst({
    where: { id, deletedAt: null },
  });
  if (!occupant) {
    throw new AppError("Người sử dụng không tồn tại hoặc đã bị xóa", 404);
  }

  // Soft delete setting the deletedAt timestamp
  await prisma.occupant.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { message: "Xóa người sử dụng thành công" };
};
