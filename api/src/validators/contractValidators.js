import { z } from "zod";

export const createContractSchema = z.object({
  id: z
    .string("Mã hợp đồng không được để trống")
    .trim()
    .min(1, "Mã hợp đồng không được để trống")
    .max(10, "Mã hợp đồng không được vượt quá 10 ký tự")
    .toUpperCase(),
  customerId: z
    .string("Mã khách hàng không được để trống")
    .trim()
    .min(1, "Mã khách hàng không được để trống")
    .max(10, "Mã khách hàng không được vượt quá 10 ký tự"),
  employeeId: z
    .string("Mã nhân viên không được để trống")
    .trim()
    .min(1, "Mã nhân viên không được để trống")
    .max(10, "Mã nhân viên không được vượt quá 10 ký tự"),
  roomId: z
    .string("Mã phòng không được để trống")
    .trim()
    .min(1, "Mã phòng không được để trống")
    .max(10, "Mã phòng không được vượt quá 10 ký tự"),
  startDate: z.coerce.date("Ngày bắt đầu không được để trống"),
  endDate: z.coerce.date("Ngày kết thúc không được để trống"),
  deposit: z
    .number("Tiền cọc không được để trống")
    .nonnegative("Tiền cọc không được âm")
    .default(0),
});

export const extendContractSchema = z.object({
  endDate: z.coerce.date("Ngày hết hạn mới không được để trống"),
});

export const cancelContractSchema = z.object({
  force: z.boolean().optional().default(false),
});
