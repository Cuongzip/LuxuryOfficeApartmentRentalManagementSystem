import prisma from "../config/database.js";
import { AppError, generateId, deletePhysicalImages } from "../utils/index.js";
import { ID_PREFIXES, CONTRACT_STATUS } from "../constants/index.js";

export const getResidents = async ({
  search,
  roomId,
  contractId,
  residencyStatus,
  residencyType,
  page = 1,
  limit = 10,
}) => {
  const where = {
    deletedAt: null, // Filter out soft-deleted residents
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

  if (isValidParam(residencyStatus)) {
    where.residencyStatus = residencyStatus;
  }

  if (isValidParam(residencyType)) {
    where.residencyType = residencyType;
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [residents, total] = await Promise.all([
    prisma.resident.findMany({
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
    prisma.resident.count({ where }),
  ]);

  return {
    data: residents,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getResidentById = async (id) => {
  const resident = await prisma.resident.findFirst({
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

  if (!resident) {
    throw new AppError("Người sử dụng không tồn tại hoặc đã bị xóa", 404);
  }

  return resident;
};

export const createResident = async (data, imageFile) => {
  // 1. Verify nationalId uniqueness among active residents
  const existingId = await prisma.resident.findFirst({
    where: { nationalId: data.nationalId, deletedAt: null },
  });
  if (existingId) {
    throw new AppError("Số CCCD đã tồn tại trong hệ thống", 400, {
      nationalId: "Số CCCD đã tồn tại trong hệ thống",
    });
  }

  // 2. Verify phoneNumber uniqueness among active residents
  const existingPhone = await prisma.resident.findFirst({
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

  const id = generateId(ID_PREFIXES.RESIDENT);

  const resident = await prisma.resident.create({
    data: {
      id,
      fullName: data.fullName,
      nationalId: data.nationalId,
      phoneNumber: data.phoneNumber,
      image: imageFile ? `/static/uploads/${imageFile.filename}` : null,
      residencyType: data.residencyType || "Cu dan",
      residencyStatus: data.residencyStatus || "Tam tru",
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

  return resident;
};

export const updateResident = async (id, data, imageFile) => {
  const resident = await prisma.resident.findFirst({
    where: { id, deletedAt: null },
  });
  if (!resident) {
    throw new AppError("Người sử dụng không tồn tại hoặc đã bị xóa", 404);
  }

  // 1. Verify nationalId uniqueness if changed
  if (data.nationalId && data.nationalId !== resident.nationalId) {
    const existingId = await prisma.resident.findFirst({
      where: { nationalId: data.nationalId, deletedAt: null },
    });
    if (existingId) {
      throw new AppError("Số CCCD đã tồn tại trong hệ thống", 400, {
        nationalId: "Số CCCD đã tồn tại trong hệ thống",
      });
    }
  }

  // 2. Verify phoneNumber uniqueness if changed
  if (data.phoneNumber && data.phoneNumber !== resident.phoneNumber) {
    const existingPhone = await prisma.resident.findFirst({
      where: { phoneNumber: data.phoneNumber, deletedAt: null },
    });
    if (existingPhone) {
      throw new AppError("Số điện thoại đã tồn tại trong hệ thống", 400, {
        phoneNumber: "Số điện thoại đã tồn tại trong hệ thống",
      });
    }
  }

  // 3. Verify contract and room combination if changed
  const newContractId = data.contractId || resident.contractId;
  const newRoomId = data.roomId || resident.roomId;

  if (newContractId !== resident.contractId || newRoomId !== resident.roomId) {
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
  let imagePath = resident.image;
  if (imageFile) {
    if (resident.image) {
      deletePhysicalImages([resident.image]);
    }
    imagePath = `/static/uploads/${imageFile.filename}`;
  }

  const updatedResident = await prisma.resident.update({
    where: { id },
    data: {
      fullName: data.fullName,
      nationalId: data.nationalId,
      phoneNumber: data.phoneNumber,
      image: imagePath,
      residencyType: data.residencyType,
      residencyStatus: data.residencyStatus,
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

  return updatedResident;
};

export const deleteResident = async (id) => {
  const resident = await prisma.resident.findFirst({
    where: { id, deletedAt: null },
  });
  if (!resident) {
    throw new AppError("Người sử dụng không tồn tại hoặc đã bị xóa", 404);
  }

  // Soft delete setting the deletedAt timestamp
  await prisma.resident.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { message: "Xóa người sử dụng thành công" };
};
