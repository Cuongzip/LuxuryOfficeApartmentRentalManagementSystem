import { z } from "zod";

export const buildingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên tòa nhà không được để trống")
    .max(100, "Tên tòa nhà không được vượt quá 100 ký tự"),
  address: z
    .string()
    .trim()
    .min(1, "Địa chỉ không được để trống")
    .max(500, "Địa chỉ không được vượt quá 500 ký tự"),
  numberOfFloors: z.coerce
    .number({ invalid_type_error: "Số tầng phải là số nguyên dương" })
    .int("Số tầng phải là số nguyên dương")
    .positive("Số tầng phải là số nguyên dương"),
  description: z
    .string()
    .trim()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal('')),
});
