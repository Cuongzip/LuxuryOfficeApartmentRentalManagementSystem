import { z } from "zod";

export const createContractSchema = z.object({
  customerId: z
    .string()
    .trim()
    .min(1, "Mã khách hàng không được để trống")
    .max(10, "Mã khách hàng không được vượt quá 10 ký tự"),
  rooms: z
    .array(
      z.object({
        roomId: z.string().trim().min(1, "Vui lòng chọn phòng"),
        agreedPrice: z.coerce.number().nonnegative("Giá thuê phải là số không âm"),
        startDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
        endDate: z.string().min(1, "Ngày kết thúc không được để trống"),
      })
    )
    .min(1, "Vui lòng chọn ít nhất một phòng"),
  deposit: z.coerce
    .number("Tiền cọc phải là số không âm")
    .nonnegative("Tiền cọc không được nhỏ hơn 0"),
});

export const extendContractSchema = z.object({
  endDate: z
    .string()
    .min(1, "Ngày gia hạn mới không được để trống"),
});
