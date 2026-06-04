import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string("Họ và tên không được để trống")
      .trim()
      .min(1, "Họ và tên không được để trống"),
    email: z
      .string("Email không đúng định dạng")
      .trim()
      .email("Email không đúng định dạng"),
    phone: z
      .string("Số điện thoại không hợp lệ")
      .trim()
      .regex(/^(0|\+84)(\d{9})$/, "Số điện thoại không hợp lệ"),
    password: z
      .string("Mật khẩu phải có ít nhất 8 ký tự")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string("Mật khẩu nhập lại không khớp"),
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: 'Mật khẩu nhập lại không khớp',
      path: ['confirmPassword'],
    }
  )
  ;

export const loginSchema = z.object({
  email: z
    .string("Email không đúng định dạng")
    .trim()
    .email("Email không đúng định dạng"),
  password: z
    .string("Mật khẩu không được để trống")
    .min(1, "Mật khẩu không được để trống"),
});
