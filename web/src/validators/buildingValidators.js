import { z } from "zod";

export const buildingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên tòa nhà không được để trống")
    .max(100, "Tên tòa nhà không được vượt quá 100 ký tự"),
  provinceId: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn tỉnh thành"),
  wardId: z
    .string()
    .trim()
    .min(1, "Vui lòng chọn phường xã"),
  detailAddress: z
    .string()
    .trim()
    .min(1, "Địa chỉ chi tiết không được để trống")
    .max(255, "Địa chỉ chi tiết không được vượt quá 255 ký tự"),
  numberOfFloors: z.coerce
    .number("Số tầng phải là số nguyên dương")
    .int("Số tầng phải là số nguyên dương")
    .positive("Số tầng phải là số nguyên dương"),
  description: z
    .string()
    .trim()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal('')),
});

