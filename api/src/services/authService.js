import prisma from "../config/database.js";
import AppError from "../utils/AppError.js";
import generateId from "../utils/generateId.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const EMAIL_OR_PHONE_EXISTS_MESSAGE =
  "Email hoặc Số điện thoại này đã được đăng ký. Bạn có muốn Đăng nhập hoặc Khôi phục mật khẩu không?";

export const checkDuplicateEmailOrPhone = async ({ email, phone }) => {
  const [existingAccount, existingCustomer] = await Promise.all([
    prisma.account.findUnique({ where: { email } }),
    prisma.customer.findUnique({ where: { phoneNumber: phone } }),
  ]);

  if (!existingAccount && !existingCustomer) return;

  const errors = {};
  if (existingAccount) {
    errors.email = EMAIL_OR_PHONE_EXISTS_MESSAGE;
  }
  if (existingCustomer) {
    errors.phone = EMAIL_OR_PHONE_EXISTS_MESSAGE;
  }

  throw new AppError("Thông tin đăng ký không hợp lệ", 400, errors);
};

const generateVerificationToken = () => {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
};


export const createPendingUser = async ({
  fullName,
  email,
  phone,
  password,
}) => {
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const customerId = generateId("KH");
  const accountId = generateId("TK");

  const hashedPassword = await bcrypt.hash(password, 10);

  const account = await prisma.account.create({
    data: {
      id: accountId,
      email,
      password: hashedPassword,
      role: "Khach hang",
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
      customer: {
        create: {
          id: customerId,
          fullName,
          nationalId: phone.replace("+84", "0").padStart(12, "0"),
          phoneNumber: phone,
        },
      },
    },
    include: {
      customer: true,
    },
  });

  return { account, token };
};

export const verifyEmailToken = async (token) => {
  const account = await prisma.account.findFirst({
    where: { verificationToken: token },
    include: { customer: true },
  });

  if (!account) {
    throw new AppError("Link xác thực đã hết hạn!", 400);
  }

  if (
    account.verificationTokenExpiresAt &&
    account.verificationTokenExpiresAt < new Date()
  ) {
    throw new AppError("Link xác thực đã hết hạn!", 400);
  }

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: {
      status: "Kich hoat",
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
    include: { customer: true },
  });

  return updated;
};

const sendSecurityEmail = async (email) => {
  console.log(`[MOCK EMAIL] Security Alert sent to ${email}: Your account has been temporarily locked due to too many failed login attempts.`);
};

export const login = async ({ email, password }) => {
  const account = await prisma.account.findUnique({
    where: { email },
    include: { customer: true },
  });

  if (!account) {
    throw new AppError("Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!", 400);
  }

  const now = new Date();

  if (account.lockoutUntil && account.lockoutUntil > now) {
    throw new AppError(
      "Tài khoản của bạn đã bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút!",
      400
    );
  }

  if (account.status === "Bi khoa") {
    throw new AppError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản lý!", 400);
  }

  const isPasswordValid = await bcrypt.compare(password, account.password);

  if (!isPasswordValid) {
    const newFailedAttempts = account.failedAttempts + 1;
    let dataUpdate = { failedAttempts: newFailedAttempts };

    if (newFailedAttempts >= 5) {
      dataUpdate.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
      dataUpdate.failedAttempts = 5;
      await sendSecurityEmail(email);
    }

    await prisma.account.update({
      where: { id: account.id },
      data: dataUpdate,
    });

    if (newFailedAttempts >= 5) {
      throw new AppError(
        "Tài khoản của bạn đã bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút!",
        400
      );
    } else {
      throw new AppError("Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!", 400);
    }
  }

  if (account.failedAttempts > 0 || account.lockoutUntil) {
    await prisma.account.update({
      where: { id: account.id },
      data: {
        failedAttempts: 0,
        lockoutUntil: null,
      },
    });
  }

  const token = jwt.sign(
    {
      accountId: account.id,
      email: account.email,
      role: account.role,
      customerId: account.customerId,
    },
    process.env.JWT_SECRET || "super-secret-key-123456",
    { expiresIn: "7d" }
  );

  return { account, token };
};
