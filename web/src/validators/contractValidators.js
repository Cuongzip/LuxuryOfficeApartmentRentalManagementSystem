import { z } from "zod";

export const createContractSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Mã hợp đồng không được để trống")
    .max(10, "Mã hợp đồng không được vượt quá 10 ký tự")
    .toUpperCase(),
  customerId: z
    .string()
    .trim()
    .min(1, "Mã khách hàng không được để trống")
    .max(10, "Mã khách hàng không được vượt quá 10 ký tự"),
  employeeId: z
    .string()
    .trim()
    .min(1, "Mã nhân viên không được để trống")
    .max(10, "Mã nhân viên không được vượt quá 10 ký tự"),
  roomId: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn phòng"),
  startDate: z
    .string()
    .min(1, "Ngày bắt đầu không được để trống"),
  endDate: z
    .string()
    .min(1, "Ngày kết thúc không được để trống"),
  deposit: z.coerce
    .number("Tiền cọc phải là số không âm")
    .nonnegative("Tiền cọc không được nhỏ hơn 0"),
});

export const extendContractSchema = z.object({
  endDate: z
    .string()
    .min(1, "Ngày gia hạn mới không được để trống"),
});
