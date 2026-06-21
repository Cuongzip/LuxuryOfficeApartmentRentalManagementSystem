import { z } from "zod";

export const residentSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Họ và tên không được để trống")
    .max(100, "Họ và tên không được vượt quá 100 ký tự"),
  nationalId: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Số CCCD phải gồm đúng 12 chữ số"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0"),
  residencyType: z
    .string()
    .trim()
    .max(20, "Loại cư trú không được vượt quá 20 ký tự")
    .default("Cư dân"),
  residencyStatus: z
    .string()
    .trim()
    .max(20, "Trạng thái cư trú không được vượt quá 20 ký tự")
    .default("Tạm trú"),
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .nullable(),
  gender: z
    .string()
    .trim()
    .max(20, "Giới tính không được vượt quá 20 ký tự")
    .optional()
    .or(z.literal(''))
    .nullable(),
  contractId: z
    .string()
    .trim()
    .min(1, "Mã hợp đồng không được để trống")
    .max(10, "Mã hợp đồng không được vượt quá 10 ký tự"),
  roomId: z
    .string()
    .trim()
    .min(1, "Mã phòng không được để trống")
    .max(10, "Mã phòng không được vượt quá 10 ký tự"),
});
