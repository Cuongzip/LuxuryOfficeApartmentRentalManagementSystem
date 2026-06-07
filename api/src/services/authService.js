import prisma from "../config/database.js";
import { AppError, generateId } from "../utils/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ACCOUNT_STATUS, ROLES, AUTH, ID_PREFIXES } from "../constants/index.js";
import * as mailService from "./mailService.js";


const LOCKOUT_MESSAGE =
  "Tài khoản của bạn đã bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút!";

export const checkDuplicateEmailOrPhone = async ({ email, phone }) => {
  const [existingAccount, existingCustomer] = await Promise.all([
    prisma.account.findUnique({ where: { email } }),
    prisma.customer.findUnique({ where: { phoneNumber: phone } }),
  ]);

  if (!existingAccount && !existingCustomer) return;

  const errors = {};
  if (existingAccount) {
    errors.email = "Email này đã được đăng ký";
  }
  if (existingCustomer) {
    errors.phone = "Số điện thoại này đã được đăng ký";
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
  const expiresAt = new Date(Date.now() + AUTH.VERIFICATION_TOKEN_EXPIRY_MS);

  const customerId = generateId(ID_PREFIXES.CUSTOMER);
  const accountId = generateId(ID_PREFIXES.ACCOUNT);

  const hashedPassword = await bcrypt.hash(password, AUTH.BCRYPT_SALT_ROUNDS);

  const account = await prisma.account.create({
    data: {
      id: accountId,
      email,
      password: hashedPassword,
      role: ROLES.CUSTOMER,
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
      customer: {
        create: {
          id: customerId,
          fullName,
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
      status: ACCOUNT_STATUS.ACTIVE,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
    include: { customer: true },
  });

  return updated;
};



export const login = async ({ email, password }) => {
  const account = await prisma.account.findUnique({
    where: { email },
    include: { customer: true, employee: true },
  });

  if (!account) {
    throw new AppError("Tên đăng nhập hoặc mật khẩu không chính xác", 400);
  }

  if (account.status === ACCOUNT_STATUS.LOCKED) {
    throw new AppError("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản trị để được hỗ trợ!", 400);
  }

  if (account.status === ACCOUNT_STATUS.PENDING) {
    throw new AppError("Tài khoản chưa được xác thực email. Vui lòng kiểm tra email để xác thực!", 400);
  }

  const now = new Date();

  if (account.lockoutUntil && account.lockoutUntil > now) {
    throw new AppError(LOCKOUT_MESSAGE, 400);
  }

  const isPasswordValid = await bcrypt.compare(password, account.password);

  if (!isPasswordValid) {
    const newFailedAttempts = account.failedAttempts + 1;
    let dataUpdate = { failedAttempts: newFailedAttempts };

    if (newFailedAttempts >= AUTH.MAX_FAILED_ATTEMPTS) {
      dataUpdate.lockoutUntil = new Date(Date.now() + AUTH.LOCKOUT_DURATION_MS);
      dataUpdate.failedAttempts = AUTH.MAX_FAILED_ATTEMPTS;
      await mailService.sendSecurityEmail(email);
    }

    await prisma.account.update({
      where: { id: account.id },
      data: dataUpdate,
    });

    if (newFailedAttempts >= AUTH.MAX_FAILED_ATTEMPTS) {
      throw new AppError(LOCKOUT_MESSAGE, 400);
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
      customerId: account.customer?.id,
      employeeId: account.employee?.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: AUTH.JWT_EXPIRY }
  );

  return { account, token };
};
