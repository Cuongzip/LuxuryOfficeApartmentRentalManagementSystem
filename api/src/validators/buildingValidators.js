import { z } from "zod";

export const buildingSchema = z.object({
  name: z
    .string("Tên tòa nhà không được để trống")
    .trim()
    .min(1, "Tên tòa nhà không được để trống")
    .max(100, "Tên tòa nhà không được vượt quá 100 ký tự"),
  address: z
    .string("Địa chỉ không được để trống")
    .trim()
    .min(1, "Địa chỉ không được để trống")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  numberOfFloors: z.coerce
    .number({ invalid_type_error: "Số tầng phải là số nguyên dương" })
    .int("Số tầng phải là số nguyên dương")
    .positive("Số tầng phải là số nguyên dương"),
  description: z
    .string()
    .trim()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional()
    .nullable(),
  images: z
    .array(
      z.union([
        z.string().trim().max(255, "Đường dẫn hình ảnh không được vượt quá 255 ký tự"),
        z.object({
          imagePath: z.string().trim().max(255, "Đường dẫn hình ảnh không được vượt quá 255 ký tự"),
          displayOrder: z.number().int().nonnegative().optional(),
          isPrimary: z.boolean().optional(),
        }),
      ])
    )
    .optional()
    .nullable(),
});
