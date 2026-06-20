export const PAYMENT_STATUS = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
  PARTIALLY_PAID: 'Thanh toán một phần',
  PENDING_CONFIRMATION: 'Chờ xác nhận',
};

export const PAYMENT_STATUS_COLORS = {
  'Chưa thanh toán': 'bg-amber-100 text-amber-800 border-amber-200',
  'Đã thanh toán': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Quá hạn': 'bg-red-100 text-red-800 border-red-200',
  'Thanh toán một phần': 'bg-blue-100 text-blue-800 border-blue-200',
  'Chờ xác nhận': 'bg-purple-100 text-purple-800 border-purple-200',
};
