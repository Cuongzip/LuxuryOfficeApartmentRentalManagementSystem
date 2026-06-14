import jwt from "jsonwebtoken";
import prisma from "../config/database.js";
import { AppError } from "../utils/index.js";
import { ACCOUNT_STATUS } from "../constants/index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Vui lòng đăng nhập để truy cập chức năng này", 401);
  }

  const token = authHeader.split(" ")[1];

  const isBlacklisted = await prisma.blacklistedToken.findUnique({
    where: { token },
  });
  if (isBlacklisted) {
    throw new AppError("Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!", 401);
  }

  const account = await prisma.account.findUnique({
    where: { id: decoded.accountId },
    include: { customer: true, employee: true },
  });

  if (!account) {
    throw new AppError("Tài khoản không tồn tại", 401);
  }

  if (account.status === ACCOUNT_STATUS.LOCKED) {
    throw new AppError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản trị để được hỗ trợ!", 401);
  }

  if (account.status === ACCOUNT_STATUS.PENDING) {
    throw new AppError("Tài khoản chưa được xác thực email. Vui lòng kiểm tra email để xác thực!", 401);
  }

  req.user = {
    accountId: account.id,
    email: account.email,
    role: account.role,
    customerId: account.customer?.id || null,
    employeeId: account.employee?.id || null,
  };

  next();
});

export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError("Bạn không có quyền truy cập chức năng này", 403));
    }
    next();
  };
};
