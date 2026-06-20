import prisma from "../config/database.js";
import { AppError } from "../utils/index.js";

export const getCustomers = async ({ keyword, page = 1, limit = 10 }) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const isValidParam = (val) => val && val !== "undefined" && val !== "null" && val.trim() !== "";

  const where = {};
  if (isValidParam(keyword)) {
    const trimmedKeyword = keyword.trim();
    where.OR = [
      { id: { contains: trimmedKeyword } },
      { fullName: { contains: trimmedKeyword } },
      { phoneNumber: { contains: trimmedKeyword } },
      { nationalId: { contains: trimmedKeyword } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
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
        account: {
          select: {
            id: true,
            email: true,
            status: true,
            roleId: true,
          },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

export const getCustomerById = async (id) => {
  const customer = await prisma.customer.findUnique({
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
      account: {
        select: {
          id: true,
          email: true,
          status: true,
          roleId: true,
        },
      },
    },
  });

  if (!customer) {
    throw new AppError("Khách hàng không tồn tại", 404);
  }

  return customer;
};
