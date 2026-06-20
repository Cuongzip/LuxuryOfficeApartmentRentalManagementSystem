import { z } from "zod";

export const createContractSchema = z.object({
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
  roomIds: z
    .array(
      z
        .string("Mã phòng không được để trống")
        .trim()
        .min(1, "Mã phòng không được để trống")
        .max(10, "Mã phòng không được vượt quá 10 ký tự")
    )
    .min(1, "Hợp đồng phải có ít nhất một phòng")
    .optional(),
  rooms: z
    .array(
      z.object({
        roomId: z.string("Mã phòng không được để trống").trim().min(1),
        agreedPrice: z.coerce.number("Giá thỏa thuận phải là số").nonnegative(),
        startDate: z.coerce.date("Ngày bắt đầu không được để trống"),
        endDate: z.coerce.date("Ngày kết thúc không được để trống"),
      })
    )
    .min(1, "Hợp đồng phải có ít nhất một phòng")
    .optional(),
  startDate: z.coerce.date("Ngày bắt đầu không được để trống").optional(),
  endDate: z.coerce.date("Ngày kết thúc không được để trống").optional(),
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
