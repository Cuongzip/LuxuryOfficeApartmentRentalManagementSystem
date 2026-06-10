import { z } from "zod";

export const createContractSchema = z.object({
  id: z
    .string({
      required_error: "Mã hợp đồng không được để trống",
      invalid_type_error: "Mã hợp đồng phải là chuỗi ký tự",
    })
    .trim()
    .min(1, "Mã hợp đồng không được để trống")
    .max(10, "Mã hợp đồng không được vượt quá 10 ký tự")
    .toUpperCase(),
  customerId: z
    .string({
      required_error: "Mã khách hàng không được để trống",
      invalid_type_error: "Mã khách hàng phải là chuỗi ký tự",
    })
    .trim()
    .min(1, "Mã khách hàng không được để trống")
    .max(10, "Mã khách hàng không được vượt quá 10 ký tự"),
  employeeId: z
    .string({
      required_error: "Mã nhân viên không được để trống",
      invalid_type_error: "Mã nhân viên phải là chuỗi ký tự",
    })
    .trim()
    .min(1, "Mã nhân viên không được để trống")
    .max(10, "Mã nhân viên không được vượt quá 10 ký tự"),
  roomId: z
    .string({
      required_error: "Mã phòng không được để trống",
      invalid_type_error: "Mã phòng phải là chuỗi ký tự",
    })
    .trim()
    .min(1, "Mã phòng không được để trống")
    .max(10, "Mã phòng không được vượt quá 10 ký tự"),
  startDate: z.coerce.date({
    required_error: "Ngày bắt đầu không được để trống",
    invalid_type_error: "Ngày bắt đầu không đúng định dạng ngày",
  }),
  endDate: z.coerce.date({
    required_error: "Ngày kết thúc không được để trống",
    invalid_type_error: "Ngày kết thúc không đúng định dạng ngày",
  }),
  deposit: z
    .number({
      required_error: "Tiền cọc không được để trống",
      invalid_type_error: "Tiền cọc phải là số",
    })
    .nonnegative("Tiền cọc không được âm")
    .default(0),
});

export const extendContractSchema = z.object({
  endDate: z.coerce.date({
    required_error: "Ngày hết hạn mới không được để trống",
    invalid_type_error: "Ngày hết hạn mới không đúng định dạng ngày",
  }),
});

export const cancelContractSchema = z.object({
  force: z.boolean().optional().default(false),
});
