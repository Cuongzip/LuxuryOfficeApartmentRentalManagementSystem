import { z } from "zod";

export const buildingSchema = z.object({
  name: z
    .string("Tên tòa nhà không được để trống")
    .trim()
    .min(1, "Tên tòa nhà không được để trống")
    .max(100, "Tên tòa nhà không được vượt quá 100 ký tự"),
  wardId: z
    .string("Mã phường/xã không được để trống")
    .trim()
    .min(1, "Mã phường/xã không được để trống")
    .max(10, "Mã phường/xã không được vượt quá 10 ký tự"),
  detailAddress: z
    .string("Địa chỉ chi tiết không được để trống")
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
    .nullable(),
  images: z
    .array(
      z.union([
        z.string().trim().max(2048, "Đường dẫn hình ảnh không được vượt quá 2048 ký tự"),
        z.object({
          imagePath: z.string().trim().max(2048, "Đường dẫn hình ảnh không được vượt quá 2048 ký tự"),
          displayOrder: z.number().int().nonnegative().optional(),
          isPrimary: z.boolean().optional(),
        }),
      ])
    )
    .optional()
    .nullable(),
});
