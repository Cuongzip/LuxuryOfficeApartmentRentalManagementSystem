import { z } from "zod";
import { OCCUPANCY_TYPES, OCCUPANCY_STATUS } from "../constants/index.js";

export const createOccupantSchema = z.object({
  fullName: z
    .string("Họ và tên không được để trống")
    .trim()
    .min(1, "Họ và tên không được để trống")
    .max(100, "Họ và tên không được vượt quá 100 ký tự"),
  nationalId: z
    .string("Số CCCD không được để trống")
    .trim()
    .regex(/^\d{12}$/, "Số CCCD phải gồm đúng 12 chữ số"),
  phoneNumber: z
    .string("Số điện thoại không được để trống")
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0"),
  occupancyType: z.enum([OCCUPANCY_TYPES.OCCUPANT, OCCUPANCY_TYPES.STAFF], {
    errorMap: () => ({ message: `Loại lưu trú phải thuộc: ${Object.values(OCCUPANCY_TYPES).join(", ")}` }),
  })
    .default(OCCUPANCY_TYPES.OCCUPANT)
    .optional(),
  occupancyStatus: z.enum([OCCUPANCY_STATUS.TEMPORARY, OCCUPANCY_STATUS.WORKING, OCCUPANCY_STATUS.DEPARTED], {
    errorMap: () => ({ message: `Trạng thái lưu trú phải thuộc: ${Object.values(OCCUPANCY_STATUS).join(", ")}` }),
  })
    .default(OCCUPANCY_STATUS.TEMPORARY)
    .optional(),
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
  gender: z
    .string()
    .trim()
    .max(20, "Giới tính không được vượt quá 20 ký tự")
    .optional()
    .nullable(),
  contractId: z
    .string("Mã hợp đồng không được để trống")
    .trim()
    .min(1, "Mã hợp đồng không được để trống")
    .max(10, "Mã hợp đồng không được vượt quá 10 ký tự"),
  roomId: z
    .string("Mã phòng không được để trống")
    .trim()
    .min(1, "Mã phòng không được để trống")
    .max(10, "Mã phòng không được vượt quá 10 ký tự"),
});

export const updateOccupantSchema = createOccupantSchema;
