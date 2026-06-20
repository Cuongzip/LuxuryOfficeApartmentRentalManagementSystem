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

export const getRequests = asyncHandler(async (req, res) => {
  const { status, requestType, roomId, customerId, employeeId, page, limit } = req.query;

  const result = await requestService.getRequests({
    status,
    requestType,
    roomId,
    customerId,
    employeeId,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const employeeId = req.user.employeeId;

  const updatedRequest = await requestService.updateRequestStatus(id, {
    status,
    employeeId,
  });

  res.json({
    success: true,
    message: "Cập nhật trạng thái yêu cầu thành công.",
    data: updatedRequest,
  });
});
