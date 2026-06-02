import * as authService from "../services/authService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password, confirmPassword } = req.body;

  await authService.checkDuplicateEmailOrPhone({ email, phone });

  const { token } = await authService.createPendingUser({
    fullName,
    email,
    phone,
    password,
  });

  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const verificationLink = `${baseUrl}/api/auth/verify-email?token=${token}`;

  res.status(201).json({
    success: true,
    message:
      "Tạo tài khoản tạm thời thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
    data: {
      verificationLink,
    },
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.status(400).json({
      success: false,
      message: "Thiếu token xác thực",
    });
    return;
  }

  const account = await authService.verifyEmailToken(token);

  res.json({
    success: true,
    message: "Kích hoạt tài khoản thành công",
    data: {
      id: account.id,
      email: account.email,
      role: account.role,
      status: account.status,
      customer: account.customer
        ? {
            id: account.customer.id,
            fullName: account.customer.fullName,
            phoneNumber: account.customer.phoneNumber,
          }
        : null,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { account, token } = await authService.login({ email, password });

  res.json({
    success: true,
    message: "Đăng nhập thành công",
    data: {
      token,
      account: {
        id: account.id,
        email: account.email,
        role: account.role,
        status: account.status,
        customer: account.customer
          ? {
              id: account.customer.id,
              fullName: account.customer.fullName,
              phoneNumber: account.customer.phoneNumber,
            }
          : null,
      },
    },
  });
});
