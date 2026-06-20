export const REQUEST_STATUS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã chấp nhận",
  COMPLETED: "Đã hoàn tất",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

export const REQUEST_STATUS_COLORS = {
  "Chờ duyệt": "bg-amber-100 text-amber-800 border-amber-200",
  "Đã chấp nhận": "bg-blue-100 text-blue-800 border-blue-200",
  "Đã hoàn tất": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Từ chối": "bg-red-100 text-red-800 border-red-200",
  "Đã hủy": "bg-zinc-100 text-zinc-800 border-zinc-200",
};

export const REQUEST_TYPES = {
  VIEW_ROOM: "Xem phòng",
  REPORT: "Báo cáo",
};
