import { z } from "zod";

export const roomSchema = z.object({
  roomNumber: z
    .string()
    .trim()
    .min(1, "Số phòng không được để trống")
    .max(10, "Số phòng không được vượt quá 10 ký tự"),
  buildingId: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn tòa nhà"),
  type: z
    .string()
    .trim()
    .min(1, "Loại phòng không được để trống"),
  floor: z.coerce
    .number({ invalid_type_error: "Tầng phải là số nguyên dương" })
    .int("Tầng phải là số nguyên")
    .nonnegative("Tầng không được nhỏ hơn 0"),
  area: z.coerce
    .number({ invalid_type_error: "Diện tích phải là số dương" })
    .positive("Diện tích phải là số dương"),
  price: z.coerce
    .number({ invalid_type_error: "Đơn giá thuê phải là số dương" })
    .positive("Đơn giá thuê phải là số dương"),
  status: z
    .string()
    .trim()
    .min(1, "Trạng thái không được để trống"),
  maxPeople: z.coerce
    .number({ invalid_type_error: "Số người tối đa phải là số nguyên dương" })
    .int("Số người tối đa phải là số nguyên")
    .positive("Số người tối đa phải là số nguyên dương"),
  description: z
    .string()
    .trim()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal('')),
});
