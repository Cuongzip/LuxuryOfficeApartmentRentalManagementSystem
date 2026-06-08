import { roomService } from "../services/index.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getRooms = asyncHandler(async (req, res) => {
  const { buildingId, floor, status, page, limit } = req.query;

  const result = await roomService.getRooms({
    buildingId,
    floor,
    status,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const getRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const room = await roomService.getRoomById(id);

  res.json({
    success: true,
    data: room,
  });
});

export const createRoom = asyncHandler(async (req, res) => {
  const newRoom = await roomService.createRoom(req.body);

  res.status(201).json({
    success: true,
    message: "Thêm phòng mới thành công",
    data: newRoom,
  });
});

export const updateRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedRoom = await roomService.updateRoom(id, req.body);

  res.json({
    success: true,
    message: "Cập nhật thông tin phòng thành công",
    data: updatedRoom,
  });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await roomService.deleteRoom(id);

  res.json({
    success: true,
    message: "Xóa phòng thành công",
  });
});

export const updateRoomStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedRoom = await roomService.updateRoomStatus(id, status);

  res.json({
    success: true,
    message: "Cập nhật trạng thái phòng thành công",
    data: updatedRoom,
  });
});
