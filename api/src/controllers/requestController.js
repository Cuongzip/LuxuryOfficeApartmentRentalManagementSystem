import { requestService } from "../services/index.js";
import { asyncHandler } from "../utils/index.js";

export const createRequest = asyncHandler(async (req, res) => {
  const { roomId, appointmentDate, content } = req.body;
  const customerId = req.user.customerId;

  const newRequest = await requestService.createRequest({
    customerId,
    roomId,
    appointmentDate,
    content,
  });

  res.status(201).json({
    success: true,
    message: "Đặt lịch hẹn xem phòng thành công! Yêu cầu của bạn đang chờ Nhân viên quản lý xác nhận.",
    data: newRequest,
  });
});
