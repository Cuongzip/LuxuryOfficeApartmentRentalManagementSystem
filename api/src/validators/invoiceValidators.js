import { z } from "zod";

export const createInvoiceSchema = z.object({
  contractId: z
    .string("Mã hợp đồng không được để trống")
    .trim()
    .min(1, "Mã hợp đồng không được để trống")
    .max(10, "Mã hợp đồng không hợp lệ"),
  month: z.coerce
    .number("Tháng phải là một số")
    .int("Tháng phải là số nguyên")
    .min(1, "Tháng phải từ 1 đến 12")
    .max(12, "Tháng phải từ 1 đến 12"),
  year: z.coerce
    .number("Năm phải là một số")
    .int("Năm phải là số nguyên")
    .min(2000, "Năm không hợp lệ"),
  dueDate: z.coerce.date("Ngày hết hạn không hợp lệ").optional(),
  roomReadings: z
    .array(
      z.object({
        roomId: z
          .string("Mã phòng không được để trống")
          .trim()
          .min(1, "Mã phòng không được để trống")
          .max(10, "Mã phòng không hợp lệ"),
        electricityIndex: z.coerce
          .number("Chỉ số điện phải là số")
          .int("Chỉ số điện phải là số nguyên")
          .nonnegative("Chỉ số điện không được là số âm"),
        waterIndex: z.coerce
          .number("Chỉ số nước phải là số")
          .int("Chỉ số nước phải là số nguyên")
          .nonnegative("Chỉ số nước không được là số âm"),
      })
    )
    .min(1, "Phải cung cấp chỉ số điện nước cho ít nhất một phòng"),
});

export const recordPaymentSchema = z.object({
  amountPaid: z.coerce
    .number("Số tiền trả phải là số")
    .positive("Số tiền thanh toán phải lớn hơn 0"),
  paymentMethod: z
    .string("Phương thức thanh toán không được để trống")
    .trim()
    .min(1, "Phương thức thanh toán không được để trống")
    .max(20, "Phương thức thanh toán không được vượt quá 20 ký tự"),
  payerName: z
    .string()
    .trim()
    .max(255, "Tên người nộp không được quá 255 ký tự")
    .optional(),
  transactionId: z
    .string()
    .trim()
    .max(100, "Mã giao dịch không được quá 100 ký tự")
    .optional(),
});

export const submitPaymentRequestSchema = z.object({
  amountPaid: z.coerce
    .number("Số tiền trả phải là số")
    .positive("Số tiền thanh toán phải lớn hơn 0"),
  paymentMethod: z
    .string("Phương thức thanh toán không được để trống")
    .trim()
    .min(1, "Phương thức thanh toán không được để trống")
    .max(20, "Phương thức thanh toán không được vượt quá 20 ký tự"),
  payerName: z
    .string()
    .trim()
    .max(255, "Tên người nộp không được quá 255 ký tự")
    .optional(),
  transactionId: z
    .string()
    .trim()
    .max(100, "Mã giao dịch không được quá 100 ký tự")
    .optional(),
});
