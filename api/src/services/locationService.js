import prisma from "../config/database.js";

export const getProvinces = async () => {
  return await prisma.province.findMany({
    orderBy: { name: "asc" },
  });
};

export const getWards = async (provinceId) => {
  const where = {};
  if (provinceId) {
    where.provinceId = provinceId;
  }
  return await prisma.ward.findMany({
    where,
    orderBy: { name: "asc" },
  });
};
