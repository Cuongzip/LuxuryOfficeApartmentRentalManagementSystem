import { z } from "zod";
import { ROOM_STATUS, ROOM_TYPES } from "../constants/index.js";

export const roomSchema = z.object({
  roomNumber: z
    .string("Số phòng không được để trống")
    .trim()
    .min(1, "Số phòng không được để trống")
    .max(10, "Số phòng không được vượt quá 10 ký tự"),
  buildingId: z
    .string("Mã tòa nhà không được để trống")
    .trim()
    .min(1, "Mã tòa nhà không được để trống")
    .max(10, "Mã tòa nhà không được vượt quá 10 ký tự"),
  floor: z.coerce
    .number("Tầng phải là số nguyên không âm")
    .int("Tầng phải là số nguyên")
    .nonnegative("Tầng phải là số nguyên không âm"),
  type: z.enum([ROOM_TYPES.OFFICE, ROOM_TYPES.APARTMENT], {
    message: `Loại phòng phải là: ${Object.values(ROOM_TYPES).join(", ")}`,
  }),
  area: z.coerce
    .number("Diện tích phải là số dương")
    .positive("Diện tích phải là số dương"),
  price: z.coerce
    .number("Giá thuê phải là số dương")
    .positive("Giá thuê phải là số dương"),
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

export const updateRoomSchema = roomSchema;

export const roomStatusSchema = z.object({
  status: z.enum([ROOM_STATUS.AVAILABLE, ROOM_STATUS.RENTED, ROOM_STATUS.MAINTENANCE], {
    message: `Trạng thái phòng phải thuộc: ${Object.values(ROOM_STATUS).join(", ")}`,
  }),
});
