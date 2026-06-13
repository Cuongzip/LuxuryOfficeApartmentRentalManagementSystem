import { z } from "zod";
import { ROOM_STATUS } from "../constants/index.js";

export const roomSchema = z.object({
  id: z
    .string("Mã phòng không được để trống")
    .trim()
    .min(1, "Mã phòng không được để trống")
    .max(10, "Mã phòng không được vượt quá 10 ký tự")
    .toUpperCase(),
  buildingId: z
    .string("Mã tòa nhà không được để trống")
    .trim()
    .min(1, "Mã tòa nhà không được để trống")
    .max(10, "Mã tòa nhà không được vượt quá 10 ký tự"),
  floor: z.coerce
    .number({ invalid_type_error: "Tầng phải là số nguyên dương" })
    .int("Tầng phải là số nguyên")
    .positive("Tầng phải là số nguyên dương"),
  type: z
    .string("Loại phòng không được để trống")
    .trim()
    .min(1, "Loại phòng không được để trống")
    .max(20, "Loại phòng không được vượt quá 20 ký tự"),
  area: z.coerce
    .number({ invalid_type_error: "Diện tích phải là số dương" })
    .positive("Diện tích phải là số dương"),
  price: z.coerce
    .number({ invalid_type_error: "Đơn giá thuê phải là số dương" })
    .positive("Đơn giá thuê phải là số dương"),
  status: z.enum([ROOM_STATUS.AVAILABLE, ROOM_STATUS.RENTED, ROOM_STATUS.MAINTENANCE], {
    message: `Trạng thái phòng phải thuộc: ${Object.values(ROOM_STATUS).join(", ")}`,
  }),
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
  maxPeople: z.coerce
    .number()
    .int()
    .positive()
    .default(2)
    .optional(),
  confirmPriceChange: z
    .preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
});

export const updateRoomSchema = roomSchema.omit({ id: true });

export const roomStatusSchema = z.object({
  status: z.enum([ROOM_STATUS.AVAILABLE, ROOM_STATUS.RENTED, ROOM_STATUS.MAINTENANCE], {
    message: `Trạng thái phòng phải thuộc: ${Object.values(ROOM_STATUS).join(", ")}`,
  }),
});
