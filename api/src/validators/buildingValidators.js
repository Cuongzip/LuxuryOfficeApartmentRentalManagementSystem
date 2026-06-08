import { z } from "zod";

export const buildingSchema = z.object({
  name: z
    .string({
      required_error: "Tên tòa nhà không được để trống",
      invalid_type_error: "Tên tòa nhà phải là chuỗi ký tự",
    })
    .trim()
    .min(1, "Tên tòa nhà không được để trống")
    .max(100, "Tên tòa nhà không được vượt quá 100 ký tự"),
  address: z
    .string({
      required_error: "Địa chỉ không được để trống",
      invalid_type_error: "Địa chỉ phải là chuỗi ký tự",
    })
    .trim()
    .min(1, "Địa chỉ không được để trống")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  numberOfFloors: z
    .number({
      required_error: "Số tầng không được để trống",
      invalid_type_error: "Số tầng phải là số nguyên dương",
    })
    .int("Số tầng phải là số nguyên dương")
    .positive("Số tầng phải là số nguyên dương"),
  description: z
    .string()
    .trim()
    .max(1000, "Mô tả không được vượt quá 1000 ký tự")
    .optional()
    .nullable(),
  image: z
    .string()
    .trim()
    .max(255, "Đường dẫn hình ảnh không được vượt quá 255 ký tự")
    .optional()
    .nullable(),
});
