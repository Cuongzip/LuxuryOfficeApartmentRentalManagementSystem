import prisma from "../config/database.js";
import AppError from "../utils/AppError.js";
import generateId from "../utils/generateId.js";

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

  const account = await prisma.account.create({
    data: {
      id: accountId,
      email,
      password,
      role: "Khach hang",
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
      customer: {
        create: {
          id: customerId,
          fullName,
          nationalId: "000000000000",
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
