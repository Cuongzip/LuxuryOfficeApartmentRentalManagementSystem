import { z } from "zod";

export const createRequestSchema = z.object({
  roomId: z
    .string("Mã phòng không được để trống")
    .trim()
    .min(1, "Mã phòng không được để trống")
    .max(10, "Mã phòng không được vượt quá 10 ký tự"),
  appointmentDate: z
    .string("Ngày hẹn không được để trống")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Ngày hẹn không đúng định dạng ngày giờ",
    }),
  content: z
    .string()
    .trim()
    .max(4000, "Nội dung lời nhắn không được vượt quá 4000 ký tự")
    .optional()
    .nullable(),
});
